<?php

namespace App\Filament\Admin\Resources\Orders\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class OrderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('user_id')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('total_amount')
                    ->numeric(),
                TextEntry::make('status')
                    ->badge(),
                TextEntry::make('payment_method'),
                TextEntry::make('customer_name'),
                TextEntry::make('customer_phone'),
                TextEntry::make('shipping_address')
                    ->columnSpanFull(),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
                \Filament\Schemas\Components\Section::make('Order Items')
                    ->schema([
                        \Filament\Infolists\Components\RepeatableEntry::make('items')
                            ->schema([
                                \Filament\Infolists\Components\ImageEntry::make('product.image_url')
                                    ->label('Hình ảnh')
                                    ->disk('public')
                                    ->size(50)
                                    ->defaultImageUrl(url('/placeholder.png')),
                                TextEntry::make('product.name')
                                    ->label('Sản phẩm'),
                                TextEntry::make('variant_name')
                                    ->label('Biến thể')
                                    ->placeholder('-'),
                                TextEntry::make('product.sale_price')
                                    ->label('Giá khuyến mãi')
                                    ->money('VND')
                                    ->placeholder('-'),
                                TextEntry::make('quantity')
                                    ->label('Số lượng'),
                                TextEntry::make('price')
                                    ->label('Đơn giá (Lúc mua)')
                                    ->money('VND'),
                            ])
                            ->columns(5)
                    ])
            ]);
    }
}
