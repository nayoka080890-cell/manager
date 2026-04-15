<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $electronics = Category::where('name', 'Electronics')->first();
        $office = Category::where('name', 'Office Supplies')->first();
        $furniture = Category::where('name', 'Furniture')->first();

        $products = [
            [
                'category_id' => $electronics?->id,
                'name' => 'Thermal Receipt Printer',
                'sku' => 'ELEC-0001',
                'specifications' => '80mm, USB, LAN',
                'unit' => 'pcs',
                'packaging_unit' => 'Box',
                'purchase_price' => 120.00,
                'selling_price' => 160.00,
                'status' => 'Active',
            ],
            [
                'category_id' => $electronics?->id,
                'name' => 'Barcode Scanner',
                'sku' => 'ELEC-0002',
                'specifications' => '2D scanner, USB',
                'unit' => 'pcs',
                'packaging_unit' => 'Box',
                'purchase_price' => 45.00,
                'selling_price' => 65.00,
                'status' => 'Active',
            ],
            [
                'category_id' => $office?->id,
                'name' => 'A4 Copy Paper',
                'sku' => 'OFF-0001',
                'specifications' => '80gsm, 500 sheets',
                'unit' => 'ream',
                'packaging_unit' => 'Pallet',
                'purchase_price' => 3.50,
                'selling_price' => 4.75,
                'status' => 'Active',
            ],
            [
                'category_id' => $furniture?->id,
                'name' => 'Office Chair',
                'sku' => 'FUR-0001',
                'specifications' => 'Ergonomic, adjustable height',
                'unit' => 'pcs',
                'packaging_unit' => 'Piece',
                'purchase_price' => 55.00,
                'selling_price' => 85.00,
                'status' => 'Active',
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['sku' => $product['sku']],
                $product
            );
        }
    }
}
