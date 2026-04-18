import { P } from '../constants/palette';

export default function Step1Farm({ farm, setFarm, onNext, onBack }) {
  function toggleBed(id) {
    setFarm(f => ({
      ...f,
      beds: f.beds.map(b => b.id === id ? { ...b, selected: !b.selected } : b),
    }));
  }

  function addBed() {
    setFarm(f => {
      const nextId = f.beds.length > 0 ? Math.max(...f.beds.map(b => b.id)) + 1 : 1;
      return {
        ...f,
        beds: [...f.beds, {
          id: nextId,
          name: `Bed ${nextId}`,
          width: f.beds.length > 0 ? f.beds[f.beds.length - 1].width : 4,
          length: f.beds.length > 0 ? f.beds[f.beds.length - 1].length : 25,
          selected: true,
        }],
      };
    });
  }

  function removeLast() {
    setFarm(f => f.beds.length > 1 ? { ...f, beds: f.beds.slice(0, -1) } : f);
  }

  function selectAll() {
    setFarm(f => ({ ...f, beds: f.beds.map(b => ({ ...b, selected: true })) }));
  }

  function clearAll() {
    setFarm(f => ({ ...f, beds: f.beds.map(b => ({ ...b, selected: false })) }));
  }

  const selectedCount = farm.beds.filter(b => b.selected).length;
  const valid = selectedCount > 0 && farm.seasonStart && farm.seasonEnd;
  const unit = farm.units === 'metric' ? 'm' : 'ft';

  return (
    <div>
      <h2 style={ui.title}>
        {farm.farmName || 'Your Farm'}
        <span style={ui.titleSub}> — select beds &amp; season</span>
      </h2>

      {/* Frost info banner */}
      {farm.frostInfo && (
        <div style={ui.frostBanner}>
          <span style={ui.frostPill}>Zone {farm.frostInfo.zone}</span>
          <span style={ui.frostPill}>Last frost ~ {farm.frostInfo.startLabel}</span>
          <span style={ui.frostPill}>First frost ~ {farm.frostInfo.endLabel}</span>
        </div>
      )}

      <div style={ui.form}>
        {/* Aerial Farm View */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <label style={ui.label}>
              Your Beds
              <span style={{ fontWeight: 400, color: '#888', marginLeft: 8 }}>
                {selectedCount} of {farm.beds.length} selected
              </span>
              {farm.bedGroups && farm.bedGroups.length === 1 && (
                <span style={{ fontWeight: 400, color: '#bbb', marginLeft: 6, fontSize: 11 }}>
                  ({farm.bedGroups[0].width}{unit} × {farm.bedGroups[0].length}{unit} each)
                </span>
              )}
            </label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={selectAll} style={ui.mapLink}>Select all</button>
              <span style={{ color: '#ccc', fontSize: 11 }}>|</span>
              <button onClick={clearAll} style={ui.mapLink}>Clear</button>
            </div>
          </div>

          <FarmView beds={farm.beds} onToggle={toggleBed} />

          <div style={ui.bedControls}>
            <button onClick={addBed} style={ui.smallBtn}>+ Add Bed</button>
            <button onClick={removeLast} style={ui.smallBtn} disabled={farm.beds.length <= 1}>- Remove Bed</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <Field label="Season Start">
            <input
              type="date"
              value={farm.seasonStart}
              onChange={e => setFarm(f => ({ ...f, seasonStart: e.target.value }))}
              style={ui.input}
            />
          </Field>
          <Field label="Season End">
            <input
              type="date"
              value={farm.seasonEnd}
              onChange={e => setFarm(f => ({ ...f, seasonEnd: e.target.value }))}
              style={ui.input}
            />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onBack} style={ui.backBtn}>← Dashboard</button>
          <button
            onClick={onNext}
            disabled={!valid}
            style={{ ...ui.btn, opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }}
          >
            Next: Choose Crops →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Aerial Farm View ---------- */

function chunk(arr, size) {
  const rows = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

function FarmView({ beds, onToggle }) {
  const bedsPerRow = beds.length <= 8 ? 4 : beds.length <= 15 ? 5 : 6;
  const rows = chunk(beds, bedsPerRow);

  return (
    <div style={sat.field}>
      <div style={sat.vignette} />

      {/* Compass */}
      <div style={sat.compass}>
        <div style={sat.compassArrow}>N</div>
        <div style={sat.compassLine} />
      </div>

      {/* Tree lines */}
      <div style={{ ...sat.treeLine, top: 6, left: 20, right: 20 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`tt${i}`} style={{ ...sat.tree, width: 14 + (i % 3) * 4, height: 14 + (i % 3) * 4 }} />
        ))}
      </div>
      <div style={{ ...sat.treeLine, bottom: 6, left: 30, right: 30 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`tb${i}`} style={{ ...sat.tree, width: 12 + (i % 3) * 5, height: 12 + (i % 3) * 5 }} />
        ))}
      </div>

      {/* Side tree clusters */}
      <div style={{ ...sat.treeCluster, top: 40, left: 8 }}>
        <div style={{ ...sat.tree, width: 16, height: 16 }} />
        <div style={{ ...sat.tree, width: 12, height: 12, marginTop: 4 }} />
      </div>
      <div style={{ ...sat.treeCluster, bottom: 50, right: 8 }}>
        <div style={{ ...sat.tree, width: 14, height: 14 }} />
        <div style={{ ...sat.tree, width: 18, height: 18, marginTop: 2 }} />
        <div style={{ ...sat.tree, width: 11, height: 11, marginTop: 3 }} />
      </div>

      {/* Structure */}
      <div style={sat.barn}><div style={sat.barnRoof} /></div>

      {/* Fence */}
      <div style={sat.fence} />

      {/* Bed rows */}
      <div style={sat.plotArea}>
        {rows.map((row, ri) => (
          <div key={ri}>
            {ri > 0 && <div style={sat.rowPath}><div style={sat.rowPathLine} /></div>}
            <div style={sat.bedRow}>
              {row.map(bed => (
                <button
                  key={bed.id}
                  onClick={() => onToggle(bed.id)}
                  style={{
                    ...sat.bed,
                    ...(bed.selected ? sat.bedActive : sat.bedInactive),
                  }}
                  title={`${bed.name} — click to ${bed.selected ? 'deselect' : 'select'}`}
                >
                  {bed.selected && <div style={sat.bedCropRows} />}
                  <span style={{
                    ...sat.bedLabel,
                    color: bed.selected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                  }}>
                    {bed.name}
                  </span>
                  {bed.selected && <span style={sat.bedCheck}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Scale */}
      <div style={sat.scaleBar}>
        <div style={sat.scaleBarLine} />
        <span style={sat.scaleBarLabel}>~25 ft</span>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={ui.label}>{label}</label>
      {children}
    </div>
  );
}

/* ---------- Satellite styles ---------- */

const sat = {
  field: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    padding: '40px 48px',
    minHeight: 280,
    background: [
      'repeating-linear-gradient(176deg, transparent 0px, transparent 6px, rgba(30,60,10,0.08) 6px, rgba(30,60,10,0.08) 8px)',
      'repeating-linear-gradient(86deg, transparent 0px, transparent 40px, rgba(50,80,20,0.06) 40px, rgba(50,80,20,0.06) 42px)',
      'radial-gradient(ellipse at 25% 35%, rgba(80,130,40,0.35) 0%, transparent 50%)',
      'radial-gradient(ellipse at 70% 65%, rgba(50,100,25,0.3) 0%, transparent 45%)',
      'radial-gradient(ellipse at 50% 20%, rgba(90,140,50,0.2) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 25%, rgba(60,90,30,0.25) 0%, transparent 40%)',
      'linear-gradient(165deg, #2a5518 0%, #336622 25%, #2d5a1a 50%, #3a6b24 75%, #2a5518 100%)',
    ].join(', '),
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  },
  vignette: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)',
    pointerEvents: 'none', zIndex: 2,
  },
  compass: {
    position: 'absolute', top: 12, right: 16, zIndex: 3,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  compassArrow: { fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, lineHeight: 1 },
  compassLine: { width: 1, height: 12, background: 'rgba(255,255,255,0.3)', marginTop: 2 },
  treeLine: {
    position: 'absolute', zIndex: 1,
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
  },
  treeCluster: {
    position: 'absolute', zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  tree: {
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 35%, #3d7a22 0%, #2a5a14 50%, #1a4010 100%)',
    boxShadow: '2px 2px 4px rgba(0,0,0,0.4), inset -1px -1px 3px rgba(0,0,0,0.2)',
    flexShrink: 0,
  },
  barn: {
    position: 'absolute', bottom: 14, right: 50, zIndex: 3,
    width: 24, height: 18, background: '#6b4530',
    borderRadius: 2, boxShadow: '2px 2px 6px rgba(0,0,0,0.4)',
  },
  barnRoof: {
    position: 'absolute', top: -4, left: -2, right: -2,
    height: 6, background: '#8b5a3a', borderRadius: '2px 2px 0 0',
  },
  fence: {
    position: 'absolute', inset: 28,
    border: '1px dashed rgba(200,180,140,0.25)',
    borderRadius: 6, pointerEvents: 'none', zIndex: 1,
  },
  plotArea: { position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column' },
  bedRow: { display: 'flex', gap: 10, justifyContent: 'center' },
  rowPath: { height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' },
  rowPathLine: { width: '80%', height: 1, background: 'rgba(180,160,120,0.15)' },
  bed: {
    position: 'relative', width: 68, height: 96, borderRadius: 3,
    cursor: 'pointer', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    transition: 'all 0.2s ease', overflow: 'hidden', outline: 'none',
  },
  bedActive: {
    background: 'linear-gradient(180deg, rgba(82,160,60,0.35) 0%, rgba(90,58,26,0.8) 35%, rgba(107,74,42,0.85) 65%, rgba(90,58,26,0.8) 100%)',
    border: '2px solid rgba(149,213,178,0.85)',
    boxShadow: '0 0 14px rgba(149,213,178,0.35), 0 2px 8px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.15)',
  },
  bedInactive: {
    background: 'linear-gradient(180deg, rgba(40,30,15,0.6) 0%, rgba(50,40,20,0.5) 50%, rgba(40,30,15,0.6) 100%)',
    border: '1.5px dashed rgba(255,255,255,0.18)',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
  },
  bedCropRows: {
    position: 'absolute', inset: 0,
    background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 7px, rgba(100,160,60,0.12) 7px, rgba(100,160,60,0.12) 9px)',
    pointerEvents: 'none',
  },
  bedLabel: { position: 'relative', zIndex: 1, fontSize: 10, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.7)' },
  bedCheck: { position: 'relative', zIndex: 1, fontSize: 14, color: '#95d5b2', textShadow: '0 0 8px rgba(149,213,178,0.5)', lineHeight: 1 },
  scaleBar: { position: 'absolute', bottom: 12, left: 16, zIndex: 3, display: 'flex', alignItems: 'center', gap: 6 },
  scaleBarLine: {
    width: 40, height: 2, background: 'rgba(255,255,255,0.5)',
    borderLeft: '1px solid rgba(255,255,255,0.5)', borderRight: '1px solid rgba(255,255,255,0.5)',
  },
  scaleBarLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 600 },
};

/* ---------- UI styles ---------- */

const ui = {
  title: { fontSize: 24, fontWeight: 700, color: P.primary, margin: '0 0 4px' },
  titleSub: { fontSize: 14, fontWeight: 400, color: '#999' },
  form: { display: 'flex', flexDirection: 'column', gap: 24, marginTop: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px', border: '1.5px solid #ddd',
    borderRadius: 8, fontSize: 15, outline: 'none', background: '#fff',
  },
  frostBanner: {
    display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8,
  },
  frostPill: {
    background: P.light, color: P.primary, padding: '4px 12px',
    borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  mapLink: {
    background: 'none', border: 'none', fontSize: 11, fontWeight: 600,
    color: P.active, cursor: 'pointer', padding: 0,
  },
  bedControls: {
    display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, flexWrap: 'wrap',
  },
  smallBtn: {
    background: '#fff', border: '1.5px solid #ddd', borderRadius: 6,
    padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer',
  },
  btn: {
    background: P.primary, color: P.light, border: 'none',
    padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600,
  },
  backBtn: {
    background: 'transparent', color: P.primary, border: `1.5px solid ${P.primary}`,
    padding: '12px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
};
