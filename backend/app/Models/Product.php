<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'display_name',
        'sku',
        'specifications',
        'thinkness',
        'weight',
        'description',
        'unit',
        'packaging_unit',
        'units_per_pack',
        'billable_unit',
        'purchase_price',
        'selling_price',
        'status',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
