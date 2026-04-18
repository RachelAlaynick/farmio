import { P, CROP_COLORS } from '../constants/palette';

const MODE_LABELS = {
  simple:  'Simple Calendar',
  supply:  'Supply-First (Revenue Optimized)',
  demand:  'Demand-First (Target Fulfillment)',
  blended: 'Blended (Committed + Optimized)',
};

export default function Step3Plan({ plan, farm, onBack, onAdjustBeds }) {
  const { mode, cropPlans, calendarGrid, weeklyBedUsage, weekDates, metrics, hasConflict, selectedBeds, bedScheduleGrid } = plan;
  const { seasonWeeks, totalBeds, peakBedUse, totalRevenue, totalSuccessions, totalYield, growingArea, totalPlantings } = metrics;
  const showRevenue = mode !== 'simple';
  const areaUnit = farm.units === 'metric' ? 'm²' : 'ft²';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.primary, margin: 0 }}>Crop Plan</h2>
        <span style={styles.badge}>{MODE_LABELS[mode]}</span>
      </div>
      <p style={{ color: P.textSub, marginBottom: 24, fontSize: 14 }}>
        {farm.seasonStart} to {farm.seasonEnd} · {totalBeds} beds selected
        {onAdjustBeds && <span style={{ color: '#aaa' }}> · Adjust beds per crop below to update forecasts</span>}
      </p>

      {/* Metrics */}
      <div style={styles.metricGrid}>
        {showRevenue && (
          <MetricCard label="Estimated Revenue" value={`$${totalRevenue.toLocaleString()}`} />
        )}
        <MetricCard label="Projected Yield" value={`${totalYield.toLocaleString()} lbs`} />
        <MetricCard label="Growing Area" value={`${growingArea.toLocaleString()} ${areaUnit}`} />
        <MetricCard label="Bed Plantings" value={totalPlantings} sub="successions × beds" />
        <MetricCard label="Season Length" value={`${seasonWeeks} wks`} />
        <MetricCard
          label="Peak Bed Use"
          value={`${peakBedUse} / ${totalBeds}`}
          alert={peakBedUse > totalBeds}
        />
      </div>

      {hasConflict && (
        <div style={styles.warning}>
          <strong>⚠ Bed Conflict</strong>
          <span style={{ fontSize: 13 }}>
            {' '}— your plan needs {peakBedUse} beds in some weeks but only {totalBeds} are available. Reduce beds per crop or add more beds.
          </span>
        </div>
      )}

      {/* Harvest Calendar */}
      <Section title="Harvest Calendar">
        <div style={styles.calWrap}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ ...styles.calTh, textAlign: 'left', minWidth: 110, position: 'sticky', left: 0, background: P.gray, zIndex: 1 }}>Crop</th>
                {weekDates.map((d, i) => (
                  <th key={i} style={styles.calTh} title={d}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cropPlans.map((cp, ci) => {
                const color = CROP_COLORS[ci % CROP_COLORS.length];
                return (
                  <tr key={cp.crop.id}>
                    <td style={{ ...styles.calCropName, position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                      <span style={{ ...styles.dot, background: color }} />
                      {cp.crop.name}
                    </td>
                    {calendarGrid[ci].map((cell, wi) => (
                      <td key={wi} style={{
                        ...styles.calCell,
                        background: cell === 'P' ? P.primary : cell === 'H' ? color + '44' : 'transparent',
                        color: cell === 'P' ? P.light : cell === 'H' ? color : 'transparent',
                        fontWeight: 700,
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <td style={{ ...styles.calCropName, fontWeight: 700, borderTop: '2px solid #ccc', position: 'sticky', left: 0, background: P.gray, zIndex: 1 }}>
                  Beds used
                </td>
                {weeklyBedUsage.map((beds, wi) => (
                  <td key={wi} style={{
                    ...styles.calCell, borderTop: '2px solid #ccc',
                    color: beds > totalBeds ? P.danger : beds > 0 ? P.active : '#ccc',
                    fontWeight: 700, background: beds > totalBeds ? '#fff0f0' : 'transparent',
                  }}>
                    {beds || ''}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.legend}>
          <span><span style={{ ...styles.legendBox, background: P.primary }} /> P = Plant</span>
          <span><span style={{ ...styles.legendBox, background: P.mint }} /> H = Harvest</span>
          <span style={{ color: P.danger }}>
            <span style={{ ...styles.legendBox, background: '#fff0f0', border: `1px solid ${P.danger}` }} /> Over limit
          </span>
        </div>
      </Section>

      {/* Bed Schedule */}
      <Section title="Bed Schedule">
        <p style={{ fontSize: 13, color: P.textSub, marginBottom: 12 }}>
          Each row is a physical bed. Colors show which crop is assigned each week.
        </p>
        <div style={styles.calWrap}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ ...styles.calTh, textAlign: 'left', minWidth: 80, position: 'sticky', left: 0, background: P.gray, zIndex: 1 }}>Bed</th>
                {weekDates.map((d, i) => (
                  <th key={i} style={styles.calTh} title={d}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedBeds.map((bed, bi) => (
                <tr key={bed.id}>
                  <td style={{ ...styles.calCropName, position: 'sticky', left: 0, background: '#fff', zIndex: 1, minWidth: 80 }}>
                    {bed.name}
                  </td>
                  {bedScheduleGrid[bi].map((cell, wi) => {
                    if (!cell) return <td key={wi} style={{ ...styles.calCell, background: '#fafafa' }} />;
                    const color = CROP_COLORS[cell.cropIndex % CROP_COLORS.length];
                    return (
                      <td key={wi} title={`${cell.cropName} — Week ${wi + 1}`} style={{
                        ...styles.calCell,
                        background: cell.isPlanting ? P.primary : color + '66',
                        color: cell.isPlanting ? P.light : color,
                        fontWeight: 700,
                      }}>
                        {cell.isPlanting ? 'P' : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...styles.legend, marginTop: 10 }}>
          {cropPlans.map((cp, ci) => (
            <span key={cp.crop.id}>
              <span style={{ ...styles.legendBox, background: CROP_COLORS[ci % CROP_COLORS.length] }} />
              {cp.crop.name}
            </span>
          ))}
        </div>
      </Section>

      {/* Crop Detail */}
      <Section title="Crop Detail">
        <p style={{ fontSize: 13, color: P.textSub, marginBottom: 16 }}>
          {onAdjustBeds ? 'Change the beds allocated to any crop — the entire plan recalculates automatically.' : ''}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cropPlans.map((cp, ci) => (
            <CropCard
              key={cp.crop.id}
              cp={cp}
              color={CROP_COLORS[ci % CROP_COLORS.length]}
              showRevenue={showRevenue}
              onAdjustBeds={onAdjustBeds}
            />
          ))}
        </div>
      </Section>

      <button onClick={onBack} style={styles.backBtn}>← Back to Crops</button>
    </div>
  );
}

/* --- sub-components --- */

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: P.primary, marginBottom: 12 }}>{title}</h3>
      {children}
    </section>
  );
}

function MetricCard({ label, value, sub, alert }) {
  return (
    <div style={{ ...styles.card, borderColor: alert ? '#ffc107' : P.border }}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: alert ? P.danger : P.primary }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function CropCard({ cp, color, showRevenue, onAdjustBeds }) {
  const { crop, beds, assignedBeds, successions, totalRevenue, revenuePerBed } = cp;
  const yieldTotal = Math.round(successions.reduce((s, x) => s + beds * Number(crop.yieldPerBed) * x.harvestWeeks, 0));

  return (
    <div style={styles.cropCard}>
      <div style={{ ...styles.cropHeader, background: color + '18' }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: P.primary }}>
          <span style={{ ...styles.dot, background: color }} />{crop.name}
        </span>

        {/* Editable beds */}
        {onAdjustBeds ? (
          <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#888', fontSize: 11 }}>Beds: </span>
            <input
              type="number"
              value={beds}
              min={1}
              onChange={e => onAdjustBeds(crop.id, Math.max(1, parseInt(e.target.value) || 1))}
              style={styles.bedsInput}
            />
          </span>
        ) : (
          <Stat label="Beds" value={beds} />
        )}

        <Stat label="Successions" value={successions.length} />
        <Stat label="Yield" value={`${yieldTotal.toLocaleString()} lbs`} />
        {showRevenue && <Stat label="Revenue" value={`$${totalRevenue.toLocaleString()}`} />}
        {showRevenue && <Stat label="Rev/Bed" value={`$${revenuePerBed.toLocaleString()}`} />}
      </div>

      {assignedBeds.length > 0 && (
        <div style={{ padding: '8px 16px', borderBottom: `1px solid ${P.border}`, fontSize: 13, color: '#555' }}>
          <span style={{ fontWeight: 600, color: '#333' }}>Assigned: </span>
          {assignedBeds.map(b => (
            <span key={b.id} style={styles.bedPill}>{b.name}</span>
          ))}
        </div>
      )}

      {successions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['#', 'Plant Date', 'Harvest Start', 'Harvest End', 'Harvest Wks', 'Yield (lbs)', ...(showRevenue ? ['Revenue'] : [])].map(h =>
                  <th key={h} style={styles.detailTh}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {successions.map((s, i) => {
                const succYield = Math.round(beds * Number(crop.yieldPerBed) * s.harvestWeeks);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={styles.detailTd}>{i + 1}</td>
                    <td style={styles.detailTd}>{s.plantDateStr}</td>
                    <td style={styles.detailTd}>{s.harvestStartStr}</td>
                    <td style={styles.detailTd}>{s.harvestEndStr}</td>
                    <td style={styles.detailTd}>{s.harvestWeeks}</td>
                    <td style={styles.detailTd}>{succYield.toLocaleString()}</td>
                    {showRevenue && <td style={{ ...styles.detailTd, fontWeight: 600, color: P.active }}>${s.revenue.toLocaleString()}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: 16, color: '#888', fontSize: 13 }}>
          Season too short for this crop to complete a harvest.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <span style={{ fontSize: 13 }}>
      <span style={{ color: '#888', fontSize: 11 }}>{label}: </span>
      <span style={{ fontWeight: 700, color: '#333' }}>{value}</span>
    </span>
  );
}

/* --- styles --- */

const styles = {
  badge: {
    background: '#f0faf4', color: P.active, padding: '4px 12px',
    borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  metricGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 12, marginBottom: 24,
  },
  card: {
    background: '#fff', border: '1.5px solid', borderRadius: 10, padding: '14px 18px',
  },
  cardLabel: {
    fontSize: 10, color: '#888', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.5px', marginBottom: 6,
  },
  warning: {
    background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8,
    padding: '12px 16px', marginBottom: 24, color: '#856404',
  },
  calWrap: { overflowX: 'auto', borderRadius: 8, border: `1px solid ${P.border}`, marginBottom: 10 },
  calTh: { padding: '8px 2px', textAlign: 'center', fontWeight: 600, fontSize: 10, color: '#888', minWidth: 28, background: P.gray },
  calCropName: {
    padding: '6px 10px', fontWeight: 600, fontSize: 12, color: '#333',
    borderRight: `1px solid ${P.border}`, whiteSpace: 'nowrap',
  },
  calCell: { width: 28, height: 26, textAlign: 'center', fontSize: 10, border: '1px solid #f0f0f0' },
  legend: { display: 'flex', gap: 16, fontSize: 12, color: '#666', flexWrap: 'wrap' },
  legendBox: {
    display: 'inline-block', width: 12, height: 12, borderRadius: 2,
    marginRight: 4, verticalAlign: 'middle',
  },
  dot: {
    display: 'inline-block', width: 10, height: 10, borderRadius: 2,
    marginRight: 6, verticalAlign: 'middle',
  },
  bedPill: {
    display: 'inline-block', background: P.light, color: P.primary,
    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
    margin: '2px 4px 2px 0',
  },
  bedsInput: {
    width: 48, padding: '4px 6px', border: '1.5px solid #ccc', borderRadius: 6,
    fontSize: 13, textAlign: 'center', fontWeight: 700, outline: 'none',
    background: '#fff',
  },
  cropCard: { background: '#fff', border: `1.5px solid ${P.border}`, borderRadius: 10, overflow: 'hidden' },
  cropHeader: {
    borderBottom: `1px solid ${P.border}`, padding: '12px 16px',
    display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center',
  },
  detailTh: {
    padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  detailTd: { padding: '8px 12px', color: '#333' },
  backBtn: {
    background: 'transparent', color: P.primary, border: `1.5px solid ${P.primary}`,
    padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
};
