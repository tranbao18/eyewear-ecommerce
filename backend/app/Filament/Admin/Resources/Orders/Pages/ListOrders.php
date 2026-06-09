<?php

namespace App\Filament\Admin\Resources\Orders\Pages;

use App\Filament\Admin\Resources\Orders\OrderResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    public function mount(): void
    {
        parent::mount();

        // Đánh dấu tất cả thông báo đơn hàng là đã đọc khi admin truy cập trang Orders
        $user = auth()->user();
        if ($user) {
            $user->unreadNotifications()
                ->where('data->format', 'filament')
                ->update(['read_at' => now()]);
        }
    }
}
