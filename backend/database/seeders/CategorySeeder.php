<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Food'],
            ['name' => 'Transport'],
            ['name' => 'Shopping'],
            ['name' => 'Salary']
        ];

        Category::insert($categories);
    }
}
