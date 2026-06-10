<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use BackedEnum;
use UnitEnum;

class ReviewResource extends Resource
{
    protected static ?string $model = Review::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-star';
    protected static ?string $navigationLabel = 'Đánh giá';
    protected static ?string $modelLabel = 'Đánh giá';
    protected static string|UnitEnum|null $navigationGroup = 'Sản phẩm';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required()
                    ->disabled()
                    ->label('Người đánh giá'),
                Forms\Components\Select::make('product_id')
                    ->relationship('product', 'name')
                    ->required()
                    ->disabled()
                    ->label('Sản phẩm'),
                Forms\Components\TextInput::make('rating')
                    ->required()
                    ->numeric()
                    ->minValue(1)
                    ->maxValue(5)
                    ->label('Số sao'),
                Forms\Components\Textarea::make('comment')
                    ->maxLength(65535)
                    ->columnSpanFull()
                    ->label('Nội dung'),
                Forms\Components\Toggle::make('is_approved')
                    ->required()
                    ->label('Đã duyệt'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->numeric()
                    ->sortable()
                    ->label('Người đánh giá'),
                Tables\Columns\TextColumn::make('product.name')
                    ->numeric()
                    ->sortable()
                    ->label('Sản phẩm'),
                Tables\Columns\TextColumn::make('rating')
                    ->numeric()
                    ->sortable()
                    ->label('Số sao'),
                Tables\Columns\ToggleColumn::make('is_approved')
                    ->label('Duyệt'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->label('Ngày tạo'),
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
            'index' => Pages\ListReviews::route('/'),
            'edit' => Pages\EditReview::route('/{record}/edit'),
        ];
    }
}
