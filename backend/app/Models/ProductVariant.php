<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'price_adjustment',
        'stock_quantity',
        'variant_attributes',
    ];

    protected $appends = [
        'variant_attributes',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attributeValues()
    {
        return $this->belongsToMany(AttributeValue::class, 'attribute_value_product_variant');
    }

    public array $tempVariantAttributes = [];
    public bool $variantAttributesTouched = false;

    public function setVariantAttributesAttribute($value)
    {
        $this->tempVariantAttributes = $value ?? [];
        $this->variantAttributesTouched = true;
    }

    public function getVariantAttributesAttribute()
    {
        $attributes = [];
        $grouped = $this->attributeValues->groupBy('attribute_id');
        foreach ($grouped as $attributeId => $values) {
            $attributes[] = [
                'attribute_id' => $attributeId,
                'values' => $values->pluck('id')->toArray(),
            ];
        }
        return $attributes;
    }

    protected static function booted()
    {
        static::saved(function ($model) {
            if ($model->variantAttributesTouched) {
                $valueIds = [];
                foreach ($model->tempVariantAttributes as $item) {
                    if (!empty($item['values'])) {
                        $valueIds = array_merge($valueIds, $item['values']);
                    }
                }
                $model->attributeValues()->sync($valueIds);
                $model->variantAttributesTouched = false;
            }
        });
    }
}
