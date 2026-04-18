import { useState } from 'react';
import StepWelcome from './components/StepWelcome';
import Dashboard from './components/Dashboard';
import Step1Farm from './components/Step1Farm';
import Step2Crops from './components/Step2Crops';
import Step3Plan from './components/Step3Plan';
import CropLibrary from './components/CropLibrary';
import { CROP_DB } from './data/crops';
import { generatePlan } from './utils/algorithm';
import { getFrostInfo, dateToInputString } from './utils/frostDates';
import { P } from './constants/palette';
import './App.css';

let _id = 0;
function nextId() { return ++_id; }

function makeCrop(name) {
  const db = CROP_DB.find(c => c.name === name) || CROP_DB[0];
  return {
    id: nextId(),
    name: db.name,
    dtm: db.dtm,
    hw: db.hw,
    yieldPerBed: db.yieldPerBed,
    price: db.price,
    locked: false,
    demand: 0,
  };
}

function detectTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  catch { return 'America/New_York'; }
}

const INITIAL_FARM = {
  farmName: '', units: 'us', zip: '', timezone: detectTimezone(),
  bedGroups: [
    { id: 1, count: 10, width: 4, length: 25 },
    { id: 2, count: 2, width: 3, length: 50 },
  ],
  harvestDays: 3, seasonStartMonth: 3,
  frostMode: 'farmio', ownLastFrost: '', ownFirstFrost: '',
  beds: [], seasonStart: '', seasonEnd: '', frostInfo: null,
};

const CP_STEPS = ['cp-beds', 'cp-crops', 'cp-plan'];

export default function App() {
  const [page, setPage] = useState('welcome');
  const [farm, setFarm] = useState(INITIAL_FARM);
  const [crops, setCrops] = useState(() => ['Salad mix', 'Tomatoes', 'Kale'].map(makeCrop));
  const [plan, setPlan] = useState(null);
  const [bedOverrides, setBedOverrides] = useState({});

  function handleWelcomeStart() {
    const year = new Date().getFullYear();
    const beds = [];
    let n = 1;
    farm.bedGroups.forEach(g => {
      for (let i = 0; i < g.count; i++) {
        beds.push({ id: n, name: `Bed ${n}`, width: g.width, length: g.length, selected: true });
        n++;
      }
    });

    let seasonStart, seasonEnd, frostInfo = null;
    if (farm.frostMode === 'farmio' && farm.zip.length === 5) {
      frostInfo = getFrostInfo(farm.zip);
      seasonStart = dateToInputString(frostInfo.start);
      seasonEnd = dateToInputString(frostInfo.end);
    } else if (farm.frostMode === 'own' && farm.ownLastFrost && farm.ownFirstFrost) {
      seasonStart = farm.ownLastFrost;
      seasonEnd = farm.ownFirstFrost;
    } else {
      const m = farm.seasonStartMonth;
      seasonStart = dateToInputString(new Date(year, m, 1));
      seasonEnd = dateToInputString(new Date(year, m + 6, 1));
    }

    setFarm(f => ({ ...f, beds, seasonStart, seasonEnd, frostInfo }));
    setPage('dashboard');
  }

  function handleDashboardNav(moduleId) {
    if (moduleId === 'crop-planner') setPage('cp-beds');
    else if (moduleId === 'crop-library') setPage('crop-library');
    else if (moduleId === 'settings') setPage('welcome');
  }

  function runPlan(overrides) {
    const o = overrides || bedOverrides;
    const p = generatePlan(farm, crops, o);
    setPlan(p);
    return p;
  }

  function handleGenerate() {
    setBedOverrides({});
    runPlan({});
    setPage('cp-plan');
  }

  function handleAdjustBeds(cropId, beds) {
    const next = { ...bedOverrides, [cropId]: beds };
    setBedOverrides(next);
    runPlan(next);
  }

  function handleAddCropAndOpen(name) {
    setCrops(prev => [...prev, makeCrop(name)]);
    setPage('cp-crops');
  }

  // Header config
  const isWelcome = page === 'welcome';
  const isCP = page.startsWith('cp-');
  const cpStep = CP_STEPS.indexOf(page) + 1;

  return (
    <div style={{ minHeight: '100vh', background: P.offWhite }}>
      {!isWelcome && (
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setPage('dashboard')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <span style={{ color: P.mint, fontSize: 22, fontWeight: 700 }}>🌱 Farmio</span>
            </button>
            {farm.farmName && (
              <span style={{ color: P.light, fontSize: 13, opacity: 0.6 }}>{farm.farmName}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isCP && (
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3].map(s => (
                  <div key={s} style={{
                    width: 28, height: 4, borderRadius: 2,
                    background: cpStep >= s ? P.mint : 'rgba(255,255,255,0.2)',
                  }} />
                ))}
              </div>
            )}
          </div>
        </header>
      )}

      <main style={{
        maxWidth: isWelcome ? 700 : 960,
        margin: '0 auto',
        padding: isWelcome ? '0 20px 40px' : '32px 20px',
      }}>
        {page === 'welcome' && (
          <StepWelcome farm={farm} setFarm={setFarm} onStart={handleWelcomeStart} />
        )}
        {page === 'dashboard' && (
          <Dashboard farm={farm} onNavigate={handleDashboardNav} />
        )}
        {page === 'crop-library' && (
          <CropLibrary
            farm={farm}
            crops={crops}
            onBack={() => setPage('dashboard')}
            onAddCrop={handleAddCropAndOpen}
          />
        )}
        {page === 'cp-beds' && (
          <Step1Farm
            farm={farm}
            setFarm={setFarm}
            onNext={() => setPage('cp-crops')}
            onBack={() => setPage('dashboard')}
          />
        )}
        {page === 'cp-crops' && (
          <Step2Crops
            crops={crops}
            setCrops={setCrops}
            makeCrop={makeCrop}
            farm={farm}
            onBack={() => setPage('cp-beds')}
            onGenerate={handleGenerate}
          />
        )}
        {page === 'cp-plan' && plan && (
          <Step3Plan
            plan={plan}
            farm={farm}
            onBack={() => setPage('cp-crops')}
            onAdjustBeds={handleAdjustBeds}
          />
        )}
      </main>
    </div>
  );
}

const headerStyle = {
  background: P.headerBg,
  padding: '14px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};
