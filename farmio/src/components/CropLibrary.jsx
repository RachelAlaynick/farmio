import { useState } from 'react';
import { CROP_DB } from '../data/crops';
import { P } from '../constants/palette';

const SEG = {
  nursery: '#4cc9f0',
  harden:  '#f4a261',
  ground:  '#2d6a4f',
  harvest: '#52b788',
};

export default function CropLibrary({ farm, crops, onBack, onAddCrop }) {
  const [search, setSearch] = useState('');
  const [justAdded, setJustAdded] = useState(null);
  // Per-crop overrides: { "Tomatoes": { sowToHarden: 40, ... } }
  const [overrides, setOverrides] = useState({});

  const unit = farm.units === 'metric' ? 'cm' : 'in';
  const inPlanNames = new Set(crops.map(c => c.name));

  const filtered = CROP_DB.filter(c =>
    c.name !== 'Custom' && c.name.toLowerCase().includes(search.toLowerCase())
  );

  function getCrop(base) {
    return { ...base, ...(overrides[base.name] || {}) };
  }

  function updateCrop(name, field, value) {
    setOverrides(prev => ({
      ...prev,
      [name]: { ...(prev[name] || {}), [field]: value },
    }));
  }

  function handleAdd(crop) {
    const c = getCrop(crop);
    onAddCrop(c.name);
    setJustAdded(c.name);
    setTimeout(() => setJustAdded(null), 1500);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h2 style={s.title}>Crop Library</h2>
        <button onClick={onBack} style={s.backLink}>← Dashboard</button>
      </div>
      <p style={s.subtitle}>
        Browse the crop database. Edit stage durations to match your experience, then add crops to your season plan.
      </p>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search crops..."
        style={s.search}
      />

      <div style={s.legend}>
        <LegendItem color={SEG.nursery} label="Seedling" />
        <LegendItem color={SEG.harden} label="Hardening Off" />
        <LegendItem color={SEG.ground} label="In Ground" />
        <LegendItem color={SEG.harvest} label="Harvest Window" />
      </div>

      <div style={s.list}>
        {filtered.map(base => {
          const crop = getCrop(base);
          return (
            <CropCard
              key={base.name}
              crop={crop}
              unit={unit}
              inPlan={inPlanNames.has(base.name)}
              onAdd={() => handleAdd(base)}
              justAdded={justAdded === base.name}
              onFieldChange={(field, val) => updateCrop(base.name, field, val)}
              isOverridden={!!overrides[base.name]}
              onRevert={() => setOverrides(prev => { const next = { ...prev }; delete next[base.name]; return next; })}
            />
          );
        })}
        {filtered.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>No crops match "{search}"</p>
        )}
      </div>
    </div>
  );
}

/* ---------- CropCard ---------- */

