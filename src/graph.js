/**
 * Identity Graph Engine (Privacy-Preserving & Moderated)
 * 
 * กฎความปลอดภัย & ความเป็นส่วนตัว:
 * 1. ทุก Entity Key คือ Hash ทางเดียว ไม่เก็บเลขบัญชี/เบอร์โทรจริง
 * 2. Label เก็บเฉพาะตัวเลขที่ Mask แล้ว (เช่น ***-***-1234)
 * 3. รายงานข้อพิพาท (Scam Reports) จะอยู่ในสถานะ Pending (รอตรวจ) เสมอ และไม่มีผลต่อคะแนนความเสี่ยงจนกว่าแอดมินจะตรวจสอบและอนุมัติ
 * 4. ไม่มีการชี้ตัวว่าเป็นมิจฉาชีพ ใช้คำว่า "มีผู้แจ้งข้อพิพาทเข้ามา"
 */

const { pool, isPostgres } = require('./postgres');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GRAPH_FILE = path.join(DATA_DIR, 'graph.json');

let localGraph = { entities: {}, edges: {}, reports: [] };
if (fs.existsSync(GRAPH_FILE)) {
  try {
    localGraph = JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8'));
    if (!localGraph.entities) localGraph.entities = {};
    if (!localGraph.edges) localGraph.edges = {};
    if (!localGraph.reports) localGraph.reports = [];
  } catch (e) {}
}

function persistLocal() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(GRAPH_FILE, JSON.stringify(localGraph), 'utf8');
}

/**
 * บันทึก Entities และ Edges (เฉพาะจากแหล่งที่เชื่อถือได้ เช่น LINE Webhook)
 */
