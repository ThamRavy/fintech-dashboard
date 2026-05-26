<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Category;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Display transactions
     */
    public function index(Request $request)
    {
        $transactions = Transaction::with('category')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Transactions retrieved successfully',
            'data' => $transactions
        ]);
    }

    /**
     * Store transaction
     */
    public function store(StoreTransactionRequest $request)
    {
        $user = $request->user();

        $data = $request->validated();

        $warning = null;

        // =========================================
        // AUTO CREATE CATEGORY IF CUSTOM INPUT
        // =========================================

        if (
            empty($data['category_id']) &&
            !empty($data['custom_category'])
        ) {

            $category = Category::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'name' => $data['custom_category'],
                    'type' => $data['type'],
                ]
            );

            // assign generated category id
            $data['category_id'] = $category->id;
        }

        // =========================================
        // BUDGET CHECK (ONLY EXPENSE)
        // =========================================

        if ($data['type'] === 'expense') {

            $date = $data['date'] ?? now();

            $monthStart = Carbon::parse($date)
                ->startOfMonth();

            // 🔍 Get budget for this month
            $budget = Budget::where(
                    'user_id',
                    $user->id
                )
                ->whereDate(
                    'month',
                    $monthStart
                )
                ->first();

            if ($budget) {

                // 🔥 Current expense total
                $spent = Transaction::where(
                        'user_id',
                        $user->id
                    )
                    ->where(
                        'type',
                        'expense'
                    )
                    ->whereBetween('date', [
                        $monthStart,
                        Carbon::parse($date)
                            ->endOfMonth()
                    ])
                    ->sum('amount');

                $newTotal =
                    $spent + $data['amount'];

                // ⚠️ Budget exceeded
                if (
                    $newTotal >
                    $budget->limit_amount
                ) {

                    $warning =
                        'You exceeded your monthly budget!';
                }

                // ⚠️ 80% warning
                elseif (
                    $newTotal >=
                    ($budget->limit_amount * 0.8)
                ) {

                    $warning =
                        'You are close to your budget limit (80%)';
                }
            }
        }

        // =========================================
        // CREATE TRANSACTION
        // =========================================

        $transaction = Transaction::create([
            'user_id' => $user->id,

            'category_id' =>
                $data['category_id'] ?? null,

            'amount' => $data['amount'],

            'type' => $data['type'],

            'date' => $data['date'],

            'description' =>
                $data['description'] ?? null,
        ]);

        // =========================================
        // RESPONSE
        // =========================================

        return response()->json([
            'message' =>
                'Transaction created successfully',

            'warning' => $warning,

            'data' => $transaction->load(
                'category'
            )
        ], 201);
    }

    /**
     * Show single transaction
     */
    public function show(Transaction $transaction)
    {
        // security check
        if (
            $transaction->user_id !== auth()->id()
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'message' =>
                'Transaction retrieved successfully',

            'data' => $transaction->load(
                'category'
            )
        ]);
    }

    /**
     * Delete transaction
     */
    public function destroy(Request $request, int $id)
    {
        $user = $request->user();

        // Find transaction
        $transaction = Transaction::find($id);

       // Not found
        if (!$transaction) {
            return response()->json([
                'message' => 'Transaction not found'
            ], 404);
        }

        // Security check
        if ($transaction->user_id !== $user->id) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        // Delete
        $transaction->delete();

        return response()->json([
            'message' => 'Transaction deleted successfully'
        ]);
    }
}