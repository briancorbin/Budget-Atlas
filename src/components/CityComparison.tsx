import type { BudgetResult, FilingStatus, Lifestyle } from '@/types';
import { useMemo } from 'react';
import { theme as T, fonts } from '@/theme';
import { fmt, fmtSigned } from '@/lib/format';
import { CITIES } from '@/data/cities';
import { computeBudget } from '@/lib/budget';
import { SectionTitle } from './ui';

export function CityComparison({
  result, compareCity, setCompareCity,
  incomeA, incomeB, filing, kids, lifestyle,
}: {
  result: BudgetResult;
  compareCity: string;
  setCompareCity: (c: string) => void;
  incomeA: number;
  incomeB: number;
  filing: FilingStatus;
  kids: number;
  lifestyle: Lifestyle;
}) {
  const compare = useMemo(
    () => computeBudget({ incomeA, incomeB, filing, city: compareCity, kids, lifestyle }),
    [incomeA, incomeB, filing, compareCity, kids, lifestyle],
  );

  const sides = [
    { city: result.cityData, data: result, label: 'Current' },
    { city: compare.cityData, data: compare, label: 'Comparison' },
  ];

  return (
    <div style={{ marginBottom: 40 }}>
      <SectionTitle kicker="The same income, somewhere else">
        A geographic comparison
      </SectionTitle>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, padding: 24 }}>
        <div style={{ marginBottom: 18, fontFamily: fonts.body, fontSize: 14, color: T.inkSoft }}>
          Same household, same income — different city.
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{
            fontSize: 12, color: T.inkSoft, display: 'block',
            marginBottom: 6, letterSpacing: '0.05em',
          }}>COMPARE WITH</label>
          <select
            value={compareCity} onChange={e => setCompareCity(e.target.value)}
            style={{
              padding: '8px 12px', fontFamily: fonts.body, fontSize: 14,
              background: T.bg, border: `1px solid ${T.border}`,
              color: T.ink, outline: 'none', minWidth: 280,
            }}>
            {Object.entries(CITIES).map(([id, c]) => (
              <option key={id} value={id}>{c.name}, {c.state} — {c.tier}</option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 1, background: T.border,
        }}>
          {sides.map((side, idx) => {
            const other = sides[1 - idx].data;
            const winning = side.data.discretionary >= 0 && side.data.discretionary >= other.discretionary;
            return (
              <div key={idx} style={{ background: T.bg, padding: 24, position: 'relative' }}>
                {winning && side.data.discretionary >= 0 && (
                  <div style={{
                    position: 'absolute', top: 12, right: 16,
                    fontSize: 10, letterSpacing: '0.15em', color: T.positive, fontWeight: 600,
                  }}>▲ MORE LEFT OVER</div>
                )}
                <div style={{ fontSize: 11, color: T.inkMuted, letterSpacing: '0.12em' }}>
                  {side.label.toUpperCase()}
                </div>
                <div style={{ fontFamily: fonts.display, fontSize: 22, marginTop: 4, marginBottom: 16 }}>
                  {side.city.name}, {side.city.state}
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr',
                  columnGap: 24, rowGap: 8, fontSize: 13,
                }}>
                  <span style={{ color: T.inkSoft }}>State tax</span>
                  <span style={{ fontFamily: fonts.mono, textAlign: 'right' }}>
                    {fmt(side.data.stateTax + side.data.localTax)}
                  </span>
                  <span style={{ color: T.inkSoft }}>Take-home</span>
                  <span style={{ fontFamily: fonts.mono, textAlign: 'right', color: T.positive }}>
                    {fmt(side.data.netIncome)}
                  </span>
                  <span style={{ color: T.inkSoft }}>Housing</span>
                  <span style={{ fontFamily: fonts.mono, textAlign: 'right' }}>
                    {fmt(side.data.expenses.Housing)}/mo
                  </span>
                  <span style={{ color: T.inkSoft }}>Childcare</span>
                  <span style={{ fontFamily: fonts.mono, textAlign: 'right' }}>
                    {kids > 0 ? fmt(side.data.expenses.Childcare) + '/mo' : '—'}
                  </span>
                  <span style={{ color: T.inkSoft }}>Total expenses</span>
                  <span style={{ fontFamily: fonts.mono, textAlign: 'right' }}>
                    {fmt(side.data.totalExpenses)}/mo
                  </span>
                </div>
                <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 18, paddingTop: 14 }}>
                  <div style={{ fontSize: 11, color: T.inkMuted, letterSpacing: '0.12em' }}>
                    DISCRETIONARY / MO
                  </div>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 26,
                    color: side.data.discretionary >= 0 ? T.positive : T.accent,
                  }}>
                    {fmtSigned(side.data.discretionary)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 16, fontFamily: fonts.display, fontSize: 16,
          color: T.inkSoft, fontStyle: 'italic', lineHeight: 1.5,
        }}>
          {result.discretionary > compare.discretionary
            ? `Difference: ${fmt(result.discretionary - compare.discretionary)}/mo more breathing room in ${result.cityData.name}.`
            : `Difference: ${fmt(compare.discretionary - result.discretionary)}/mo more breathing room in ${compare.cityData.name}.`}
          {' '}Geography is destiny — but only after you net out housing, taxes, and childcare.
        </div>
      </div>
    </div>
  );
}
