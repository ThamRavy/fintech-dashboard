<?php

namespace App\Http\Controllers;

use App\Services\InsightService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected $service;

    public function __construct(InsightService $service)
    {
        $this->service = $service;
    }

    /**
     * 📊 GET /api/dashboard
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $data = $this->service->generateDashboard($user->id);

        return response()->json([
            'message' => 'Dashboard data retrieved successfully',
            'data' => $data
        ]);
    }
}
