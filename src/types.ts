export type FilingStatus = 'single' | 'married' | 'head';
export type Lifestyle = 'modest' | 'moderate' | 'comfortable';

export type StateCode =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY' | 'DC';

export interface StateInfo {
  name: string;
  /** Approximate effective income tax rate, applied to federal taxable income. */
  rate: number;
  /** 2026 minimum hourly wage. Federal $7.25 floor where state has none. */
  min: number;
}

export interface CityInfo {
  name: string;
  state: StateCode;
  tier: 'Very High' | 'High' | 'Moderate' | 'Lower' | 'Very Low';
  /** Local income tax (NYC, some Ohio cities, some PA municipalities). */
  localTax: number;
  rent1: number;            // 1BR median monthly rent
  rent3: number;            // 3BR family-sized monthly rent
  groceries: number;        // per person, monthly
  utilities: number;        // monthly
  transit: number;          // monthly transit pass
  carCost: number;          // total monthly car cost (loan + ins + gas + maint)
  childcareInfant: number;  // per child, monthly
  childcarePreschool: number;
  healthSingle: number;     // employer plan + OOP, monthly
  healthFamily: number;
}

export interface Scenario {
  id: string;
  label: string;
  income: number;
  /** Optional second-earner income. When > 0, household is treated as dual-earner. */
  incomeB?: number;
  filing: FilingStatus;
  city: string;
  kids: number;
  lifestyle: Lifestyle;
}

export interface BudgetInput {
  incomeA: number;
  incomeB?: number;
  filing: FilingStatus;
  city: string;
  kids: number;
  lifestyle: Lifestyle;
}

export interface BudgetResult {
  grossIncome: number;
  incomeA: number;
  incomeB: number;
  hasSecondIncome: boolean;
  adults: number;
  householdSize: number;
  // Tax components
  federalTax: number;       // post-credits, can be negative (refund)
  fedTaxRaw: number;        // pre-credits
  ctc: number;
  eitc: number;
  stateTax: number;
  localTax: number;
  fica: number;
  totalTaxes: number;
  taxableIncome: number;
  // Net & monthly
  netIncome: number;
  monthlyNet: number;
  // Expenses
  expenses: Record<string, number>;
  totalExpenses: number;
  discretionary: number;
  annualDiscretionary: number;
  // Suggested allocation of surplus
  suggestedSavings: number;
  suggestedVacation: number;
  suggestedSplurge: number;
  suggestedEmergency: number;
  // References
  cityData: CityInfo;
  stateData: StateInfo;
}

export type TaxBracket = readonly [number, number]; // [cap, rate]
