/**
 * Identity Graph Engine (กราฟเชื่อมโยงตัวตนมิจฉาชีพ)
 * 
 * กฎเหล็ก:
 * - ทุกสิ่งที่พบในแชทข้อความเดียวกัน = มีความเชื่อมโยงกัน (Co-occurrence Edge)
 * - เมื่อบัญชีหนึ่งถูกตรวจพบว่ามีประวัติเสี่ยง หรือมีการรายงาน -> ความเสี่ยงจะส่งต่อไปยัง เบอร์โทร / LINE / เพจ / บัญชีอื่นๆ ที่ผูกกันทันที
 */

const { pool, isPostgres } = require('./postgres');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GRAPH_FILE = path.join(DATA_DIR, 'graph.json');

// Local fallback store
let localGraph = { entities: {}, edges: {} };
if (fs.existsSync(GRAPH_FILE)) {
  try {
    localGraph = JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8'));
  } catch (e) {}
}

function persistLocal() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(GRAPH_FILE, JSON.stringify(localGraph), 'utf8');
}

/**
 * บันทึก Entities และสร้างความเชื่อมโยง (Edges) ระหว่างกัน
 */
async function recordEntitiesAndEdges(entitiesList) {
  if (!entitiesList || entitiesList.length === 0) return;
  const now = new Date().toISOString();

  if (isPostgres()) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Upsert Entities
      for (const ent of entitiesList) {
        const key = ent.key;
        const type = ent.type;
        const label = ent.digits || ent.val || ent.url || ent.raw || key;

        await client.query(
          `INSERT INTO entities (entity_key, entity_type, label, query_count, first_seen, last_seen)
           VALUES ($1, $2, $3, 1, $4, $4)
           ON CONFLICT (entity_key) DO UPDATE
           SET query_count = entities.query_count + 1,
               last_seen = $4`,
          [key, type, label, now]
        );
      }

      // 2. Upsert Undirected Edges (เชื่อมโยงแบบไขว้กันทุกคู่)
      for (let i = 0; i < entitiesList.length; i++) {
        for (let j = i + 1; j < entitiesList.length; j++) {
          const k1 = entitiesList[i].key;
          const k2 = entitiesList[j].key;
          if (k1 === k2) continue;

          // ใส่ทั้ง 2 ทิศทางเพื่อให้ค้นหาง่าย
          const pairs = [
            [k1, k2],
            [k2, k1],
          ];

          for (const [src, tgt] of pairs) {
            await client.query(
              `INSERT INTO entity_edges (source_key, target_key, occurrences, first_seen, last_seen)
               VALUES ($1, $2, 1, $3, $3)
               ON CONFLICT (source_key, target_key) DO UPDATE
               SET occurrences = entity_edges.occurrences + 1,
                   last_seen = $3`,
              [src, tgt, now]
            );
          }
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[graph] บันทึกกราฟไม่สำเร็จ:', err);
    } finally {
      client.release();
    }
  } else {
    // Local fallback
    for (const ent of entitiesList) {
      const key = ent.key;
      if (!localGraph.entities[key]) {
        localGraph.entities[key] = {
          key,
          type: ent.type,
          label: ent.digits || ent.val || ent.url || key,
          queryCount: 0,
          reportsCount: 0,
          firstSeen: now,
          lastSeen: now,
        };
      }
      localGraph.entities[key].queryCount += 1;
      localGraph.entities[key].lastSeen = now;
    }

    for (let i = 0; i < entitiesList.length; i++) {
      for (let j = i + 1; j < entitiesList.length; j++) {
        const k1 = entitiesList[i].key;
        const k2 = entitiesList[j].key;
        if (k1 === k2) continue;
        const edgeId1 = `${k1}->${k2}`;
        const edgeId2 = `${k2}->${k1}`;

        localGraph.edges[edgeId1] = (localGraph.edges[edgeId1] || 0) + 1;
        localGraph.edges[edgeId2] = (localGraph.edges[edgeId2] || 0) + 1;
      }
    }
    persistLocal();
  }
}

/**
 * สำรวจกราฟ: ดึงเพื่อนบ้านและตัวตนที่เชื่อมโยง (Connected Network)
 */
