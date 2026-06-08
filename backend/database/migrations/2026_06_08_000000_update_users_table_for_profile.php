<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Thêm các cột mới
            $table->string('first_name')->nullable()->after('id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('avatar')->nullable()->after('email');
            
            // Cho phép password null khi đăng nhập bằng Google
            $table->string('password')->nullable()->change();
            
            // Social login
            $table->string('provider')->nullable();
            $table->string('provider_id')->nullable();
            $table->string('provider_token')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'avatar',
                'provider',
                'provider_id',
                'provider_token'
            ]);
            $table->string('password')->nullable(false)->change();
        });
    }
};
