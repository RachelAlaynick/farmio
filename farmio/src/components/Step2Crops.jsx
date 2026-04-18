import { CROP_DB } from '../data/crops';
import { P } from '../constants/palette';

export default function Step2Crops({ crops, setCrops, makeCrop, farm, onBack, onGenerate }) {
  function addCrop() {
    const used = new Set(crops.map(c => c.name));
    const next = CROP_DB.find(db => !used.has(db.name)) || CROP_DB[0];
    setCrops(prev => [...prev, makeCrop(next.name)]);
  }

  function removeCrop(id) {
    if (crops.length > 1) setCrops(prev => prev.filter(c => c.id !== id));
  }

  function update(id, field, value) {
    setCrops(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  function changeName(id, name) {
    const db = CROP_DB.find(c => c.name === name);
    if (!db) return;
    setCrops(prev => prev.map(c => c.id === id ? {
      ...c, name: db.name, dtm: db.dtm, hw: db.hw,
      yieldPerBed: db.yieldPerBed, price: db.price,
    } : c));
  }

  function toggleLock(id) {
    setCrops(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
  }

  function lockFromDemand(id) {
    setCrops(prev => prev.map(c => c.id === id && !c.locked ? { ...c, locked: true } : c));
  }

  return (
    <div>
      <h2 style={styles.title}>Choose Crops</h2>
      <p style={styles.subtitle}>
        Lock demand (🔒) for committed targets. Unlocked crops are optimized for revenue.
      </p>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: P.gray }}>
              {['Crop','Days to Maturity','Harvest Wks','Demand lbs/wk','Yield/Bed/Wk','$/lb',''].map(h =>
                <th key={h} style={styles.th}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {crops.map(crop => (
              <tr key={crop.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={styles.td}>
                  <select
                    value={crop.name}
                    onChange={e => changeName(crop.id, e.target.value)}
                    style={styles.select}
                  >
                    {CROP_DB.map(db =>
                      <option key={db.name} value={db.name}>{db.name}</option>
                    )}
                  </select>
                </td>
                <td style={styles.td}>
                  <input type="number" value={crop.dtm} min={1} style={styles.num}
                    onChange={e => update(crop.id, 'dtm', e.target.value)} />
                </td>
                <td style={styles.td}>
                  <input type="number" value={crop.hw} min={1} style={styles.num}
                    onChange={e => update(crop.id, 'hw', e.target.value)} />
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => toggleLock(crop.id)}
                      title={crop.locked ? 'Unlock — optimize for revenue' : 'Lock — set committed target'}
                      style={styles.lockBtn}
                    >
                      {crop.locked ? '🔒' : '🔓'}
                    </button>
                    <input
                      type="number"
                      value={crop.locked ? (crop.demand || '') : ''}
                      placeholder={crop.locked ? '0' : '—'}
                      readOnly={!crop.locked}
                      onClick={() => lockFromDemand(crop.id)}
                      onChange={e => update(crop.id, 'demand', e.target.value)}
                      style={{
                        ...styles.num,
                        background: crop.locked ? '#fff' : '#f0f0f0',
                        color: crop.locked ? '#111' : '#aaa',
                        cursor: crop.locked ? 'text' : 'pointer',
                      }}
                    />
                  </div>
                </td>
                <td style={styles.td}>
                  <input type="number" value={crop.yieldPerBed} min={0.1} step={0.5} style={styles.num}
                    onChange={e => update(crop.id, 'yieldPerBed', e.target.value)} />
                </td>
                <td style={styles.td}>
                  <input type="number" value={crop.price} min={0} step={0.5} style={styles.num}
                    onChange={e => update(crop.id, 'price', e.target.value)} />
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <button
                    onClick={() => removeCrop(crop.id)}
                    disabled={crops.length <= 1}
                    style={{
                      ...styles.lockBtn, fontSize: 20,
                      color: crops.length > 1 ? P.danger : '#ccc',
                      cursor: crops.length > 1 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addCrop} style={styles.addBtn}>+ Add Crop</button>

      <div style={styles.actions}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <button onClick={onGenerate} style={styles.primaryBtn}>Run Optimizer →</button>
      </div>
    </div>
  );
}

const styles = {
  title: { fontSize: 24, fontWeight: 700, color: P.primary, margin: 0 },
  subtitle: { color: P.textSub, margin: '8px 0 24px', fontSize: 15 },
  tableWrap: { overflowX: 'auto', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 680 },
  th: {
    padding: '10px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  td: { padding: '7px 10px', verticalAlign: 'middle' },
  select: {
    padding: '7px 8px', border: '1.5px solid #ddd', borderRadius: 6,
    fontSize: 14, width: 130, background: '#fff',
  },
  num: {
    width: 72, padding: '7px 8px', border: '1.5px solid #ddd',
    borderRadius: 6, fontSize: 14, textAlign: 'right',
  },
  lockBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 16, padding: '2px 4px', lineHeight: 1,
  },
  addBtn: {
    background: 'transparent', color: P.active, border: `1.5px solid ${P.active}`,
    padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
    cursor: 'pointer', marginBottom: 32,
  },
  actions: { display: 'flex', gap: 12 },
  backBtn: {
    background: 'transparent', color: P.primary, border: `1.5px solid ${P.primary}`,
    padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
  primaryBtn: {
    background: P.primary, color: P.light, border: 'none',
    padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
};
