<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@qhmanage.com'],
            [
                'name' => 'Admin',
                'email' => 'admin@qhmanage.com',
                'password' => Hash::make('Admin@123'),
                'role' => 'admin',
                'status' => 'Active',
            ]
        );
    }
}
