<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use Carbon\Carbon;

class BudgetService
{
    /**
     * Check budget status for a new transaction
     */
    public function checkBudget(int $userId, float $amount, string $type, $date = null): ?array
    {
        // ✅ Only check expense
        if ($type !== 'expense') {
            return null;
        }

        $date = $date ?? now();
        $monthStart = Carbon::parse($date)->startOfMonth();
        $monthEnd = Carbon::parse($date)->endOfMonth();

        $budget = Budget::where('user_id', $userId)
            ->whereDate('month', $monthStart)
            ->first();

        if (!$budget) {
            return null;
        }

        // 🔥 Calculate current spending
        $spent = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->sum('amount');

        $newTotal = $spent + $amount;

        return [
            'limit' => $budget->limit_amount,
            'spent' => $spent,
            'new_total' => $newTotal,
            'remaining' => $budget->limit_amount - $newTotal,
            'exceeded' => $newTotal > $budget->limit_amount,
            'warning' => $this->getWarning($newTotal, $budget->limit_amount)
        ];
    }

    /**
     * Generate warning message
     */
    private function getWarning($total, $limit): ?string
    {
        if ($total > $limit) {
            return 'You exceeded your monthly budget!';
        }

        if ($total >= ($limit * 0.8)) {
            return 'You are close to your budget limit (80%)';
        }

        return null;
    }
}