async function inspectNetwork(entityKeys) {
  if (!entityKeys || entityKeys.length === 0) {
    return { directEntities: [], connectedEntities: [], hasRiskPropagation: false, networkRiskScore: 0 };
  }

  const results = {
    directEntities: [],
    connectedEntities: [],
    hasRiskPropagation: false,
    maxReports: 0,
    maxQueryCount: 0,
    networkSummary: [],
  };

  if (isPostgres()) {
    try {
      // ดึงข้อมูล Direct Entities
      const directRes = await pool.query(
        'SELECT * FROM entities WHERE entity_key = ANY($1)',
        [entityKeys]
      );
      results.directEntities = directRes.rows;

      // ดึง Connected Entities (ผ่าน Edge)
      const edgeRes = await pool.query(
        `SELECT e.*, ee.occurrences 
         FROM entity_edges ee
         JOIN entities e ON e.entity_key = ee.target_key
         WHERE ee.source_key = ANY($1) AND NOT (ee.target_key = ANY($1))`,
        [entityKeys]
      );
      results.connectedEntities = edgeRes.rows;
    } catch (err) {
      console.error('[graph] inspectNetwork error:', err);
    }
  } else {
    // Local fallback
    for (const k of entityKeys) {
      if (localGraph.entities[k]) results.directEntities.push(localGraph.entities[k]);
      // ค้นหา connected
      for (const [edgeKey, count] of Object.entries(localGraph.edges)) {
        const [src, tgt] = edgeKey.split('->');
        if (src === k && !entityKeys.includes(tgt) && localGraph.entities[tgt]) {
          results.connectedEntities.push({ ...localGraph.entities[tgt], occurrences: count });
        }
      }
    }
  }

  // ประเมินความเสี่ยงและส่งต่อความเสี่ยง (Risk Propagation)
  const allNodes = [...results.directEntities, ...results.connectedEntities];
  for (const node of allNodes) {
    const qCount = node.query_count || node.queryCount || 0;
    const rCount = node.scam_reports_count || node.reportsCount || 0;

    if (qCount > results.maxQueryCount) results.maxQueryCount = qCount;
    if (rCount > results.maxReports) results.maxReports = rCount;

    if (rCount > 0) {
      results.hasRiskPropagation = true;
    }
  }

  if (results.connectedEntities.length > 0) {
    const lines = results.connectedEntities.filter((x) => (x.entity_type || x.type) === 'line');
    const phones = results.connectedEntities.filter((x) => (x.entity_type || x.type) === 'phone');
    const otherAccs = results.connectedEntities.filter((x) => (x.entity_type || x.type) === 'account');

    if (lines.length > 0) results.networkSummary.push(`ผูกกับ LINE ID: ${lines.map((l) => l.label).join(', ')}`);
    if (phones.length > 0) results.networkSummary.push(`ผูกกับเบอร์โทร: ${phones.map((p) => p.label).join(', ')}`);
    if (otherAccs.length > 0) results.networkSummary.push(`เคยพบร่วมกับบัญชีอื่นอีก ${otherAccs.length} บัญชี`);
  }

  return results;
}

/**
 * แจ้งเคสโดนโกงจริง (Scam Report)
 */
async function submitScamReport(entityKeys, category, details, ip) {
  const now = new Date().toISOString();
  if (isPostgres()) {
    try {
      await pool.query(
        'INSERT INTO scam_reports (entity_keys, category, details, ip_hash, created_at) VALUES ($1, $2, $3, $4, $5)',
        [JSON.stringify(entityKeys), category, details, ip || null, now]
      );
      // เพิ่มรายงานความเสี่ยงใน Entities
      await pool.query(
        'UPDATE entities SET scam_reports_count = scam_reports_count + 1 WHERE entity_key = ANY($1)',
        [entityKeys]
      );
      return true;
    } catch (err) {
      console.error('[graph] report error:', err);
      return false;
    }
  } else {
    for (const k of entityKeys) {
      if (localGraph.entities[k]) {
        localGraph.entities[k].reportsCount = (localGraph.entities[k].reportsCount || 0) + 1;
      }
    }
    persistLocal();
    return true;
  }
}

/**
 * ดึงสถิติกราฟรวมสำหรับหน้า /stats
 */
async function getGraphStats() {
  if (isPostgres()) {
    try {
      const entRes = await pool.query('SELECT COUNT(*) FROM entities');
      const edgeRes = await pool.query('SELECT COUNT(*) FROM entity_edges');
      const repRes = await pool.query('SELECT COUNT(*) FROM scam_reports');
      return {
        totalEntities: parseInt(entRes.rows[0].count, 10),
        totalEdges: parseInt(edgeRes.rows[0].count, 10),
        totalReports: parseInt(repRes.rows[0].count, 10),
      };
    } catch (e) {
      return { totalEntities: 0, totalEdges: 0, totalReports: 0 };
    }
  } else {
    return {
      totalEntities: Object.keys(localGraph.entities).length,
      totalEdges: Object.keys(localGraph.edges).length,
      totalReports: 0,
    };
  }
}

module.exports = {
  recordEntitiesAndEdges,
  inspectNetwork,
  submitScamReport,
  getGraphStats,
};
