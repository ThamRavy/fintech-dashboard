<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
        ]);
        $user->sendEmailVerificationNotification();
        //$token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'message' => 'Registration successful. Please check your email to verify your account.',
            'date'=>[
                'user'  => $user->only(['id', 'name', 'email']),
                //'token' => $token,
            ]
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        // delete user tokens first (Sanctum)
        $user->tokens()->delete();

        $user->delete();

        return response()->json([
            'message' => 'User account deleted successfully'
        ]);
    }

}