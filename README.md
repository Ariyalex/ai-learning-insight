# AI Learning Insight

Aplikasi backend berbasis Express.js untuk sistem insight pembelajaran AI, menggunakan PostgreSQL sebagai database utama. Proyek ini dirancang dengan arsitektur layer-based untuk memisahkan concerns seperti routes, controllers, services, repositories, dan validators.

## Fitur

- **RESTful API**: Endpoint untuk manajemen pengguna dan data terkait.
- **Validasi Input**: Menggunakan Joi untuk validasi data yang ketat.
- **Database Migration**: Menggunakan node-pg-migrate untuk versioning schema database.
- **Error Handling**: Centralized error handling dengan custom exceptions.
- **Middleware**: Support untuk authentication, logging, dan rate limiting.
- **Development Tools**: ESLint untuk linting, Nodemon untuk hot reload.

## Struktur File

Proyek ini menggunakan struktur layer-based (horizontal) untuk organisasi kode:

```
ai_learning_insight/
├── eslint.config.mjs          # Konfigurasi ESLint
├── index.js                   # Entry point aplikasi (memuat dotenv dan app)
├── package.json               # Dependencies dan scripts npm
├── README.md                  # Dokumentasi proyek (file ini)
└── src/
    ├── app.js                 # Konfigurasi Express utama (middleware global, routes)
    ├── controllers/           # Handler HTTP (request/response)
    ├── db/                    # Koneksi dan utilitas database
    │   └── index.js           # Pool koneksi PostgreSQL
    ├── exceptions/            # Custom error classes
    │   └── ClientException.js # Exception untuk error client
    ├── middlewares/           # Middleware Express (auth, validate, dll)
    │   └── Middleware.js      # Middleware umum
    ├── migrations/            # File migrasi database
    ├── repositories/          # Akses data ke database (CRUD operations)
    ├── routes/                # Definisi routing Express
    ├── services/              # Logika bisnis aplikasi
    └── validator/             # Schema validasi Joi
```

### Penjelasan Direktori di src/

- **controllers/**: Menangani layer HTTP. Menerima request, memanggil service, mengirim response atau error.
- **db/**: Koneksi database dan helper query. Menggunakan pg library untuk PostgreSQL.
- **exceptions/**: Custom exception classes untuk error handling yang konsisten.
- **middlewares/**: Middleware Express yang dapat dipakai ulang (auth, logging, validation, rate limit, error handlers).
- **migrations/**: Script migrasi schema database untuk versioning terkontrol.
- **repositories/**: Layer akses data. Berisi query SQL dan mapping hasil ke objek domain.
- **routes/**: Definisi endpoint API. Mapping path HTTP ke controller.
- **services/**: Logika bisnis aplikasi. Orchestrasi operasi, validasi bisnis, memanggil repositories.
- **validator/**: Schema validasi input menggunakan Joi.

## Instalasi

### Prasyarat

- Node.js versi 16 atau lebih tinggi
- PostgreSQL versi 12 atau lebih tinggi
- npm atau yarn

### Langkah Instalasi

1. **Clone repository**:

   ```bash
   git clone https://github.com/Ariyalex/ai-learning-insight.git
   cd ai-learning-insight
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Setup environment variables**:
   Buat file `.env` di root direktori:

   ```env
   PORT=3000
   HOST=localhost
   DATABASE_URL=postgres://username:password@localhost:5432/ai_learning_insight
   NODE_ENV=development
   ```

   Ganti `username`, `password`, dan nama database sesuai setup PostgreSQL Anda.

4. **Setup database**:
   - Buat database PostgreSQL baru dengan nama `ai_learning_insight`.
   - Jalankan migrasi untuk membuat tabel:
     ```bash
     npm run migrate:up
     ```

## Menjalankan Aplikasi

### Development Mode (dengan hot reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server akan berjalan di `http://localhost:3000` (atau sesuai PORT di .env).

## Migrasi Database

### Membuat Migrasi Baru

```bash
npm run migrate:create nama_migrasi
```

Contoh:

```bash
npm run migrate:create add_email_to_users
```

### Menjalankan Migrasi

```bash
npm run migrate:up
```

### Rollback Migrasi

```bash
npm run migrate:down
```
