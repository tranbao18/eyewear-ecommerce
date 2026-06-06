<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('attribute_value_product_variant');
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('attributes');

        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
            $table->string('value');
            $table->timestamps();
        });

        if (!Schema::hasColumn('products', 'sku')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('sku')->nullable()->after('slug');
            });
        }

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['color', 'size']);
        });

        Schema::create('attribute_value_product_variant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_value_id')->constrained('attribute_values')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attribute_value_product_variant');
        
        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            $table->string('sku')->unique()->nullable();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('sku');
        });

        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('attributes');
    }
};
