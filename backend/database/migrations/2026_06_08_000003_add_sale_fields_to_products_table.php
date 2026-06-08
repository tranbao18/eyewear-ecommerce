<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('sale_price', 15, 2)->nullable()->after('price');
            $table->dateTime('sale_price_starts_at')->nullable()->after('sale_price');
            $table->dateTime('sale_price_ends_at')->nullable()->after('sale_price_starts_at');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['sale_price', 'sale_price_starts_at', 'sale_price_ends_at']);
        });
    }
};
