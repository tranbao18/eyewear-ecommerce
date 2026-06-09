<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$notifs = DB::table('notifications')->count();
$out = "Total notifications: " . $notifs . "\n";
$users = App\Models\User::where('role', 'admin')->count();
$out .= "Total admins: " . $users . "\n";

file_put_contents('db_result.txt', $out);
