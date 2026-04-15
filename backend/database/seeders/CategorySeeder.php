<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'description' => 'Electronic items and gadgets',
                'status' => 'Active',
            ],
            [
                'name' => 'Office Supplies',
                'description' => 'Daily office use products',
                'status' => 'Active',
            ],
            [
                'name' => 'Furniture',
                'description' => 'Office and home furniture products',
                'status' => 'Active',
            ],
            [
                'name' => 'Maintenance',
                'description' => 'Repair and maintenance items',
                'status' => 'Active',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