async function recordEntitiesAndEdges(entitiesList) {
  if (!entitiesList || entitiesList.length === 0) return;
  const now = new Date().toISOString();

  if (isPostgres()) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const ent of entitiesList) {
        const key = ent.key;
        const type = ent.type;
        const label = ent.label || '***';

        await client.query(
          `INSERT INTO entities (entity_key, entity_type, label, query_count, first_seen, last_seen)
           VALUES ($1, $2, $3, 1, $4, $4)
           ON CONFLICT (entity_key) DO UPDATE
           SET query_count = entities.query_count + 1,
               last_seen = $4`,
          [key, type, label, now]
        );
      }

      for (let i = 0; i < entitiesList.length; i++) {
        for (let j = i + 1; j < entitiesList.length; j++) {
          const k1 = entitiesList[i].key;
          const k2 = entitiesList[j].key;
          if (k1 === k2) continue;

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
          label: ent.label || '***',
          queryCount: 0,
          verifiedReportsCount: 0,
          pendingReportsCount: 0,
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
 * สำรวจกราฟ (Read-Only)
 */
async function inspectNetwork(entityKeys) {
  if (!entityKeys || entityKeys.length === 0) {
    return { directEntities: [], connectedEntities: [], verifiedReports: 0, pendingReports: 0, networkSummary: [] };
  }

  const results = {
    directEntities: [],
    connectedEntities: [],
    verifiedReports: 0,
    pendingReports: 0,
    networkSummary: [],
    maxQueryCount: 0,
  };

  if (isPostgres()) {
    try {
      const directRes = await pool.query(
        'SELECT * FROM entities WHERE entity_key = ANY($1)',
        [entityKeys]
      );
      results.directEntities = directRes.rows;

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
    for (const k of entityKeys) {
      if (localGraph.entities[k]) results.directEntities.push(localGraph.entities[k]);
      for (const [edgeKey, count] of Object.entries(localGraph.edges)) {
        const [src, tgt] = edgeKey.split('->');
        if (src === k && !entityKeys.includes(tgt) && localGraph.entities[tgt]) {
          results.connectedEntities.push({ ...localGraph.entities[tgt], occurrences: count });
        }
      }
    }
  }

  const allNodes = [...results.directEntities, ...results.connectedEntities];
  for (const node of allNodes) {
    const qCount = node.query_count || node.queryCount || 0;
    const vCount = node.verified_reports_count || node.verifiedReportsCount || 0;
    const pCount = node.pending_reports_count || node.pendingReportsCount || 0;

    if (qCount > results.maxQueryCount) results.maxQueryCount = qCount;
    results.verifiedReports += vCount;
    results.pendingReports += pCount;
  }

  if (results.connectedEntities.length > 0) {
    const lines = results.connectedEntities.filter((x) => (x.entity_type || x.type) === 'line');
    const phones = results.connectedEntities.filter((x) => (x.entity_type || x.type) === 'phone');
    const otherAccs = results.connectedEntities.filter((x) => (x.entity_type || x.type) === 'account');

    if (lines.length > 0) results.networkSummary.push(`พบความเชื่อมโยงกับ LINE: ${lines.map((l) => l.label).join(', ')}`);
    if (phones.length > 0) results.networkSummary.push(`พบความเชื่อมโยงกับเบอร์: ${phones.map((p) => p.label).join(', ')}`);
    if (otherAccs.length > 0) results.networkSummary.push(`เคยพบร่วมกับบัญชีอื่นอีก ${otherAccs.length} รายการ`);
  }

  return results;
}

/**
 * ผู้ใช้แจ้งข้อพิพาทเข้ามา (เข้าสู่คิวรอตรวจเสมอ — ยังไม่มีผลกับกราฟทันที)
 */
async function submitPendingReport(entityKeys, category, details, contact, ip) {
  const now = new Date().toISOString();
  if (isPostgres()) {
    try {
      await pool.query(
        `INSERT INTO scam_reports (entity_keys, category, details, ip_hash, verified, created_at)
         VALUES ($1, $2, $3, $4, false, $5)`,
        [JSON.stringify(entityKeys), category, `${details || ''} [ติดต่อ: ${contact || '-'}]`, ip || null, now]
      );
      // นับ pending ไว้เฉยๆ
      await pool.query(
        `UPDATE entities SET pending_reports_count = COALESCE(pending_reports_count, 0) + 1 WHERE entity_key = ANY($1)`,
        [entityKeys]
      ).catch(() => {});
      return true;
    } catch (err) {
      console.error('[graph] report error:', err);
      return false;
    }
  } else {
    localGraph.reports.push({
      id: Date.now(),
      entityKeys,
      category,
      details,
      contact,
      ip,
      verified: false,
      createdAt: now,
    });
    for (const k of entityKeys) {
      if (localGraph.entities[k]) {
        localGraph.entities[k].pendingReportsCount = (localGraph.entities[k].pendingReportsCount || 0) + 1;
      }
    }
    persistLocal();
    return true;
  }
}

/**
 * แอดมินตรวจสอบหลักฐานและอนุมัติรายงาน (เฉพาะเมื่อผ่านการตรวจแล้วเท่านั้น)
 */
async function approveReport(reportId) {
  if (isPostgres()) {
    try {
      const res = await pool.query('SELECT * FROM scam_reports WHERE id = $1', [reportId]);
      if (res.rows.length === 0) return false;
      const report = res.rows[0];
      const keys = typeof report.entity_keys === 'string' ? JSON.parse(report.entity_keys) : report.entity_keys;

      await pool.query('UPDATE scam_reports SET verified = true WHERE id = $1', [reportId]);
      await pool.query(
        'UPDATE entities SET verified_reports_count = COALESCE(verified_reports_count, 0) + 1 WHERE entity_key = ANY($1)',
        [keys]
      );
      return true;
    } catch (err) {
      console.error('[graph] approveReport error:', err);
      return false;
    }
  } else {
    const report = localGraph.reports.find((r) => r.id === Number(reportId));
    if (!report) return false;
    report.verified = true;
    for (const k of report.entityKeys) {
      if (localGraph.entities[k]) {
        localGraph.entities[k].verifiedReportsCount = (localGraph.entities[k].verifiedReportsCount || 0) + 1;
      }
    }
    persistLocal();
    return true;
  }
}

/**
 * ดึงรายการรายงานที่รอแอดมินตรวจสอบ
 */
async function getPendingReports() {
  if (isPostgres()) {
    try {
      const res = await pool.query('SELECT * FROM scam_reports WHERE verified = false ORDER BY id DESC LIMIT 50');
      return res.rows;
    } catch (e) {
      return [];
    }
  } else {
    return localGraph.reports.filter((r) => !r.verified);
  }
}

async function getGraphStats() {
  if (isPostgres()) {
    try {
      const entRes = await pool.query('SELECT COUNT(*) FROM entities');
      const edgeRes = await pool.query('SELECT COUNT(*) FROM entity_edges');
      const repRes = await pool.query('SELECT COUNT(*) FROM scam_reports WHERE verified = true');
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
      totalReports: localGraph.reports.filter((r) => r.verified).length,
    };
  }
}

module.exports = {
  recordEntitiesAndEdges,
  inspectNetwork,
  submitPendingReport,
  approveReport,
  getPendingReports,
  getGraphStats,
};
