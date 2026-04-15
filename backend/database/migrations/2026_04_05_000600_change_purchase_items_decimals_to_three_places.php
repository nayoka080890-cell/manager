<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement(
            'ALTER TABLE purchase_items
               MODIFY qty DECIMAL(13,3) NOT NULL DEFAULT 1,
               MODIFY unit_cost DECIMAL(13,3) NOT NULL DEFAULT 0,
               MODIFY line_total DECIMAL(13,3) NOT NULL DEFAULT 0,
               MODIFY bundle_qty DECIMAL(13,3) NULL,
               MODIFY units_per_bundle DECIMAL(13,3) NULL,
               MODIFY total_units DECIMAL(13,3) NULL,
               MODIFY total_weight DECIMAL(13,3) NULL,
               MODIFY price_per_weight DECIMAL(13,3) NULL'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement(
            'ALTER TABLE purchase_items
             MODIFY qty DECIMAL(12,2) NOT NULL DEFAULT 1,
             MODIFY unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
             MODIFY line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
             MODIFY bundle_qty DECIMAL(12,2) NULL,
             MODIFY units_per_bundle DECIMAL(12,2) NULL,
             MODIFY total_units DECIMAL(12,2) NULL,
             MODIFY total_weight DECIMAL(12,2) NULL,
             MODIFY price_per_weight DECIMAL(12,2) NULL'
        );
    }
};
