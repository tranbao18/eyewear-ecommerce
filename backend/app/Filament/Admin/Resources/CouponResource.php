<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\CouponResource\Pages;
use App\Models\Coupon;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CouponResource extends Resource
{
    protected static ?string $model = Coupon::class;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-ticket';
    
    protected static string|\UnitEnum|null $navigationGroup = 'Shop';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Forms\Components\TextInput::make('code')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255)
                    ->label('Mã giảm giá'),
                Forms\Components\Select::make('type')
                    ->options([
                        'percent' => 'Phần trăm (%)',
                        'fixed' => 'Số tiền cố định',
                    ])
                    ->required()
                    ->default('fixed')
                    ->label('Loại giảm giá'),
                Forms\Components\TextInput::make('value')
                    ->required()
                    ->numeric()
                    ->label('Giá trị giảm'),
                Forms\Components\TextInput::make('min_spend')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->label('Đơn hàng tối thiểu'),
                Forms\Components\TextInput::make('max_uses')
                    ->numeric()
                    ->label('Số lượt dùng tối đa (Trống = Không giới hạn)'),
                Forms\Components\DateTimePicker::make('expires_at')
                    ->label('Ngày hết hạn'),
                Forms\Components\Toggle::make('is_active')
                    ->required()
                    ->default(true)
                    ->label('Đang hoạt động'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->searchable()
                    ->label('Mã giảm giá'),
                Tables\Columns\TextColumn::make('type')
                    ->formatStateUsing(fn (string $state): string => $state === 'percent' ? 'Phần trăm' : 'Cố định')
                    ->label('Loại'),
                Tables\Columns\TextColumn::make('value')
                    ->numeric()
                    ->label('Giá trị'),
                Tables\Columns\TextColumn::make('used_count')
                    ->numeric()
                    ->label('Đã dùng'),
                Tables\Columns\TextColumn::make('expires_at')
                    ->dateTime()
                    ->sortable()
                    ->label('Hết hạn'),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->label('Hoạt động'),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->toolbarActions([
                \Filament\Actions\BulkActionGroup::make([
                    \Filament\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCoupons::route('/'),
            'create' => Pages\CreateCoupon::route('/create'),
            'edit' => Pages\EditCoupon::route('/{record}/edit'),
        ];
    }
}
