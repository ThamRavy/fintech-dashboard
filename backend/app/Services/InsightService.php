<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Budget;
use Carbon\Carbon;

class InsightService
{
    public function generateDashboard($userId)
    {
        $start = now()->startOfMonth();
        $end = now()->endOfMonth();

        $transactions = Transaction::with('category')
            ->where('user_id', $userId)
            ->whereBetween('date', [$start, $end])
            ->get();

        // 🔹 Summary
        $income = $transactions->where('type', 'income')->sum('amount');
        $expense = $transactions->where('type', 'expense')->sum('amount');

        // 🔹 Budget
        $budget = Budget::where('user_id', $userId)
            ->whereDate('month', $start)
            ->first();

        $budgetData = null;

        if ($budget) {
            $remaining = $budget->limit_amount - $expense;

            $usedPercentage = $budget->limit_amount > 0
                ? round(($expense / $budget->limit_amount) * 100, 2)
                : 0;

            $budgetData = [
                'limit' => (float) $budget->limit_amount,
                'spent' => (float) $expense,
                'remaining' => (float) $remaining,
                'used_percentage' => $usedPercentage,
                'status' => $remaining < 0
                    ? 'over'
                    : ($usedPercentage >= 80 ? 'warning' : 'safe')
            ];
        }

        // 🔹 Top Category
        $topCategory = $transactions
            ->where('type', 'expense')
            ->groupBy('category_id')
            ->map(fn($items) => $items->sum('amount'))
            ->sortDesc();

        $topCategoryData = null;

        if ($topCategory->isNotEmpty()) {
            $topId = $topCategory->keys()->first();
            $topAmount = $topCategory->first();
            $category = $transactions->firstWhere('category_id', $topId)?->category;

            if ($category) {
                $topCategoryData = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'amount' => (float) $topAmount
                ];
            }
        }

        // 🔹 Category Breakdown (with percentage)
        $categoryBreakdown = $transactions
            ->where('type', 'expense')
            ->groupBy(fn($t) => $t->category?->name ?? 'Other')
            ->map(function ($items) use ($expense) {
                $total = $items->sum('amount');

                return [
                    'name' => $items->first()->category?->name ?? 'Other',
                    'amount' => (float) $total,
                    'percentage' => $expense > 0
                        ? round(($total / $expense) * 100, 2)
                        : 0
                ];
            })
            ->values();

        // 🔹 Daily Spending (FULL month timeline)
        $grouped= $transactions
            ->where('type', 'expense')
            ->groupBy(function($t){
                return Carbon::parse($t->date)->format('Y-m-d');
            })
            ->map(function($items){
                return $items->sum('amount');
            });

        $daily = collect(range(1, $start->daysInMonth))->map(function ($day) use ($grouped, $start) {
            $date = $start->copy()->addDays($day - 1)->format('Y-m-d');

            return [
                'date' => $date,
                'amount' => (float) ($grouped[$date] ??  0)
            ];
        });

        // 🔹 Anomaly Detection (Z-score based)

        $dailyTotals = $grouped; // reuse your grouped daily data

        $values = $dailyTotals->values();

        // mean
        $mean = $values->avg() ?? 0;

        // standard deviation
        $stdDev = 0;

        if ($values->count() > 1) {
            $variance = $values->map(fn($v) => pow($v - $mean, 2))->avg();
            $stdDev = sqrt($variance);
        }

        $spikeDay = null;
        $spikeAmount = 0;
        
        if($dailyTotals->count()== 1) {
            $spikeDay = $dailyTotals->keys()->first();
            $spikeAmount = (float) $dailyTotals->first();
        }else {
            foreach ($dailyTotals as $date => $amount) {
                if ($stdDev > 0) {
                    $zScore = ($amount - $mean) / $stdDev;

                    if (abs($zScore) > 2) { // threshold for anomaly
                        $spikeDay = $date;
                        $spikeAmount = (float) $amount;
                        break; // only report first anomaly
                    }
                }else {
                    if ($amount > $mean * 2 && $amount > 0) {
                        $spikeDay = $date;
                        $spikeAmount = (float) $amount;
                    }
                    break;
                }
            }
        }

