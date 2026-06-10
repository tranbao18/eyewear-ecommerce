<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "MOMO_SECRET_KEY: '" . env('MOMO_SECRET_KEY') . "'\n";
echo "Config value: '" . config('services.momo.secret_key') . "'\n";
