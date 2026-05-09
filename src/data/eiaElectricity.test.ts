import { describe, it, expect } from 'vitest';
import {
  RESIDENTIAL_ELECTRICITY_PRICE_2026_FEB,
  NATIONAL_AVG_RESIDENTIAL_ELECTRICITY_2026_FEB,
  eiaElectricityFactor,
} from './eiaElectricity';
import type { StateCode } from '@/types';

const ALL_STATES: StateCode[] = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC',
];

describe('EIA residential electricity prices', () => {
  it('covers all 51 jurisdictions', () => {
    for (const s of ALL_STATES) {
      expect(RESIDENTIAL_ELECTRICITY_PRICE_2026_FEB[s]).toBeGreaterThan(0);
    }
    expect(Object.keys(RESIDENTIAL_ELECTRICITY_PRICE_2026_FEB).sort()).toEqual(
      [...ALL_STATES].sort(),
    );
  });

  it('preserves the well-known relative ordering: HI > CA > NY > national avg > ND', () => {
    // Hawaii is famously the most expensive (island grid, imported fuel);
    // North Dakota is one of the cheapest (cheap coal/wind). California
    // and the Northeast cluster well above the national mean.
    expect(RESIDENTIAL_ELECTRICITY_PRICE_2026_FEB.HI).toBeGreaterThan(
      RESIDENTIAL_ELECTRICITY_PRICE_2026_FEB.CA,
    );
    expect(RESIDENTIAL_ELECTRICITY_PRICE_2026_FEB.CA).toBeGreaterThan(
      RESIDENTIAL_ELECTRICITY_PRICE_2026_FEB.NY,
    );
    expect(RESIDENTIAL_ELECTRICITY_PRICE_2026_FEB.NY).toBeGreaterThan(
      NATIONAL_AVG_RESIDENTIAL_ELECTRICITY_2026_FEB,
    );
    expect(NATIONAL_AVG_RESIDENTIAL_ELECTRICITY_2026_FEB).toBeGreaterThan(
      RESIDENTIAL_ELECTRICITY_PRICE_2026_FEB.ND,
    );
  });

  it('national average is in a sane range (¢15–22/kWh as of 2026)', () => {
    expect(NATIONAL_AVG_RESIDENTIAL_ELECTRICITY_2026_FEB).toBeGreaterThan(15);
    expect(NATIONAL_AVG_RESIDENTIAL_ELECTRICITY_2026_FEB).toBeLessThan(22);
  });

  it('eiaElectricityFactor: HI > 2× national, ND < 0.7× national', () => {
    expect(eiaElectricityFactor('HI')).toBeGreaterThan(2);
    expect(eiaElectricityFactor('ND')).toBeLessThan(0.7);
    // CA factor ≈ 1.81× (CA $33.22 / national avg ~$18.36)
    expect(eiaElectricityFactor('CA')).toBeGreaterThan(1.7);
    expect(eiaElectricityFactor('CA')).toBeLessThan(2.0);
  });
});
