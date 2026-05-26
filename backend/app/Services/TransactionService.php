<?php
namespace App\Services;

use App\Models\Transaction;

class TransactionService
{
    public function getUserTransactions($userId)
    {
        return Transaction::where('user_id', $userId)->get();
    }

    public function createTransaction(array $data, int $userId)
    {
        $data['user_id'] = $userId;
        return Transaction::create([
            'user_id' => $userId,
            'category_id' => $data['category_id'] ?? null,
            'amount' => $data['amount'],
            'type' => $data['type'],
            'date' => $data['date'] ?? now(), // ✅ FIX
        ]);
    }

    public function deleteTransaction($id, $userId)
    {
        $deleted = \App\Models\Transaction::where('id', $id)
            ->where('user_id', $userId)
            ->delete() > 0;
        return $deleted
        ? response()->json(['message' => 'Deleted successfully'])
        : response()->json(['message' => 'Transaction not found'], 404);
    }
}
