<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Filament\Notifications\Notification;
use App\Models\User;

$admins = User::where('role', 'admin')->get();
echo "Found " . count($admins) . " admins\n";

if (count($admins) > 0) {
    Notification::make()
        ->title('Test notification')
        ->body('This is a test notification from the system.')
        ->success()
        ->sendToDatabase($admins);
    echo "Sent notification to DB.\n";
} else {
    echo "No admins found.\n";
}

$count = DB::table('notifications')->count();
echo "Total notifications in DB: " . $count . "\n";
