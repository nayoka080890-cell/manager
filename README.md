# QH Manage

Full-stack inventory and invoice management system:
- Backend: Laravel 12 (PHP 8.2)
- Frontend: React + TypeScript + Vite

## Repository Structure

- `backend/` Laravel API server
- `frontend/` React web app

## Prerequisites

Install these first:
- PHP 8.2+
- Composer 2+
- Node.js 20+
- npm 10+
- MySQL/MariaDB

## 1) Backend Setup (Laravel API)

Open terminal in `backend` and run:

```bash
composer install
copy .env.example .env
php artisan key:generate
```

Update database settings in `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=qhmanage
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations:

```bash
php artisan migrate --force
```

Start backend server:

```bash
php artisan serve
```

API default URL:
- `http://127.0.0.1:8000/api`

## 2) Frontend Setup (React)

Open another terminal in `frontend` and run:

```bash
npm install
```

Create `frontend/.env` (optional if using default API URL):

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start frontend dev server:

```bash
npm run dev
```

Frontend default URL:
- Usually `http://localhost:5173`

## 3) Build for Production

Backend assets build (optional Laravel-side Vite build):

```bash
cd backend
npm install
npm run build
```

Frontend build:

```bash
cd frontend
npm run build
```

## 4) Useful Commands

Backend tests:

```bash
cd backend
php artisan test
```

Frontend lint:

```bash
cd frontend
npm run lint
```

## Notes

- Product Excel import is supported in the backend using PhpSpreadsheet.
- Ensure backend is running before frontend API calls.
