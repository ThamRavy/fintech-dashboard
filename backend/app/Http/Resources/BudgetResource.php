<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'limit_amount' => (float) $this->limit_amount,

            'month' => $this->month
                ? \Carbon\Carbon::parse($this->month)->format('Y-m-d')
                : null,

            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
