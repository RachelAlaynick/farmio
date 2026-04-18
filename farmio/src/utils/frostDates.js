const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseMonthDay(str, year) {
  const [mon, day] = str.split(' ');
  return new Date(year, MONTHS[mon], parseInt(day));
}

export function dateToInputString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const ZONES = [
  { min: 900, max: 961, zone: '9-10', start: 'Feb 15', end: 'Dec 1' },
  { min: 700, max: 799, zone: '8-9',  start: 'Feb 28', end: 'Nov 15' },
  { min: 300, max: 399, zone: '7-8',  start: 'Mar 15', end: 'Nov 1' },
  { min: 100, max: 299, zone: '5-6',  start: 'Apr 15', end: 'Oct 15' },
  { min: 600, max: 699, zone: '5-6',  start: 'Apr 30', end: 'Oct 1' },
  { min: 800, max: 899, zone: '4-6',  start: 'May 15', end: 'Sep 15' },
];

export function getFrostInfo(zip) {
  if (!zip || zip.length < 3) return null;
  const prefix = parseInt(zip.slice(0, 3));
  const year = new Date().getFullYear();

  const match = ZONES.find(z => prefix >= z.min && prefix <= z.max);
  const zone = match || { zone: '6', start: 'Apr 15', end: 'Oct 15' };

  return {
    zone: zone.zone,
    start: parseMonthDay(zone.start, year),
    end: parseMonthDay(zone.end, year),
    startLabel: zone.start,
    endLabel: zone.end,
  };
}