        // 🔹 Category Anomaly Detection

        $categoryTotals = $transactions
            ->where('type', 'expense')
            ->groupBy('category_id')
            ->map(fn($items) => $items->sum('amount'));
            
        $categorySpike = null;

        // mean
        $mean = $categoryTotals->avg() ?? 0;

        // standard deviation
        $stdDev = 0;

        if ($categoryTotals->count() > 1) {
            $variance = $categoryTotals
                ->map(fn($v) => pow($v - $mean, 2))
                ->avg();

            $stdDev = sqrt($variance);
        }

        // ✅ CASE 1: Only one category
        if ($categoryTotals->count() === 1) {

            $categoryId = $categoryTotals->keys()->first();
            $amount = $categoryTotals->first();

            $category = $transactions->firstWhere('category_id', $categoryId)?->category;

            if ($category) {
                $categorySpike = [
                    'name' => $category->name,
                    'amount' => (float) $amount
                ];
            }
        } else {
           // ✅ CASE 2: Multiple categories (REAL detection)
            foreach ($categoryTotals as $categoryId => $amount) {

                $category = $transactions->firstWhere('category_id', $categoryId)?->category;

                if (!$category) continue;

                if ($stdDev > 0) {
                    $zScore = ($amount - $mean) / $stdDev;

                    if ($zScore > 2) {
                        $categorySpike = [
                            'name' => $category->name,
                            'amount' => (float) $amount
                        ];
                        break;
                    }
                } else {
                    // fallback
                    if ($amount > $mean * 2 && $amount > 0) {
                        $categorySpike = [
                            'name' => $category->name,
                            'amount' => (float) $amount
                        ];
                        break;
                    }
                }
            }
        }

        // 🔹 Weekly spending
        $weeklySpending = [];
        $weeksInMonth = ceil($start->daysInMonth / 7);

        for ($week = 1; $week <= $weeksInMonth; $week++) {
            $weekStart = $start->copy()->addDays(($week - 1) * 7);
            $weekEnd = $weekStart->copy()->addDays(6)->endOfDay();

            // prevent overflow into next month
            if ($weekEnd->month !== $start->month) {
                $weekEnd = $end;
            }

            $amount = $transactions
                ->where('type', 'expense')
                ->filter(function ($t) use ($weekStart, $weekEnd) {
                    $date = \Carbon\Carbon::parse($t->date);
                    return $date->between($weekStart, $weekEnd);
                })
                ->sum('amount');
        
            $weeklySpending[] = [
                'week' => "Week $week",
                'amount' => (float) $amount
            ];
        }

