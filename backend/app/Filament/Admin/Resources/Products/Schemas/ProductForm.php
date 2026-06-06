<?php

namespace App\Filament\Admin\Resources\Products\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Repeater;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('category_id')
                    ->relationship('category', 'name')
                    ->required(),
                Select::make('brand_id')
                    ->relationship('brand', 'name')
                    ->required(),
                TextInput::make('name')
                    ->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn ($set, ?string $state) => $set('slug', \Illuminate\Support\Str::slug($state ?? ''))),
                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true),
                TextInput::make('sku')
                    ->label('SKU Sản phẩm'),
                Textarea::make('description')
                    ->columnSpanFull(),
                TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->prefix('$'),
                TextInput::make('stock_quantity')
                    ->required()
                    ->numeric()
                    ->default(0),
                FileUpload::make('image_url')
                    ->image()
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
                    ->maxSize(5120)
                    ->disk('public')
                    ->directory('products'),
                Repeater::make('galleries')
                    ->relationship()
                    ->schema([
                        FileUpload::make('image_url')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
                            ->maxSize(5120)
                            ->disk('public')
                            ->directory('products/gallery')
                            ->required(),
                    ])
                    ->columnSpanFull(),

                Repeater::make('variants')
                    ->relationship()
                    ->schema([
                        Repeater::make('variant_attributes')
                            ->label('Các thuộc tính (Size, Màu...)')
                            ->schema([
                                Select::make('attribute_id')
                                    ->label('Thuộc tính')
                                    ->options(\App\Models\Attribute::pluck('name', 'id'))
                                    ->live()
                                    ->required(),
                                Select::make('values')
                                    ->label('Các giá trị (S, M, Trắng...)')
                                    ->multiple()
                                    ->options(fn ($get) => \App\Models\AttributeValue::where('attribute_id', $get('attribute_id'))->pluck('value', 'id'))
                                    ->required(),
                            ])
                            ->defaultItems(1),
                        TextInput::make('price_adjustment')
                            ->label('Giá cộng thêm')
                            ->numeric()
                            ->default(0),
                        TextInput::make('stock_quantity')
                            ->label('Số lượng kho')
                            ->numeric()
                            ->default(0)
                            ->required(),
                    ])
                    ->columns(3)
                    ->columnSpanFull()
                    ->defaultItems(0),

                Toggle::make('is_active')
                    ->required(),
            ]);
    }
}
