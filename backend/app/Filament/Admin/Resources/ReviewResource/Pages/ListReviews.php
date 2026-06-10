<?php

namespace App\Filament\Admin\Resources\ReviewResource\Pages;

use App\Filament\Admin\Resources\ReviewResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListReviews extends ListRecords
{
    protected static string $resource = ReviewResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Review usually doesn't need a Create button since it's created by users
        ];
    }
}
