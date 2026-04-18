import { P } from '../constants/palette';
import { getFrostInfo } from '../utils/frostDates';

const TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern' },
  { value: 'America/Chicago',     label: 'Central' },
  { value: 'America/Denver',      label: 'Mountain' },
  { value: 'America/Los_Angeles', label: 'Pacific' },
  { value: 'America/Anchorage',   label: 'Alaska' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii' },
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function StepWelcome({ farm, setFarm, onStart }) {
  const unit = farm.units === 'metric' ? 'm' : 'ft';

  // Live frost lookup for preview
  const frostPreview = farm.zip.length === 5 ? getFrostInfo(farm.zip) : null;

  function update(field, value) {
    setFarm(f => ({ ...f, [field]: value }));
  }

  function handleZip(e) {
    const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
    update('zip', zip);
  }

  const totalBeds = farm.bedGroups.reduce((sum, g) => sum + g.count, 0);
  const totalArea = farm.bedGroups.reduce((sum, g) => sum + g.count * g.width * g.length, 0);
  const canStart = farm.zip.length === 5 && totalBeds > 0 && farm.bedGroups.every(g => g.width > 0 && g.length > 0);

  function updateGroup(id, field, value) {
    setFarm(f => ({
      ...f,
      bedGroups: f.bedGroups.map(g => g.id === id ? { ...g, [field]: value } : g),
    }));
  }

  function addGroup() {
    setFarm(f => {
      const nextGroupId = f.bedGroups.length > 0 ? Math.max(...f.bedGroups.map(g => g.id)) + 1 : 1;
      return { ...f, bedGroups: [...f.bedGroups, { id: nextGroupId, count: 2, width: 4, length: 25 }] };
    });
  }

  function removeGroup(id) {
    setFarm(f => f.bedGroups.length > 1
      ? { ...f, bedGroups: f.bedGroups.filter(g => g.id !== id) }
      : f
    );
  }

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.logoMark}>🌱</div>
        <h1 style={s.heroTitle}>Welcome to Farmio</h1>
        <p style={s.heroSub}>
          Your crop succession co-pilot. Tell us about your farm and we'll build a plan
          that maximizes every bed, every week.
        </p>
      </div>

      <div style={s.formCard}>
        {/* --- About --- */}
        <SectionHeader title="About Your Farm" />
        <div style={s.row}>
          <Field label="Farm Name" flex={2}>
            <input
              type="text"
              value={farm.farmName}
              onChange={e => update('farmName', e.target.value)}
              placeholder="e.g. Sunridge Acres"
              style={s.input}
            />
          </Field>
          <Field label="Measurement System" flex={1}>
            <div style={s.toggleRow}>
              <ToggleBtn
                active={farm.units === 'us'}
                onClick={() => update('units', 'us')}
                label="US Customary"
                first
              />
              <ToggleBtn
                active={farm.units === 'metric'}
                onClick={() => update('units', 'metric')}
                label="Metric"
                last
              />
            </div>
          </Field>
        </div>

        <Divider />

        {/* --- Location --- */}
        <SectionHeader title="Location" />
        <div style={s.row}>
          <Field label="Zip Code">
            <input
              type="text"
              inputMode="numeric"
              value={farm.zip}
              onChange={handleZip}
              placeholder="e.g. 90210"
              maxLength={5}
              style={{ ...s.input, width: 140 }}
            />
          </Field>
          <Field label="Time Zone">
            <select
              value={farm.timezone}
              onChange={e => update('timezone', e.target.value)}
              style={s.select}
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Divider />

        {/* --- Beds --- */}
        <SectionHeader title="Your Beds" />
        <p style={{ fontSize: 13, color: '#888', margin: '-8px 0 14px' }}>
          Group beds by size. Different dimensions? Add another group.
        </p>
        <div style={s.bedGroupList}>
          {farm.bedGroups.map((g, gi) => (
            <div key={g.id} style={s.bedGroupRow}>
              <Field label={gi === 0 ? 'Beds' : ''}>
                <input
                  type="number"
                  value={g.count}
                  onChange={e => updateGroup(g.id, 'count', Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  style={{ ...s.input, width: 60, textAlign: 'center' }}
                />
              </Field>
              <span style={s.bedGroupX}>×</span>
              <Field label={gi === 0 ? `Width (${unit})` : ''}>
                <input
                  type="number"
                  value={g.width}
                  onChange={e => updateGroup(g.id, 'width', parseFloat(e.target.value) || 0)}
                  min={0.5}
                  step={0.5}
                  style={{ ...s.input, width: 70 }}
                />
              </Field>
              <span style={s.bedGroupX}>×</span>
              <Field label={gi === 0 ? `Length (${unit})` : ''}>
                <input
                  type="number"
                  value={g.length}
                  onChange={e => updateGroup(g.id, 'length', parseFloat(e.target.value) || 0)}
                  min={1}
                  step={1}
                  style={{ ...s.input, width: 70 }}
                />
              </Field>
              <div style={{ alignSelf: gi === 0 ? 'flex-end' : 'center', paddingBottom: gi === 0 ? 2 : 0 }}>
                <button
                  onClick={() => removeGroup(g.id)}
                  disabled={farm.bedGroups.length <= 1}
                  style={{
                    ...s.removeGroupBtn,
                    color: farm.bedGroups.length > 1 ? '#c62828' : '#ccc',
                    cursor: farm.bedGroups.length > 1 ? 'pointer' : 'not-allowed',
                  }}
                  title="Remove group"
                >×</button>
              </div>
            </div>
          ))}
          <button onClick={addGroup} style={s.addGroupBtn}>+ Add bed group</button>
        </div>
        <p style={s.hint}>
          {totalBeds} beds total · {totalArea.toLocaleString()} {unit}² growing area
        </p>

        <Divider />

        {/* --- Season --- */}
        <SectionHeader title="Growing Season" />
        <div style={s.row}>
          <Field label="Typical Harvest Days / Week">
            <input
              type="number"
              value={farm.harvestDays}
              onChange={e => update('harvestDays', Math.max(1, Math.min(7, parseInt(e.target.value) || 1)))}
              min={1}
              max={7}
              style={{ ...s.input, width: 80 }}
            />
          </Field>
          <Field label="Season Start Month">
            <select
              value={farm.seasonStartMonth}
              onChange={e => update('seasonStartMonth', parseInt(e.target.value))}
              style={s.select}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </Field>
        </div>

        <Divider />

        {/* --- Frost --- */}
        <SectionHeader title="Frost Dates" />
        <div style={s.frostOptions}>
          <FrostOption
            active={farm.frostMode === 'farmio'}
            onClick={() => update('frostMode', 'farmio')}
            label="Use Farmio's recommended dates"
            sub={farm.zip.length === 5 ? '(based on your zip code)' : '(enter zip above)'}
          />
          {farm.frostMode === 'farmio' && frostPreview && (
            <div style={s.frostPreview}>
              <span style={s.frostPill}>Zone {frostPreview.zone}</span>
              <span style={s.frostPill}>Last frost ~ {frostPreview.startLabel}</span>
              <span style={s.frostPill}>First frost ~ {frostPreview.endLabel}</span>
            </div>
          )}

          <FrostOption
            active={farm.frostMode === 'own'}
            onClick={() => update('frostMode', 'own')}
            label="Enter my own frost dates"
            sub="If you know your local frost dates"
          />
          {farm.frostMode === 'own' && (
            <div style={s.ownFrostRow}>
              <Field label="Last Spring Frost">
                <input
                  type="date"
                  value={farm.ownLastFrost}
                  onChange={e => update('ownLastFrost', e.target.value)}
                  style={s.input}
                />
              </Field>
              <Field label="First Fall Frost">
                <input
                  type="date"
                  value={farm.ownFirstFrost}
                  onChange={e => update('ownFirstFrost', e.target.value)}
                  style={s.input}
                />
              </Field>
            </div>
          )}

          <FrostOption
            active={farm.frostMode === 'none'}
            onClick={() => update('frostMode', 'none')}
            label="Frost dates aren't relevant"
            sub="Tropical climate, indoor growing, etc."
          />
        </div>

        {/* --- Start --- */}
        <button
          onClick={onStart}
          disabled={!canStart}
          style={{
            ...s.startBtn,
            opacity: canStart ? 1 : 0.5,
            cursor: canStart ? 'pointer' : 'not-allowed',
          }}
        >
          Get Started →
        </button>
      </div>
    </div>
  );
}

/* --- sub-components --- */

function SectionHeader({ title }) {
  return <h3 style={s.sectionTitle}>{title}</h3>;
}

function Field({ label, children, flex }) {
  return (
    <div style={{ flex: flex || 1 }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={s.divider} />;
}

function ToggleBtn({ active, onClick, label, first, last }) {
  return (
    <button onClick={onClick} style={{
      ...s.toggleBtn,
      background: active ? P.primary : '#fff',
      color: active ? P.light : '#555',
      borderColor: active ? P.primary : '#ddd',
      borderRadius: first ? '8px 0 0 8px' : last ? '0 8px 8px 0' : 0,
      marginLeft: first ? 0 : -1.5,
    }}>
      {label}
    </button>
  );
}

function FrostOption({ active, onClick, label, sub }) {
  return (
    <button onClick={onClick} style={s.frostBtn}>
      <span style={{
        ...s.radio,
        borderColor: active ? P.active : '#ccc',
        background: active ? P.active : '#fff',
      }}>
        {active && <span style={s.radioDot} />}
      </span>
      <div>
        <span style={{ fontWeight: 600, color: '#333', fontSize: 14 }}>{label}</span>
        {sub && <span style={{ color: '#999', fontSize: 12, marginLeft: 6 }}>{sub}</span>}
      </div>
    </button>
  );
}

/* --- styles --- */

const s = {
  page: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '0 20px 60px',
  },
  hero: {
    textAlign: 'center',
    padding: '40px 0 36px',
  },
  logoMark: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: P.primary,
    margin: '0 0 12px',
    letterSpacing: '-0.5px',
  },
  heroSub: {
    fontSize: 15,
    color: '#666',
    lineHeight: 1.6,
    maxWidth: 440,
    margin: '0 auto',
  },
  formCard: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e8e8e8',
    padding: '32px 32px 36px',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: P.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 16px',
  },
  row: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
  },
  select: {
    padding: '9px 12px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    background: '#fff',
    minWidth: 140,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginBottom: 0,
  },
  toggleRow: {
    display: 'flex',
    gap: 0,
  },
  toggleBtn: {
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 600,
    border: '1.5px solid',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  divider: {
    height: 1,
    background: '#f0f0f0',
    margin: '24px 0',
  },
  frostOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  frostBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
    textAlign: 'left',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#fff',
  },
  frostPreview: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    padding: '4px 0 8px 30px',
  },
  frostPill: {
    background: P.light,
    color: P.primary,
    padding: '3px 10px',
    borderRadius: 16,
    fontSize: 11,
    fontWeight: 600,
  },
  ownFrostRow: {
    display: 'flex',
    gap: 16,
    padding: '8px 0 8px 30px',
  },
  bedGroupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  bedGroupRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  bedGroupX: {
    color: '#bbb',
    fontSize: 14,
    fontWeight: 600,
    paddingTop: 2,
  },
  removeGroupBtn: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    lineHeight: 1,
    padding: '4px 6px',
  },
  addGroupBtn: {
    alignSelf: 'flex-start',
    background: 'none',
    border: `1.5px solid ${P.active}`,
    borderRadius: 6,
    padding: '5px 14px',
    fontSize: 12,
    fontWeight: 600,
    color: P.active,
    cursor: 'pointer',
    marginTop: 4,
  },
  startBtn: {
    width: '100%',
    marginTop: 32,
    padding: '14px 28px',
    background: P.primary,
    color: P.light,
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
};

