import type { StateCode, StateInfo } from '@/types';

/**
 * State approximate effective income tax rate at middle incomes ($50–150K)
 * and 2026 minimum wage. Real graduated brackets shift this by 1–2 points
 * at the high and low extremes.
 *
 * Sources: Tax Foundation 2026 State Income Tax Rates; DOL state minimum
 * wage tables; NCSL state minimum wage chart (Jan/Jul 2026 effective).
 */
export const STATES: Record<StateCode, StateInfo> = {
  AL: { name: 'Alabama',        rate: 0.040,  min: 7.25 },
  AK: { name: 'Alaska',         rate: 0.000,  min: 13.00 },
  AZ: { name: 'Arizona',        rate: 0.025,  min: 15.15 },
  AR: { name: 'Arkansas',       rate: 0.039,  min: 11.00 },
  CA: { name: 'California',     rate: 0.075,  min: 16.90 },
  CO: { name: 'Colorado',       rate: 0.044,  min: 15.16 },
  CT: { name: 'Connecticut',    rate: 0.055,  min: 16.94 },
  DE: { name: 'Delaware',       rate: 0.052,  min: 15.00 },
  FL: { name: 'Florida',        rate: 0.000,  min: 14.00 },
  GA: { name: 'Georgia',        rate: 0.0509, min: 7.25 },
  HI: { name: 'Hawaii',         rate: 0.070,  min: 16.00 },
  ID: { name: 'Idaho',          rate: 0.058,  min: 7.25 },
  IL: { name: 'Illinois',       rate: 0.0495, min: 15.00 },
  IN: { name: 'Indiana',        rate: 0.0295, min: 7.25 },
  IA: { name: 'Iowa',           rate: 0.038,  min: 7.25 },
  KS: { name: 'Kansas',         rate: 0.052,  min: 7.25 },
  KY: { name: 'Kentucky',       rate: 0.035,  min: 7.25 },
  LA: { name: 'Louisiana',      rate: 0.030,  min: 7.25 },
  ME: { name: 'Maine',          rate: 0.065,  min: 15.10 },
  MD: { name: 'Maryland',       rate: 0.050,  min: 15.00 },
  MA: { name: 'Massachusetts',  rate: 0.050,  min: 15.00 },
  MI: { name: 'Michigan',       rate: 0.0425, min: 13.73 },
  MN: { name: 'Minnesota',      rate: 0.068,  min: 11.13 },
  MS: { name: 'Mississippi',    rate: 0.044,  min: 7.25 },
  MO: { name: 'Missouri',       rate: 0.047,  min: 13.75 },
  MT: { name: 'Montana',        rate: 0.059,  min: 10.55 },
  NE: { name: 'Nebraska',       rate: 0.052,  min: 15.00 },
  NV: { name: 'Nevada',         rate: 0.000,  min: 12.00 },
  NH: { name: 'New Hampshire',  rate: 0.000,  min: 7.25 },
  NJ: { name: 'New Jersey',     rate: 0.055,  min: 15.50 },
  NM: { name: 'New Mexico',     rate: 0.047,  min: 12.00 },
  NY: { name: 'New York',       rate: 0.065,  min: 16.50 },
  NC: { name: 'North Carolina', rate: 0.0425, min: 7.25 },
  ND: { name: 'North Dakota',   rate: 0.0195, min: 7.25 },
  OH: { name: 'Ohio',           rate: 0.035,  min: 10.70 },
  OK: { name: 'Oklahoma',       rate: 0.0475, min: 7.25 },
  OR: { name: 'Oregon',         rate: 0.084,  min: 14.70 },
  PA: { name: 'Pennsylvania',   rate: 0.0307, min: 7.25 },
  RI: { name: 'Rhode Island',   rate: 0.0475, min: 16.00 },
  SC: { name: 'South Carolina', rate: 0.062,  min: 7.25 },
  SD: { name: 'South Dakota',   rate: 0.000,  min: 11.50 },
  TN: { name: 'Tennessee',      rate: 0.000,  min: 7.25 },
  TX: { name: 'Texas',          rate: 0.000,  min: 7.25 },
  UT: { name: 'Utah',           rate: 0.0465, min: 7.25 },
  VT: { name: 'Vermont',        rate: 0.066,  min: 14.01 },
  VA: { name: 'Virginia',       rate: 0.050,  min: 12.41 },
  WA: { name: 'Washington',     rate: 0.000,  min: 17.13 },
  WV: { name: 'West Virginia',  rate: 0.046,  min: 8.75 },
  WI: { name: 'Wisconsin',      rate: 0.055,  min: 7.25 },
  WY: { name: 'Wyoming',        rate: 0.000,  min: 7.25 },
  DC: { name: 'D.C.',           rate: 0.075,  min: 17.95 },
};
