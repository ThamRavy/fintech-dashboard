<?php
namespace App\Helpers;

class ResponseHelper
{
    public static function success($data = null)
    {
        return response()->json([
            'status' => true,
            'data' => $data
        ]);
    }

    public static function error($message)
    {
        return response()->json([
            'status' => false,
            'message' => $message
        ]);
    }
}