        // 🔹 Monthly Comparison
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        $lastMonthExpense = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$lastMonthStart, $lastMonthEnd])
            ->where('type', 'expense')
            ->sum('amount');

        $changePercentage = $lastMonthExpense > 0
            ? round((($expense - $lastMonthExpense) / $lastMonthExpense) * 100, 2)
            : 0;

        // 🔹 Insights (smarter)
        $insights = [];

        if ($transactions->isEmpty()) {
            $insights[] = "No transactions this month";
        }

        if ($budgetData) {
            if ($budgetData['status'] === 'over') {
                $diff = abs($budgetData['remaining']);
                $insights[] = "You exceeded your budget by $diff";
            } elseif ($budgetData['status'] === 'warning') {
                $insights[] = "You're close to your budget limit";
            } else {
                $insights[] = "You are within your budget";
            }
        } else {
            $insights[] = "No budget set";
        }

        if ($topCategoryData) {
            $insights[] = "Top spending category: {$topCategoryData['name']}";
        }

        if ($changePercentage > 0) {
            $insights[] = "Spending increased by {$changePercentage}% compared to last month";
        }
        if($spikeDay) {
            $insights[] = "Unusual spending detected on {$spikeDay} with amount {$spikeAmount}";
        }else {
            $insights[] = "No unusual spending detected";
        }

        if ($categorySpike) {
            $insights[] = "Unusual spending in {$categorySpike['name']} ({$categorySpike['amount']})";
        } else {
            $insights[] = "No unusual category spending detected";
        }

        $recommendations = [];

        $daysLeft = now()->daysInMonth - now()->day;
        $dayText = $daysLeft === 1 ? 'day' : 'days';

        //Budget-based recommendation
        if($budgetData){
            if($budgetData['status'] === 'over') {
                $overAmount = abs($budgetData['remaining']);
                $perDayCut = $daysLeft > 0 ? round($overAmount / $daysLeft, 2) : $overAmount;
                $recommendations[] = "Reduce daily spending by about {$perDayCut} for the next {$daysLeft} {$dayText}";

            }elseif($budgetData['status'] === 'warning') {
                $recommendations[] = "You are close to your budget limit. Consider reducing non-essential expenses";
            }
        }

        // 🔹 2. Category Focus (ROOT CAUSE)
        if($categorySpike) {
            $recommendations[] = "Review recent transactions in {$categorySpike['name']} to identify unnecessary expenses";
        }
        //🔹 3. Spending Trend (ADAPTIVE)
        if($changePercentage > 20) {
            $recommendations[] = "Your spending increased by {$changePercentage}% compared to last month";
        }

        // 🔹 4. Category Growth vs Last Month (AI-like)
        $lastMonthCategoryTotals = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$lastMonthStart, $lastMonthEnd])
            ->where('type', 'expense')
            ->get()
            ->groupBy('category_id')
            ->map(fn($items) => $items->sum('amount'));

        foreach($categoryTotals as $categoryId => $amount) {
            $lastAmount = $lastMonthCategoryTotals[$categoryId] ?? 0;

            if ($lastAmount > 0) {
                $growth =(($amount - $lastAmount) / $lastAmount) * 100;

                if ($growth > 30) {
                    $category = $transactions->firstWhere('category_id', $categoryId)?->category;

                    if ($category) {
                        $recommendations[] = "{$category->name} spending increased by " . round($growth, 1) . "% vs last month";
                    }
                }
            }
        }

        // 🔹 5. Weekend Behavior Detection
        $weekendSpending =0;
        $weekdaySpending =0;
        
        foreach($transactions ->where('type', 'expense') as $t) {
            $day = Carbon::parse($t->date)->dayOfWeek;
            if ($day === 0 || $day === 6) {
                $weekendSpending += $t->amount;
            } else {
                $weekdaySpending += $t->amount;
            }
        }

        if ($weekendSpending > $weekdaySpending) {
            $recommendations[] = "You spend more on weekends. Try limiting weekend expenses";
        }

        // 🔹 6. Predict Future Risk
        $currentDay = now()->day;
        $daysInMonth = now()->daysInMonth;

        if($currentDay > 0){
            $projectedExpense = ($expense / $currentDay) * $daysInMonth;
            
            if($budgetData && $projectedExpense > $budgetData['limit']) {
                $diff = round($projectedExpense - $budgetData['limit'], 2);
                $recommendations[] = "At current pace, you may exceed your budget by {$diff}";
            }
        }

        //limit output to top 3 recommendations
        $recommendations = array_slice($recommendations, 0, 3);



        // 🔹 Final Response
        return [
            'currency' => 'USD',

            'summary' => [
                'total_income' => (float) $income,
                'total_expense' => (float) $expense,
                'balance' => (float) ($income - $expense),
            ],

            'budget' => $budgetData,

            'comparison' => [
                'last_month_expense' => (float) $lastMonthExpense,
                'change_percentage' => $changePercentage
            ],

            'top_category' => $topCategoryData,

            'category_breakdown' => $categoryBreakdown,

            'daily_spending' => $daily,

            'weekly_spending' => $weeklySpending,

            'recommendations' => $recommendations,
            

            'insights' => $insights
        ];

    }
}