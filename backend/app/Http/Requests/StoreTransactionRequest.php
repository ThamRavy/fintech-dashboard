<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;


class StoreTransactionRequest extends FormRequest
{
    /**
     * Allow only authenticated users to make this request.
     */
    public function authorize(): bool
    {
        return true; // Ensure the user is authenticated
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0'],
            'type' => ['required', 'string', 'in:income,expense'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * if custom error messages.
     */
    public function messages(): array
    {        return [
            'amount.required' => 'Amount is required.',
            'amount.numeric' => 'Amount must be a number.',
            'amount.min' => 'Amount must be at least 0.',
            'type.required' => 'Type is required.',
            'type.string' => 'Type must be a string.',
            'type.in' => 'Type must be either income or expense.',
            'category_id.exists' => 'Selected category does not exist.',
            'date.required' => 'Date is required.',
            'date.date' => 'Date must be a valid date.',
            'description.string' => 'Description must be a string.',
            'description.max' => 'Description cannot exceed 255 characters.',
        ];
    }
}
