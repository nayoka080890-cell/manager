<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->renameColumn('bundle_qty', 'packaging_units_qty');
            $table->renameColumn('units_per_bundle', 'units_per_pack');
            $table->renameColumn('total_weight', 'billable_qty');
            $table->renameColumn('price_per_weight', 'unit_price');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->renameColumn('packaging_units_qty', 'bundle_qty');
            $table->renameColumn('units_per_pack', 'units_per_bundle');
            $table->renameColumn('billable_qty', 'total_weight');
            $table->renameColumn('unit_price', 'price_per_weight');
        });
    }
};
