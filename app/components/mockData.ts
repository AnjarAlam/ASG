// src/data/mockData.ts
export interface StockRow {
  area: string;
  grade: string;
  type: string;
  size: string;
  inward: string;
  outward: string;
  balance: string;
  date: string;
  time: string;
}

export const stockData: StockRow[] = [
  // 01-Jan-2026
  { area: 'A', grade: 'E', type: 'ROM', size: '20–50', inward: '600', outward: '470', balance: '130', date: '01-Jan-2026', time: '17:00' },
  { area: 'B', grade: 'F', type: 'Steam', size: '50–80', inward: '450', outward: '320', balance: '130', date: '01-Jan-2026', time: '17:00' },
  { area: 'C', grade: 'G9', type: 'Washed', size: '0–20', inward: '1450', outward: '1320', balance: '130', date: '01-Jan-2026', time: '17:00' },

  // 02-Jan-2026
  { area: 'A', grade: 'E', type: 'ROM', size: '20–50', inward: '500', outward: '450', balance: '50', date: '02-Jan-2026', time: '17:00' },
  { area: 'B', grade: 'F', type: 'Steam', size: '50–80', inward: '600', outward: '520', balance: '80', date: '02-Jan-2026', time: '17:00' },
  { area: 'C', grade: 'G9', type: 'Washed', size: '0–20', inward: '700', outward: '630', balance: '70', date: '02-Jan-2026', time: '17:00' },

  // 03-Jan-2026
  { area: 'A', grade: 'E', type: 'ROM', size: '20–50', inward: '320', outward: '270', balance: '50', date: '03-Jan-2026', time: '17:00' },
  { area: 'B', grade: 'F', type: 'Steam', size: '50–80', inward: '280', outward: '220', balance: '60', date: '03-Jan-2026', time: '17:00' },
  { area: 'C', grade: 'G9', type: 'Washed', size: '0–20', inward: '1450', outward: '1330', balance: '120', date: '03-Jan-2026', time: '17:00' },

  // 04-Jan-2026
  { area: 'A', grade: 'E', type: 'ROM', size: '20–50', inward: '310', outward: '260', balance: '50', date: '04-Jan-2026', time: '17:00' },
  { area: 'B', grade: 'F', type: 'Steam', size: '50–80', inward: '290', outward: '210', balance: '80', date: '04-Jan-2026', time: '17:00' },
  { area: 'C', grade: 'G9', type: 'Washed', size: '0–20', inward: '1460', outward: '1340', balance: '120', date: '04-Jan-2026', time: '17:00' },

  // 05-Jan-2026
  { area: 'A', grade: 'E', type: 'ROM', size: '20–50', inward: '330', outward: '280', balance: '50', date: '05-Jan-2026', time: '17:00' },
  { area: 'B', grade: 'F', type: 'Steam', size: '50–80', inward: '300', outward: '230', balance: '70', date: '05-Jan-2026', time: '17:00' },
  { area: 'C', grade: 'G9', type: 'Washed', size: '0–20', inward: '1470', outward: '1350', balance: '120', date: '05-Jan-2026', time: '17:00' },

  // 06-Jan-2026
  { area: 'A', grade: 'E', type: 'ROM', size: '20–50', inward: '340', outward: '290', balance: '50', date: '06-Jan-2026', time: '17:00' },
  { area: 'B', grade: 'F', type: 'Steam', size: '50–80', inward: '310', outward: '240', balance: '70', date: '06-Jan-2026', time: '17:00' },
  { area: 'C', grade: 'G9', type: 'Washed', size: '0–20', inward: '1480', outward: '1360', balance: '120', date: '06-Jan-2026', time: '17:00' },

  // 07-Jan-2026
  { area: 'A', grade: 'E', type: 'ROM', size: '20–50', inward: '350', outward: '300', balance: '50', date: '07-Jan-2026', time: '17:00' },
  { area: 'B', grade: 'F', type: 'Steam', size: '50–80', inward: '320', outward: '250', balance: '70', date: '07-Jan-2026', time: '17:00' },
  { area: 'C', grade: 'G9', type: 'Washed', size: '0–20', inward: '1490', outward: '1370', balance: '120', date: '07-Jan-2026', time: '17:00' },

  // 08-Jan-2026
  { area: 'A', grade: 'E', type: 'ROM', size: '20–50', inward: '360', outward: '310', balance: '50', date: '08-Jan-2026', time: '17:00' },
  { area: 'B', grade: 'F', type: 'Steam', size: '50–80', inward: '330', outward: '260', balance: '70', date: '08-Jan-2026', time: '17:00' },
  { area: 'C', grade: 'G9', type: 'Washed', size: '0–20', inward: '1500', outward: '1380', balance: '120', date: '08-Jan-2026', time: '17:00' },
];
