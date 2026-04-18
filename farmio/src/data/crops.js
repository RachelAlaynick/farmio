// Lifecycle stages (days between milestones):
//   sowToHarden  – sow seed → hardening off begins
//   hardenDays   – hardening off duration
//   daysInGround – transplant → first harvest
//   hw           – harvest window (weeks)
//
// For direct-sow crops, sowToHarden and hardenDays are 0;
// daysInGround = dtm.
//
// Constraint: sowToHarden + hardenDays + daysInGround = dtm

export const CROP_DB = [
  // --- Greens ---
  { name: 'Salad mix',    dtm: 35, hw: 3,  yieldPerBed: 8,  price: 10,  spacing: 6,  directSow: false, sowToHarden: 21, hardenDays: 5, daysInGround: 9   },
  { name: 'Lettuce head', dtm: 55, hw: 2,  yieldPerBed: 12, price: 3,   spacing: 12, directSow: false, sowToHarden: 28, hardenDays: 5, daysInGround: 22  },
  { name: 'Spinach',      dtm: 42, hw: 3,  yieldPerBed: 7,  price: 8,   spacing: 6,  directSow: true,  sowToHarden: 0,  hardenDays: 0, daysInGround: 42  },
  { name: 'Arugula',      dtm: 40, hw: 3,  yieldPerBed: 7,  price: 10,  spacing: 6,  directSow: true,  sowToHarden: 0,  hardenDays: 0, daysInGround: 40  },
  { name: 'Kale',         dtm: 55, hw: 6,  yieldPerBed: 10, price: 4,   spacing: 18, directSow: false, sowToHarden: 28, hardenDays: 7, daysInGround: 20  },
  { name: 'Chard',        dtm: 50, hw: 8,  yieldPerBed: 9,  price: 4,   spacing: 12, directSow: false, sowToHarden: 21, hardenDays: 7, daysInGround: 22  },

  // --- Roots ---
  { name: 'Radish',       dtm: 28, hw: 1,  yieldPerBed: 10, price: 4,   spacing: 2,  directSow: true,  sowToHarden: 0,  hardenDays: 0, daysInGround: 28  },
  { name: 'Carrots',      dtm: 70, hw: 4,  yieldPerBed: 15, price: 3,   spacing: 3,  directSow: true,  sowToHarden: 0,  hardenDays: 0, daysInGround: 70  },
  { name: 'Beets',        dtm: 60, hw: 4,  yieldPerBed: 14, price: 3,   spacing: 4,  directSow: true,  sowToHarden: 0,  hardenDays: 0, daysInGround: 60  },

  // --- Fruiting ---
  { name: 'Cucumber',     dtm: 55, hw: 8,  yieldPerBed: 18, price: 3,   spacing: 12, directSow: false, sowToHarden: 21, hardenDays: 5, daysInGround: 29  },
  { name: 'Zucchini',     dtm: 50, hw: 8,  yieldPerBed: 20, price: 2.5, spacing: 24, directSow: false, sowToHarden: 21, hardenDays: 5, daysInGround: 24  },
  { name: 'Tomatoes',     dtm: 80, hw: 10, yieldPerBed: 25, price: 4,   spacing: 24, directSow: false, sowToHarden: 42, hardenDays: 7, daysInGround: 31  },
  { name: 'Peppers',      dtm: 75, hw: 10, yieldPerBed: 14, price: 4,   spacing: 18, directSow: false, sowToHarden: 42, hardenDays: 7, daysInGround: 26  },
  { name: 'Bush beans',   dtm: 55, hw: 4,  yieldPerBed: 14, price: 4,   spacing: 6,  directSow: true,  sowToHarden: 0,  hardenDays: 0, daysInGround: 55  },

  // --- Herbs ---
  { name: 'Basil',        dtm: 30, hw: 6,  yieldPerBed: 4,  price: 12,  spacing: 12, directSow: false, sowToHarden: 14, hardenDays: 5, daysInGround: 11  },
  { name: 'Cilantro',     dtm: 25, hw: 2,  yieldPerBed: 5,  price: 8,   spacing: 6,  directSow: true,  sowToHarden: 0,  hardenDays: 0, daysInGround: 25  },

  // --- Specialty ---
  { name: 'Microgreens',  dtm: 10, hw: 1,  yieldPerBed: 3,  price: 25,  spacing: 1,  directSow: true,  sowToHarden: 0,  hardenDays: 0, daysInGround: 10  },

  // --- Brassicas ---
  { name: 'Broccoli',     dtm: 65, hw: 3,  yieldPerBed: 10, price: 4,   spacing: 18, directSow: false, sowToHarden: 28, hardenDays: 7, daysInGround: 30  },
  { name: 'Cabbage',      dtm: 70, hw: 2,  yieldPerBed: 20, price: 2,   spacing: 18, directSow: false, sowToHarden: 28, hardenDays: 7, daysInGround: 35  },

  // --- Custom ---
  { name: 'Custom',       dtm: 50, hw: 4,  yieldPerBed: 10, price: 5,   spacing: 12, directSow: false, sowToHarden: 21, hardenDays: 7, daysInGround: 22  },
];
