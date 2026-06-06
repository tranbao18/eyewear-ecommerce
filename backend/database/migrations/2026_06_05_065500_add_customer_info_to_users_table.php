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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('province')->nullable()->after('phone');
            $table->string('district')->nullable()->after('province');
            $table->string('ward')->nullable()->after('district');
            $table->string('specific_address')->nullable()->after('ward');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'province', 'district', 'ward', 'specific_address']);
        });
    }
};
