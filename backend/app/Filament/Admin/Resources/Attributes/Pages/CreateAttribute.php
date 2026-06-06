<?php

namespace App\Filament\Admin\Resources\Attributes\Pages;

use App\Filament\Admin\Resources\Attributes\AttributeResource;
use Filament\Resources\Pages\CreateRecord;

class CreateAttribute extends CreateRecord
{
    protected static string $resource = AttributeResource::class;
}
