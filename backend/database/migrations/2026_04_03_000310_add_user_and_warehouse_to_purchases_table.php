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
        if (!Schema::hasColumn('purchases', 'warehouse_id')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->foreignId('warehouse_id')
                    ->nullable()
                    ->after('branch_id')
                    ->constrained('warehouses')
                    ->nullOnDelete();
                $table->index('warehouse_id');
            });
        }

        if (!Schema::hasColumn('purchases', 'user_id')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('warehouse_id')
                    ->constrained('users')
                    ->nullOnDelete();
                $table->index('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('purchases', 'user_id')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropIndex(['user_id']);
                $table->dropColumn('user_id');
            });
        }

        if (Schema::hasColumn('purchases', 'warehouse_id')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->dropForeign(['warehouse_id']);
                $table->dropIndex(['warehouse_id']);
                $table->dropColumn('warehouse_id');
            });
        }
    }
};