function CropCard({ crop, unit, inPlan, onAdd, justAdded, onFieldChange, isOverridden, onRevert }) {
  const [manual, setManual] = useState(false);

  const hwDays = crop.hw * 7;
  const totalCycle = crop.dtm + hwDays;
  const groundTotal = crop.daysInGround + hwDays;

  const segments = [];
  if (!crop.directSow) {
    segments.push({ key: 'sowToHarden', label: 'Seedling', days: crop.sowToHarden, color: SEG.nursery });
    segments.push({ key: 'hardenDays', label: 'Harden', days: crop.hardenDays, color: SEG.harden });
  }
  segments.push({ key: 'daysInGround', label: 'Growing', days: crop.daysInGround, color: SEG.ground });
  segments.push({ key: 'hw', label: 'Harvest', days: hwDays, color: SEG.harvest, isWeeks: true });

  function handleStageChange(seg, rawValue) {
    const v = Math.max(1, parseInt(rawValue) || 1);
    if (seg.isWeeks) {
      onFieldChange('hw', v);
    } else {
      onFieldChange(seg.key, v);
      const newDtm =
        (seg.key === 'sowToHarden' ? v : crop.sowToHarden) +
        (seg.key === 'hardenDays' ? v : crop.hardenDays) +
        (seg.key === 'daysInGround' ? v : crop.daysInGround);
      onFieldChange('dtm', newDtm);
    }
  }

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={s.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          <span style={s.cropName}>{crop.name}</span>
          <span style={crop.directSow ? s.badgeDirect : s.badgeTransplant}>
            {crop.directSow ? 'Direct Sow' : 'Transplant'}
          </span>
          {inPlan && <span style={s.badgeInPlan}>In Plan</span>}
          {isOverridden && <span style={s.badgeSaved}>Saved</span>}
        </div>
        <div style={s.statsRow}>
          <StatChip label="Spacing" value={`${crop.spacing}${unit}`} />
          <StatChip label="DTM" value={`${crop.dtm}d`} />
          <StatChip label="Yield" value={`${crop.yieldPerBed} lbs`} />
          <StatChip label="Price" value={`$${crop.price}`} />
        </div>
      </div>

      {/* Timeline bar */}
      <div style={s.timelineWrap}>
        <div style={s.timelineBar}>
          {segments.map((seg, i) => {
            const pct = (seg.days / totalCycle) * 100;
            return (
              <div
                key={seg.key}
                title={`${seg.label}: ${seg.days} days`}
                style={{
                  ...s.segment,
                  width: `${Math.max(pct, 4)}%`,
                  background: seg.color,
                  borderRadius: i === 0 ? '4px 0 0 4px' : i === segments.length - 1 ? '0 4px 4px 0' : 0,
                }}
              >
                {pct > 10 && <span style={s.segLabel}>{seg.days}d</span>}
              </div>
            );
          })}
        </div>

        {/* Static labels */}
        {!manual && (
          <div style={s.timelineLabels}>
            {segments.map(seg => {
              const pct = (seg.days / totalCycle) * 100;
              return (
                <div key={seg.key} style={{ width: `${Math.max(pct, 4)}%`, textAlign: 'center' }}>
                  <span style={{ fontSize: 10, color: seg.color, fontWeight: 600 }}>
                    {seg.label} {seg.days}d
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual inputs panel */}
      {manual && (
        <div style={s.manualPanel}>
          <div style={s.manualGrid}>
            {segments.map(seg => (
              <div key={seg.key} style={s.manualField}>
                <label style={{ fontSize: 11, fontWeight: 600, color: seg.color, marginBottom: 4, display: 'block' }}>
                  {seg.label} {seg.isWeeks ? '(weeks)' : '(days)'}
                </label>
                <input
                  type="number"
                  value={seg.isWeeks ? crop.hw : seg.days}
                  min={1}
                  onChange={e => handleStageChange(seg, e.target.value)}
                  style={{ ...s.stageInput, borderColor: seg.color + '88' }}
                />
              </div>
            ))}
          </div>
          <div style={s.manualFooter}>
            <span style={{ fontSize: 12, color: '#888' }}>
              Total cycle: <strong>{totalCycle}d</strong> · In ground: <strong>{groundTotal}d</strong>
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {isOverridden && (
                <button onClick={() => { onRevert(); setManual(false); }} style={s.revertBtn}>
                  Revert to Farmio Database
                </button>
              )}
              <button onClick={() => setManual(false)} style={s.saveBtn}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={s.cardFooter}>
        <span style={s.totalDays}>
          Total cycle: <strong>{totalCycle}d</strong>
          <span style={{ color: '#bbb', margin: '0 8px' }}>|</span>
          Days in ground: <strong>{groundTotal}d</strong>
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!manual && (
            <button onClick={() => setManual(true)} style={s.manualBtn}>
              Use Manual Inputs
            </button>
          )}
          <button
            onClick={onAdd}
            style={{
              ...s.addBtn,
              background: justAdded ? P.active : P.primary,
              color: justAdded ? '#fff' : P.light,
              borderColor: justAdded ? P.active : P.primary,
            }}
          >
            {justAdded ? '✓ Added' : 'Add to Season Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <span style={s.statChip}>
      <span style={{ color: '#aaa', fontSize: 10 }}>{label} </span>
      <span style={{ fontWeight: 700, color: '#555' }}>{value}</span>
    </span>
  );
}

function LegendItem({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#666' }}>
      <span style={{ width: 12, height: 12, borderRadius: 2, background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

/* ---------- Styles ---------- */

const s = {
  title: { fontSize: 24, fontWeight: 700, color: P.primary, margin: 0 },
  subtitle: { color: '#777', margin: '6px 0 20px', fontSize: 14 },
  backLink: {
    background: 'none', border: 'none', color: P.active,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
  },
  search: {
    width: '100%', maxWidth: 360, padding: '10px 14px',
    border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14,
    outline: 'none', background: '#fff', marginBottom: 16,
  },
  legend: {
    display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20,
    padding: '10px 16px', background: '#fff', borderRadius: 8, border: '1px solid #eee',
  },
  list: {
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  card: {
    background: '#fff',
    border: '1.5px solid #e8e8e8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 20px 12px',
    display: 'flex', flexWrap: 'wrap', gap: 12,
    alignItems: 'center', justifyContent: 'space-between',
  },
  cropName: { fontSize: 17, fontWeight: 700, color: P.primary },
  badgeDirect: {
    fontSize: 10, fontWeight: 700, color: '#2d6a4f', background: '#d8f3dc',
    padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.3px',
  },
  badgeTransplant: {
    fontSize: 10, fontWeight: 700, color: '#7c4a1a', background: '#fef3e2',
    padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.3px',
  },
  badgeInPlan: {
    fontSize: 10, fontWeight: 700, color: P.active, background: '#e8f5e9',
    padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.3px',
  },
  badgeSaved: {
    fontSize: 10, fontWeight: 700, color: '#6a4c93', background: '#ede7f6',
    padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.3px',
  },
  statsRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  statChip: { fontSize: 12 },
  timelineWrap: { padding: '0 20px 8px' },
  timelineBar: {
    display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
  },
  segment: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 0, position: 'relative', transition: 'width 0.3s',
  },
  segLabel: {
    fontSize: 10, fontWeight: 700, color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)', whiteSpace: 'nowrap',
  },
  timelineLabels: { display: 'flex', marginTop: 4 },
  manualPanel: {
    margin: '0 20px', padding: '14px 16px',
    background: '#fafafa', borderRadius: 8, border: '1px solid #eee',
  },
  manualGrid: {
    display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12,
  },
  manualField: {
    flex: '1 1 80px', minWidth: 80,
  },
  stageInput: {
    width: '100%', padding: '6px 8px', border: '1.5px solid #ddd',
    borderRadius: 6, fontSize: 13, textAlign: 'center', outline: 'none',
    background: '#fff',
  },
  manualFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 8,
  },
  revertBtn: {
    background: 'none', border: '1.5px solid #ddd', borderRadius: 6,
    padding: '5px 12px', fontSize: 11, fontWeight: 600, color: '#999',
    cursor: 'pointer',
  },
  saveBtn: {
    background: P.active, color: '#fff', border: 'none', borderRadius: 6,
    padding: '5px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  },
  cardFooter: {
    padding: '10px 20px 14px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: 12, borderTop: '1px solid #f0f0f0', flexWrap: 'wrap',
  },
  totalDays: { fontSize: 12, color: '#888' },
  manualBtn: {
    background: 'none', border: '1.5px solid #ccc', borderRadius: 6,
    padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#666',
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  addBtn: {
    border: '1.5px solid', borderRadius: 6,
    padding: '5px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  },
};
