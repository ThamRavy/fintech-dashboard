<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'amount',
        'type',
        'date'
    ];

    public function category()
    {
        return $this->belongsTo(\App\Models\Category::class);
    }

    protected $casts = [
        'date' => 'date',
    ];

}
