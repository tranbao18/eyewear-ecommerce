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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_email')->after('customer_phone');
            $table->string('province')->after('shipping_address');
            $table->string('district')->after('province');
            $table->string('ward')->after('district');
            $table->string('specific_address')->after('ward');
            $table->string('coupon_code')->nullable()->after('specific_address');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('coupon_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_email',
                'province',
                'district',
                'ward',
                'specific_address',
                'coupon_code',
                'discount_amount'
            ]);
        });
    }
};
