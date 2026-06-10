<?php

namespace App\Filament\Admin\Resources\Categories\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn ($set, ?string $state) => $set('slug', \Illuminate\Support\Str::slug($state ?? ''))),
                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true),
                \Filament\Forms\Components\Toggle::make('is_active')
                    ->label('Hoạt động')
                    ->default(true)
                    ->required(),
                FileUpload::make('image')
                    ->image()
                    ->disk('public')
                    ->directory('categories'),
                Textarea::make('description')
                    ->columnSpanFull(),
            ]);
    }
}
