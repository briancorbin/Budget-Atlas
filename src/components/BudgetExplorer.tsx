import { useMemo, useState } from 'react';
import type { FilingStatus, Lifestyle } from '@/types';
import { theme as T } from '@/theme';
import { computeBudget } from '@/lib/budget';
import { Masthead } from './Masthead';
import { ScenarioPicker, CustomizePanel, type InputsState } from './Inputs';
import { StatRow, StatusBanner } from './Summary';
import { IncomeFlow } from './IncomeFlow';
import { ExpenseBreakdown } from './ExpenseBreakdown';
import { DiscretionaryPlan } from './DiscretionaryPlan';
import { CityComparison } from './CityComparison';
import { Notes } from './Notes';

export function BudgetExplorer() {
  const [scenarioId, setScenarioId] = useState('teacher_oh');
  const [incomeA, setIncomeA] = useState(56000);
  const [incomeB, setIncomeB] = useState(54000);
  const [twoIncome, setTwoIncome] = useState(true);
  const [filing, setFiling] = useState<FilingStatus>('married');
  const [city, setCity] = useState('cmh');
  const [kids, setKids] = useState(2);
  const [lifestyle, setLifestyle] = useState<Lifestyle>('moderate');
  const [compareCity, setCompareCity] = useState('sf');

  const effectiveIncomeB = twoIncome ? incomeB : 0;

  const result = useMemo(
    () => computeBudget({ incomeA, incomeB: effectiveIncomeB, filing, city, kids, lifestyle }),
    [incomeA, effectiveIncomeB, filing, city, kids, lifestyle],
  );

  const inputState: InputsState = {
    scenarioId, setScenarioId,
    incomeA, setIncomeA,
    incomeB, setIncomeB,
    twoIncome, setTwoIncome,
    filing, setFiling,
    city, setCity,
    kids, setKids,
    lifestyle, setLifestyle,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg, color: T.ink,
      fontFamily: '"IBM Plex Sans", sans-serif',
      padding: '40px 24px 80px',
      backgroundImage:
        `radial-gradient(circle at 20% 0%, rgba(166, 38, 28, 0.04), transparent 50%),
         radial-gradient(circle at 80% 100%, rgba(45, 80, 22, 0.03), transparent 50%)`,
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Masthead />
        <ScenarioPicker {...inputState} />
        <CustomizePanel {...inputState} />
        <StatRow result={result} />
        <StatusBanner result={result} />
        <IncomeFlow result={result} />
        <ExpenseBreakdown result={result} />
        <DiscretionaryPlan result={result} />
        <CityComparison
          result={result}
          compareCity={compareCity} setCompareCity={setCompareCity}
          incomeA={incomeA} incomeB={effectiveIncomeB}
          filing={filing} kids={kids} lifestyle={lifestyle}
        />
        <Notes filing={filing} />
      </div>
    </div>
  );
}
