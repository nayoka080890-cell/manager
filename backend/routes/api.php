<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'ok' => true,
        'service' => 'qhmanage-backend',
    ]);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);

Route::apiResource('categories', CategoryController::class)->except(['show']);
Route::apiResource('branches', BranchController::class)->except(['show']);
Route::apiResource('warehouses', WarehouseController::class)->except(['show']);
Route::post('products/import', [ProductController::class, 'import']);
Route::apiResource('products', ProductController::class)->except(['show']);
Route::apiResource('customers', CustomerController::class)->except(['show']);
Route::apiResource('suppliers', SupplierController::class)->except(['show']);
Route::get('invoices/next-number', [InvoiceController::class, 'nextNumber']);
Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'addPayment']);
Route::delete('invoices/{invoice}/payments/{payment}', [InvoiceController::class, 'destroyPayment']);
Route::apiResource('invoices', InvoiceController::class);
Route::get('purchases/next-number', [PurchaseController::class, 'nextNumber']);
Route::post('purchases/{purchase}/payments', [PurchaseController::class, 'addPayment']);
Route::delete('purchases/{purchase}/payments/{payment}', [PurchaseController::class, 'destroyPayment']);
Route::apiResource('purchases', PurchaseController::class);
Route::apiResource('users', UserController::class)->except(['show']);
