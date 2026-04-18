const MS_PER_DAY = 86400000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function weekOf(date, origin) {
  return Math.floor((date - origin) / MS_PER_WEEK);
}

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(d) {
  return `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

function buildSuccessions(dtm, hw, yieldPerBed, price, beds, seasonStart, seasonEnd) {
  const results = [];
  let plantDate = new Date(seasonStart.getTime());

  while (plantDate < seasonEnd) {
    const harvestStart = addDays(plantDate, dtm);
    if (harvestStart >= seasonEnd) break;

    const harvestEnd = addDays(harvestStart, hw * 7);
    const capped = harvestEnd <= seasonEnd ? harvestEnd : seasonEnd;
    const harvestDays = (capped - harvestStart) / MS_PER_DAY;
    const harvestWeeks = harvestDays / 7;
    const revenue = beds * yieldPerBed * price * harvestWeeks;

    results.push({
      plantDate: new Date(plantDate),
      harvestStart: new Date(harvestStart),
      harvestEnd: new Date(capped),
      harvestWeeks: Math.round(harvestWeeks * 10) / 10,
      revenue: Math.round(revenue),
      plantDateStr: fmtDate(plantDate),
      harvestStartStr: fmtDate(harvestStart),
      harvestEndStr: fmtDate(capped),
    });

    plantDate = new Date(harvestEnd.getTime());
  }

  return results;
}

function detectMode(crops) {
  const anyPrice = crops.some(c => Number(c.price) > 0);
  if (!anyPrice) return 'simple';
  if (crops.every(c => c.locked)) return 'demand';
  if (crops.every(c => !c.locked)) return 'supply';
  return 'blended';
}

function allocateBeds(crops, totalBeds, mode) {
  const alloc = {};

  if (mode === 'simple') {
    const each = Math.max(1, Math.floor(totalBeds / crops.length));
    crops.forEach(c => { alloc[c.id] = each; });
    return alloc;
  }

  let used = 0;
  crops.forEach(c => {
    if (c.locked) {
      const demand = Number(c.demand) || 0;
      const yld = Number(c.yieldPerBed) || 1;
      const beds = demand > 0 ? Math.ceil(demand / yld) : 2;
      alloc[c.id] = beds;
      used += beds;
    }
  });

  const unlocked = crops.filter(c => !c.locked);
  if (unlocked.length === 0) return alloc;

  const avail = Math.max(0, totalBeds - used);
  const scores = unlocked.map(c => Number(c.yieldPerBed) * Number(c.price));
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const minBeds = 2;
  const totalMin = unlocked.length * minBeds;

  if (avail <= totalMin) {
    const each = Math.max(1, Math.floor(avail / unlocked.length));
    unlocked.forEach(c => { alloc[c.id] = each; });
  } else {
    const extra = avail - totalMin;
    unlocked.forEach((c, i) => {
      const bonus = totalScore > 0 ? Math.floor(extra * scores[i] / totalScore) : 0;
      alloc[c.id] = minBeds + bonus;
    });
  }

  return alloc;
}

export function generatePlan(farm, crops, bedOverrides = {}) {
  const seasonStart = parseDate(farm.seasonStart);
  const seasonEnd = parseDate(farm.seasonEnd);
  const selectedBeds = farm.beds.filter(b => b.selected);
  const totalBeds = selectedBeds.length;

  if (seasonEnd <= seasonStart || totalBeds === 0) {
    return {
      mode: 'simple', cropPlans: [], calendarGrid: [],
      weeklyBedUsage: [], weekDates: [], selectedBeds: [],
      bedScheduleGrid: [],
      metrics: { totalRevenue: 0, totalSuccessions: 0, seasonWeeks: 0, peakBedUse: 0, totalBeds },
      hasConflict: false,
    };
  }

  const seasonWeeks = Math.ceil((seasonEnd - seasonStart) / MS_PER_WEEK);
  const mode = detectMode(crops);
  const bedAlloc = allocateBeds(crops, totalBeds, mode);

  // Apply manual bed overrides
  Object.entries(bedOverrides).forEach(([id, beds]) => {
    bedAlloc[id] = beds;
  });

  const cropPlans = crops.map(crop => {
    const beds = bedAlloc[crop.id] || 2;
    const dtm = parseInt(crop.dtm);
    const hw = parseInt(crop.hw);
    const yld = Number(crop.yieldPerBed);
    const price = Number(crop.price);

    const successions = buildSuccessions(dtm, hw, yld, price, beds, seasonStart, seasonEnd);
    const totalRevenue = successions.reduce((s, x) => s + x.revenue, 0);

    return {
      crop,
      beds,
      assignedBeds: [],
      successions,
      totalRevenue,
      revenuePerBed: beds > 0 ? Math.round(totalRevenue / beds) : 0,
    };
  });

  // Assign specific beds to each crop sequentially
  let bedIdx = 0;
  cropPlans.forEach(plan => {
    const assigned = [];
    for (let i = 0; i < plan.beds && bedIdx < selectedBeds.length; i++) {
      assigned.push(selectedBeds[bedIdx]);
      bedIdx++;
    }
    plan.assignedBeds = assigned;
  });

  // Calendar grid: each crop row → array of '' | 'P' | 'H'
  const calendarGrid = cropPlans.map(plan => {
    const row = new Array(seasonWeeks).fill('');
    plan.successions.forEach(s => {
      const pw = weekOf(s.plantDate, seasonStart);
      if (pw >= 0 && pw < seasonWeeks) row[pw] = 'P';

      const hs = weekOf(s.harvestStart, seasonStart);
      const he = Math.ceil((s.harvestEnd - seasonStart) / MS_PER_WEEK);
      for (let w = hs; w < he && w < seasonWeeks; w++) {
        if (w >= 0 && row[w] !== 'P') row[w] = 'H';
      }
    });
    return row;
  });

  // Weekly bed usage
  const weeklyBedUsage = new Array(seasonWeeks).fill(0);
  cropPlans.forEach(plan => {
    if (plan.successions.length === 0) return;
    const first = plan.successions[0].plantDate;
    const last = plan.successions[plan.successions.length - 1].harvestEnd;
    const sw = Math.max(0, weekOf(first, seasonStart));
    const ew = Math.min(seasonWeeks - 1, Math.ceil((last - seasonStart) / MS_PER_WEEK) - 1);
    for (let w = sw; w <= ew; w++) {
      weeklyBedUsage[w] += plan.assignedBeds.length;
    }
  });

  const peakBedUse = weeklyBedUsage.length > 0 ? Math.max(...weeklyBedUsage) : 0;

  // Bed schedule grid: [bedIndex][weekIndex] = { cropName, cropIndex } | null
  const bedScheduleGrid = selectedBeds.map(() => new Array(seasonWeeks).fill(null));
  cropPlans.forEach((plan, ci) => {
    plan.assignedBeds.forEach(bed => {
      const bi = selectedBeds.findIndex(b => b.id === bed.id);
      if (bi === -1) return;
      plan.successions.forEach(s => {
        const sw = Math.max(0, weekOf(s.plantDate, seasonStart));
        const ew = Math.min(seasonWeeks - 1, Math.ceil((s.harvestEnd - seasonStart) / MS_PER_WEEK) - 1);
        for (let w = sw; w <= ew; w++) {
          bedScheduleGrid[bi][w] = {
            cropName: plan.crop.name,
            cropIndex: ci,
            isPlanting: weekOf(s.plantDate, seasonStart) === w,
          };
        }
      });
    });
  });

  // Week date labels
  const weekDates = Array.from({ length: seasonWeeks }, (_, i) => fmtDate(addDays(seasonStart, i * 7)));

  // Yield & area metrics
  const totalYield = cropPlans.reduce((s, p) => {
    const yld = Number(p.crop.yieldPerBed);
    return s + p.successions.reduce((ss, x) => ss + p.beds * yld * x.harvestWeeks, 0);
  }, 0);

  const growingArea = cropPlans.reduce((s, p) => {
    return s + p.assignedBeds.reduce((ss, b) => ss + b.width * b.length, 0);
  }, 0);

  const totalPlantings = cropPlans.reduce((s, p) => s + p.successions.length * p.beds, 0);

  return {
    mode,
    cropPlans,
    calendarGrid,
    weeklyBedUsage,
    weekDates,
    selectedBeds,
    bedScheduleGrid,
    metrics: {
      totalRevenue: cropPlans.reduce((s, p) => s + p.totalRevenue, 0),
      totalSuccessions: cropPlans.reduce((s, p) => s + p.successions.length, 0),
      seasonWeeks,
      peakBedUse,
      totalBeds,
      totalYield: Math.round(totalYield),
      growingArea: Math.round(growingArea),
      totalPlantings,
    },
    hasConflict: peakBedUse > totalBeds,
  };
}
