<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Symfony\Component\Mime\Email;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // 📩 verify email
    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();
        return response()->json([
            'message' => 'Email verified successfully.'
        ]);
    })->middleware(['auth:sanctum', 'signed'])->name('verification.verify');

    // 🔁 resend email
    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json([
            'message' => 'Verification email resent.'
        ]);
    });


    // 👤 User
    Route::delete('/user', [AuthController::class, 'destroy']);

    // 💸 Transactions
    Route::apiResource('transactions', TransactionController::class);

    // 🏷️ Categories
    Route::apiResource('categories', CategoryController::class);

    // 📊 Budgets
    Route::apiResource('budgets', BudgetController::class);

    // 📈 Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| TEST ROUTE
|--------------------------------------------------------------------------
*/

Route::get('/test', function () {
    return response()->json([
        'message' => 'Finally my API is working!🎉'
    ]);
});
