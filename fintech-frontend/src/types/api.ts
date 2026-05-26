export interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface Budget {
  limit: number;
  spent: number;
  remaining: number;
  used_percentage: number;
  status: "safe" | "warning" | "over";
}

export interface Category {
  id: number;
  name: string;
  amount: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface WeeklySpending {
  week: string;
  amount: number;
}

export interface Comparison {
  last_month_expense: number;
  change_percentage: number;
}

export interface DashboardData {
  currency: string;

  summary: Summary;

  budget: Budget | null;

  comparison: Comparison;

  top_category: Category | null;

  category_breakdown: CategoryBreakdown[];

  daily_spending: DailySpending[];

  weekly_spending: WeeklySpending[];

  recommendations: string[];

  insights: string[];
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}