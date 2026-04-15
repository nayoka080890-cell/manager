<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'product_id',
        'product_name',
        'unit',
        'qty',
        'packaging_units_qty',
        'units_per_pack',
        'total_units',
        'billable_qty',
        'unit_price',
        'unit_cost',
        'line_total',
    ];
}
