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
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('supplier_id')->constrained('branches')->nullOnDelete();
            $table->foreignId('warehouse_id')->nullable()->after('branch_id')->constrained('warehouses')->nullOnDelete();
            $table->index('branch_id');
            $table->index('warehouse_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['warehouse_id']);
            $table->dropIndex(['branch_id']);
            $table->dropIndex(['warehouse_id']);
            $table->dropColumn(['branch_id', 'warehouse_id']);
        });
    }
};
