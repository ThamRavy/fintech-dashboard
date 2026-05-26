<?php
namespace App\Repositories;

use App\Models\Transaction;

class TransactionRepository
{
    public function getByUser($userId)
    {
        return Transaction::where('user_id', $userId)->get();
    }
}
