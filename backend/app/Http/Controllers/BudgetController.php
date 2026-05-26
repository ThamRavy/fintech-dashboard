<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Http\Resources\BudgetResource;


use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BudgetController extends Controller
{
    
    public function __construct()
    {
        $this->authorizeResource(Budget::class, 'budget');
    }

    public function index(Request $request)
    {
        $month = $request->query('month')
            ? Carbon::parse($request->query('month'))->startOfMonth()
            : now()->startOfMonth();

        $budget = Budget::where('user_id', $request->user()->id)
            ->whereDate('month', $month)
            ->first();

        return $budget
            ? new BudgetResource($budget)
            : response()->json(null);
    }

    public function store(StoreBudgetRequest $request)
    {
        $data = $request->validated();

        $month = Carbon::parse($data['month'])->startOfMonth();

        $budget = Budget::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'month' => $month,
            ],
            [
                'limit_amount' => $data['limit_amount'],
            ]
        );

        return (new BudgetResource($budget))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Budget $budget)
    {
        return new BudgetResource($budget);
    }

    public function update(UpdateBudgetRequest $request, Budget $budget)
    {
        $data = $request->validated();

        if (isset($data['month'])) {
            $data['month'] = Carbon::parse($data['month'])->startOfMonth();
        }

        $budget->update($data);

        return new BudgetResource($budget);
    }

    public function destroy(Budget $budget)
    {
        $budget->delete();

        return response()->json([
            'message' => 'Budget deleted successfully'
        ]);
    }
}
