import { P } from '../constants/palette';

const MODULES = [
  {
    id: 'crop-library',
    icon: '🌿',
    title: 'Crop Library',
    desc: 'Browse the full crop database with lifecycle timelines — seedling, hardening, growing, and harvest stages.',
    ready: true,
    action: 'Browse Crops',
  },
  {
    id: 'crop-planner',
    icon: '🗺️',
    title: 'Crop Planner',
    desc: 'Calculate growing space, planting materials, projected yield, and estimated revenue — then adjust the plan to fit your farm.',
    ready: true,
    action: 'Open Planner',
  },
  {
    id: 'tasks',
    icon: '✅',
    title: 'Tasks',
    desc: 'Track daily planting, harvesting, and maintenance tasks with due dates and assignments.',
    ready: false,
  },
  {
    id: 'distribution',
    icon: '📦',
    title: 'Distribution',
    desc: 'Manage CSA shares, market days, restaurant orders, and delivery schedules.',
    ready: false,
  },
];

export default function Dashboard({ farm, onNavigate }) {
  const totalBeds = farm.beds.length;

  return (
    <div>
      <div style={s.greeting}>
        <h2 style={s.farmName}>{farm.farmName || 'Your Farm'}</h2>
        <div style={s.statRow}>
          <span style={s.stat}>{totalBeds} beds</span>
          {farm.frostInfo && <span style={s.stat}>Zone {farm.frostInfo.zone}</span>}
          {farm.seasonStart && farm.seasonEnd && (
            <span style={s.stat}>{farm.seasonStart} → {farm.seasonEnd}</span>
          )}
        </div>
      </div>

      <div style={s.grid}>
        {MODULES.map(mod => (
          <button
            key={mod.id}
            onClick={() => mod.ready && onNavigate(mod.id)}
            style={{
              ...s.card,
              ...(mod.ready ? s.cardReady : s.cardSoon),
              cursor: mod.ready ? 'pointer' : 'default',
            }}
          >
            <div style={s.cardIcon}>{mod.icon}</div>
            <div style={s.cardBody}>
              <div style={s.cardTitle}>
                {mod.title}
                {!mod.ready && <span style={s.soonBadge}>Coming Soon</span>}
              </div>
              <p style={s.cardDesc}>{mod.desc}</p>
            </div>
            {mod.ready && (
              <div style={s.cardAction}>{mod.action} →</div>
            )}
          </button>
        ))}
      </div>

      <button onClick={() => onNavigate('settings')} style={s.settingsBtn}>
        ⚙ Farm Settings
      </button>
    </div>
  );
}

const s = {
  greeting: { marginBottom: 32 },
  farmName: { fontSize: 28, fontWeight: 800, color: P.primary, margin: '0 0 8px', letterSpacing: '-0.5px' },
  statRow: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  stat: { fontSize: 13, color: '#888', fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: {
    display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 14,
    padding: '24px 24px 20px', border: '1.5px solid', textAlign: 'left',
    transition: 'box-shadow 0.2s, border-color 0.2s',
  },
  cardReady: { borderColor: P.mint, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
  cardSoon: { borderColor: '#eee', opacity: 0.7 },
  cardIcon: { fontSize: 28, marginBottom: 12, lineHeight: 1 },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 17, fontWeight: 700, color: P.primary, marginBottom: 6,
    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  },
  soonBadge: {
    fontSize: 10, fontWeight: 700, color: '#999', background: '#f0f0f0',
    padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  cardDesc: { fontSize: 13, color: '#777', lineHeight: 1.5, margin: 0 },
  cardAction: { marginTop: 16, fontSize: 14, fontWeight: 700, color: P.active },
  settingsBtn: {
    marginTop: 32, background: 'none', border: 'none', fontSize: 13,
    fontWeight: 600, color: '#999', cursor: 'pointer', padding: 0,
  },
};
