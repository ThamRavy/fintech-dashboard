<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'amount' => (float) $this->amount,
            'type' => $this->type,

            'category' => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'type' => $this->category->type,
            ] : null,

            'date' => $this->date
                ? $this->date->format('Y-m-d')
                : null,

            'description' => $this->description,

            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
