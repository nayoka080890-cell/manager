<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ProductController extends Controller
{
    private function normalizeHeader(string $value): string
    {
        $normalized = mb_strtolower(trim($value));
        $normalized = preg_replace('/\s+/u', ' ', $normalized);

        return $normalized ?? '';
    }

    private function parseNumber(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        $text = trim((string) $value);
        if ($text === '') {
            return null;
        }

        $text = str_replace(' ', '', $text);
        if (str_contains($text, ',') && !str_contains($text, '.')) {
            $text = str_replace(',', '.', $text);
        } else {
            $text = str_replace(',', '', $text);
        }
        if (!is_numeric($text)) {
            return null;
        }

        return (float) $text;
    }

    private function parseInteger(mixed $value): ?int
    {
        $number = $this->parseNumber($value);
        if ($number === null) {
            return null;
        }

        return (int) round($number);
    }

    private function getTotalInventoryQuantityForProduct(int $productId): float
    {
        if ($productId <= 0) {
            return 0;
        }

        return (float) (DB::table('inventory')
            ->where('product_id', $productId)
            ->sum('quantity') ?? 0);
    }

    public function index(): JsonResponse
    {
        $quantitiesByProduct = DB::table('inventory')
            ->selectRaw('product_id, SUM(quantity) as total_quantity')
            ->groupBy('product_id')
            ->pluck('total_quantity', 'product_id');

        $products = Product::query()->with('category')->latest()->get()->map(function (Product $product) use ($quantitiesByProduct) {
            $totalQuantity = (float) ($quantitiesByProduct[$product->id] ?? 0);

            return [
                'id' => $product->id,
                'name' => $product->name,
                'displayName' => $product->display_name,
                'sku' => $product->sku,
                'specifications' => $product->specifications,
                'thinkness' => $product->thinkness,
                'weight' => $product->weight !== null ? (float) $product->weight : null,
                'description' => $product->description,
                'unit' => $product->unit,
                'packagingUnit' => $product->packaging_unit,
                'unitsPerPack' => $product->units_per_pack,
                'billableUnit' => $product->billable_unit,
                'quantity' => $totalQuantity,
                'purchasePrice' => (float) $product->purchase_price,
                'sellingPrice' => (float) $product->selling_price,
                'category' => $product->category?->name ?? '',
                'createdAt' => $product->created_at?->toDateString(),
            ];
        });

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'displayName' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255', 'unique:products,sku'],
            'specifications' => ['nullable', 'string', 'max:255'],
            'thinkness' => ['nullable', 'string', 'max:100'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'unit' => ['required', 'string', 'max:50'],
            'packagingUnit' => ['nullable', 'string', 'max:100'],
            'unitsPerPack' => ['nullable', 'integer', 'min:0'],
            'billableUnit' => ['nullable', 'string', 'max:100'],
            'purchasePrice' => ['required', 'numeric', 'min:0'],
            'sellingPrice' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string', 'max:255'],
        ]);

        $categoryId = null;
        if (!empty($data['category'])) {
            $category = Category::firstOrCreate(['name' => trim($data['category'])], ['status' => 'Active']);
            $categoryId = $category->id;
        }

        $product = Product::create([
            'category_id' => $categoryId,
            'name' => $data['name'],
            'display_name' => $data['displayName'] ?? null,
            'sku' => $data['sku'] ?? null,
            'specifications' => $data['specifications'] ?? null,
            'thinkness' => $data['thinkness'] ?? null,
            'weight' => $data['weight'] ?? null,
            'description' => $data['description'] ?? null,
            'unit' => $data['unit'],
            'packaging_unit' => $data['packagingUnit'] ?? null,
            'units_per_pack' => $data['unitsPerPack'] ?? null,
            'billable_unit' => $data['billableUnit'] ?? null,
            'purchase_price' => $data['purchasePrice'],
            'selling_price' => $data['sellingPrice'],
            'status' => 'Active',
        ]);

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'displayName' => $product->display_name,
            'sku' => $product->sku,
            'specifications' => $product->specifications,
            'thinkness' => $product->thinkness,
            'weight' => $product->weight !== null ? (float) $product->weight : null,
            'description' => $product->description,
            'unit' => $product->unit,
            'packagingUnit' => $product->packaging_unit,
            'unitsPerPack' => $product->units_per_pack,
            'billableUnit' => $product->billable_unit,
            'quantity' => $this->getTotalInventoryQuantityForProduct((int) $product->id),
            'purchasePrice' => (float) $product->purchase_price,
            'sellingPrice' => (float) $product->selling_price,
            'category' => $product->category?->name ?? ($data['category'] ?? ''),
            'createdAt' => $product->created_at?->toDateString(),
        ], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'displayName' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($product->id)],
            'specifications' => ['nullable', 'string', 'max:255'],
            'thinkness' => ['nullable', 'string', 'max:100'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'unit' => ['required', 'string', 'max:50'],
            'packagingUnit' => ['nullable', 'string', 'max:100'],
            'unitsPerPack' => ['nullable', 'integer', 'min:0'],
            'billableUnit' => ['nullable', 'string', 'max:100'],
            'purchasePrice' => ['required', 'numeric', 'min:0'],
            'sellingPrice' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string', 'max:255'],
        ]);

        $categoryId = null;
        if (!empty($data['category'])) {
            $category = Category::firstOrCreate(['name' => trim($data['category'])], ['status' => 'Active']);
            $categoryId = $category->id;
        }

        $product->update([
            'category_id' => $categoryId,
            'name' => $data['name'],
            'display_name' => $data['displayName'] ?? null,
            'sku' => $data['sku'] ?? null,
            'specifications' => $data['specifications'] ?? null,
            'thinkness' => $data['thinkness'] ?? null,
            'weight' => $data['weight'] ?? null,
            'description' => $data['description'] ?? null,
            'unit' => $data['unit'],
            'packaging_unit' => $data['packagingUnit'] ?? null,
            'units_per_pack' => $data['unitsPerPack'] ?? null,
            'billable_unit' => $data['billableUnit'] ?? null,
            'purchase_price' => $data['purchasePrice'],
            'selling_price' => $data['sellingPrice'],
        ]);

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'displayName' => $product->display_name,
            'sku' => $product->sku,
            'specifications' => $product->specifications,
            'thinkness' => $product->thinkness,
            'weight' => $product->weight !== null ? (float) $product->weight : null,
            'description' => $product->description,
            'unit' => $product->unit,
            'packagingUnit' => $product->packaging_unit,
            'unitsPerPack' => $product->units_per_pack,
            'billableUnit' => $product->billable_unit,
            'quantity' => $this->getTotalInventoryQuantityForProduct((int) $product->id),
            'purchasePrice' => (float) $product->purchase_price,
            'sellingPrice' => (float) $product->selling_price,
            'category' => $product->category?->name ?? ($data['category'] ?? ''),
            'createdAt' => $product->created_at?->toDateString(),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function import(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        $sheet = IOFactory::load($data['file']->getRealPath())->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, false);

        if (count($rows) < 2) {
            return response()->json(['message' => 'Excel file has no data rows.'], 422);
        }

        $headerRow = array_map(fn ($cell) => $this->normalizeHeader((string) ($cell ?? '')), $rows[0]);
        $headerIndex = [];
        foreach ($headerRow as $index => $header) {
            if ($header !== '') {
                $headerIndex[$header] = $index;
            }
        }

        $requiredHeaders = ['tên sản phẩm', 'đơn vị', 'giá công ty', 'giá bán'];
        foreach ($requiredHeaders as $requiredHeader) {
            if (!array_key_exists($requiredHeader, $headerIndex)) {
                return response()->json([
                    'message' => "Missing required column: {$requiredHeader}",
                ], 422);
            }
        }

        $categoryHeader = null;
        foreach (array_keys($headerIndex) as $header) {
            if ($header === 'danh mục' || str_starts_with($header, 'danh mục')) {
                $categoryHeader = $header;
                break;
            }
        }

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];

        DB::transaction(function () use ($rows, $headerIndex, $categoryHeader, &$created, &$updated, &$skipped, &$errors) {
            for ($rowOffset = 1; $rowOffset < count($rows); $rowOffset++) {
                $row = $rows[$rowOffset];
                $rowNumber = $rowOffset + 1;

                $nameValue = $row[$headerIndex['tên sản phẩm']] ?? null;
                $unitValue = $row[$headerIndex['đơn vị']] ?? null;
                $purchaseValue = $row[$headerIndex['giá công ty']] ?? null;
                $sellingValue = $row[$headerIndex['giá bán']] ?? null;

                $name = trim((string) ($nameValue ?? ''));
                $unit = trim((string) ($unitValue ?? ''));
                $purchasePrice = $this->parseNumber($purchaseValue);
                $sellingPrice = $this->parseNumber($sellingValue);

                // Skip fully empty rows.
                if ($name === '' && $unit === '' && $purchasePrice === null && $sellingPrice === null) {
                    continue;
                }

                if ($name === '' || $unit === '' || $purchasePrice === null || $sellingPrice === null) {
                    $skipped++;
                    $errors[] = "Row {$rowNumber}: required values are missing or invalid.";
                    continue;
                }

                $idHeaderIndex = $headerIndex['id'] ?? null;
                $productId = $idHeaderIndex !== null ? $this->parseInteger($row[$idHeaderIndex] ?? null) : null;

                $categoryId = null;
                if ($categoryHeader !== null) {
                    $rawCategoryId = $this->parseInteger($row[$headerIndex[$categoryHeader]] ?? null);
                    if ($rawCategoryId !== null) {
                        $category = Category::query()->find($rawCategoryId);
                        if (!$category) {
                            $skipped++;
                            $errors[] = "Row {$rowNumber}: category id {$rawCategoryId} was not found.";
                            continue;
                        }
                        $categoryId = (int) $category->id;
                    }
                }

                $thinkness = trim((string) ($row[$headerIndex['độ dày'] ?? -1] ?? ''));
                $weight = $this->parseNumber($row[$headerIndex['trọng lượng'] ?? -1] ?? null);
                $description = trim((string) ($row[$headerIndex['mô tả'] ?? -1] ?? ''));

                $existingProduct = $productId ? Product::query()->find($productId) : null;
                $payload = [
                    'category_id' => $categoryId ?? $existingProduct?->category_id,
                    'name' => $name,
                    'thinkness' => $thinkness !== '' ? $thinkness : null,
                    'weight' => $weight,
                    'description' => $description !== '' ? $description : null,
                    'unit' => $unit,
                    'purchase_price' => $purchasePrice,
                    'selling_price' => $sellingPrice,
                    'status' => $existingProduct?->status ?? 'Active',
                ];

                if ($existingProduct) {
                    $existingProduct->update($payload);
                    $updated++;
                } else {
                    Product::query()->create($payload);
                    $created++;
                }
            }
        });

        return response()->json([
            'message' => "Import completed. Created {$created}, updated {$updated}, skipped {$skipped}.",
            'summary' => [
                'created' => $created,
                'updated' => $updated,
                'skipped' => $skipped,
            ],
            'errors' => array_slice($errors, 0, 20),
        ]);
    }
}
