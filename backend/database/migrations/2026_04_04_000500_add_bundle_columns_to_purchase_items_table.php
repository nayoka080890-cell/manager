<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->decimal('bundle_qty', 12, 2)->nullable()->after('qty');
            $table->decimal('units_per_bundle', 12, 2)->nullable()->after('bundle_qty');
            $table->decimal('total_units', 12, 2)->nullable()->after('units_per_bundle');
            $table->decimal('total_weight', 12, 2)->nullable()->after('total_units');
            $table->decimal('price_per_weight', 12, 2)->nullable()->after('total_weight');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->dropColumn([
                'bundle_qty',
                'units_per_bundle',
                'total_units',
                'total_weight',
                'price_per_weight',
            ]);
        });
    }
};