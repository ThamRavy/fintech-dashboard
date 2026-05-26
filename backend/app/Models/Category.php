<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'type',
    ];

    public function transactions()
    {
        return $this->hasMany(\App\Models\Transaction::class);
    }
}
