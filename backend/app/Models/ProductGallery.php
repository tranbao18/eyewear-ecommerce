<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductGallery extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'image_url'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
