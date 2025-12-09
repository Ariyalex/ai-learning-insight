# AI Learning Insight — Petunjuk Docker

Panduan singkat ini menjelaskan cara menjalankan proyek menggunakan Docker Compose pada Windows atau Linux.

Prasyarat

- Docker Desktop (dengan Docker Compose v2)
- Node.js minimal versi 20

File penting

- `docker-compose.yml` — konfigurasi layanan dasar (db, backend, ml, frontend)
- `docker-compose.override.yml` — override untuk development / team
- `backend/.env`, `ml/.env`, dan `frontend/.env` — file environment per service (JANGAN commit file berisi credential)
- Folder `.csv_data` yang berisi file-file `csv` yang didapat dari mengkonversi `dataset` yang didapat dari dicoding. Maaf, kami tidak bisa melampirkan data tersebut di sini

## Quick start

### 1. Buat salinan file .env untuk diedit secara lokal (PowerShell):

```powershell
Copy-Item backend\.env backend\.env.example
Copy-Item ml\.env ml\.env.example
Copy-Item frontend\.env frontend\.env.example
```

### 2. tambahkan folder `.csv_data` ke dalam folder `./backend`

pastikan folder berisi semua dataset yang dari capstone ai learning insight yang disediakan dicoding. (kami tidak menyediakan folder ini, hanya orang yang tahu dataset ini yang bisa menambahkan folder ini ke tempatnya)

### 3. Konfigurasi .env ML Service

Buat API KEY Gemini AI di https://aistudio.google.com/ lalu masukkan key tersebut di `./ml/.env`:

```.env
HOST=localhost
PORT=8000

PGHOST=db
PGPORT=5432
PGUSER=capstone
PGPASSWORD=admin123
PGDATABASE=ai_learning_insight

# BUAT KEY DULU DI => https://aistudio.google.com/
GEMINI_API_KEY=# letakkan api key gemini di sini
```

### 4. Konfigurasi .env backend

jalankan node di terminal:

```powershell
node
```

lalu paste perintah ini dan jalankan:

```node
require("crypto").randomBytes(64).toString("hex");
```

perintah ini kana menghasilkan key, lalu copas key tersebut ke file `./backend/.env` pada bagian `ACCESS_TOKEN_KEY`:

```.env
# server config
HOST=localhost
PORT=3000

# node postgres config
PGHOST=db
PGPORT=5432
PGPASSWORD=admin123
PGUSER=capstone
PGDATABASE=ai_learning_insight

ACCESS_TOKEN_KEY= #buat key yang baru menggunakan randomBytes
ACCESS_TOKEN_AGE=1800  #seconds
REFRESH_TOKEN_AGE=30  #days

#untuk membuat token gunakan perintah ini di node:
# require("crypto").randomBytes(64).toString("hex");
```

### 5. Jalankan layanan (dari folder project root):

```powershell
docker compose up
```

### 6. Tunggu sampai semua proses docker selesai

### Keterangan singkat

#### Akses service di host:

- Frontend: http://localhost:5174
- Backend: http://localhost:3000
- ML service: ml:8000 (hanya bisa diakses di linkungan docker)
- Postgres: db:5432 (hanya bisa diakses di lingkungan docker)

#### Migrations & import otomatis

Migrasi skema database dan proses import CSV dijalankan otomatis oleh entrypoint image saat container `backend` mulai. Anda tidak perlu menjalankan migrasi atau import secara manual — cukup jalankan `docker compose up` dan tunggu layanan selesai inisialisasi.

Jika Anda sedang debugging dan perlu menjalankan migrasi manual, lakukan dari dalam container atau gunakan WSL dengan Node.js terpasang.

#### Penggunaan user database yang sama

Secara default layanan `backend` dan `ml` menggunakan user database yang sama (`capstone`). Pastikan `backend/.env` dan `ml/.env` diatur dengan kredensial yang sama (mis. `PGUSER=capstone` dan `PGPASSWORD=...`).

#### Menggunakan image yang sudah dipublikasikan (team / production)

Jika tim ingin menarik image yang sudah dipublish (mis. GHCR atau Docker Hub), gunakan compose yang mereferensikan image (mis. `docker-compose.prod.yml` atau `docker-compose.override.yml` yang telah diatur). Contoh:

```powershell
docker compose pull
docker compose up -d
```

Catatan:

- Pastikan image yang dipublikasikan sudah berisi entrypoint yang menjalankan migrasi/import idempoten.

#### Keamanan & praktik terbaik

- Jangan commit `.env` berisi credential. Gunakan `.env.example` untuk referensi.
- Gunakan `PGHOST=db` di file env saat menjalankan dengan compose.
- Simpan secrets (API keys, registry tokens) di secret manager atau GitHub Actions Secrets.
- Jangan commit folder `.csv_data` yang ada di folder backend karena itu data rahasia

Perintah berguna (PowerShell)

```powershell
# jalankan semua service (tarik image jika perlu)
docker compose up -d

# tarik image terbaru lalu jalankan
docker compose pull
docker compose up -d

# lihat logs
docker compose logs -f backend
docker compose logs -f ml
docker compose logs -f frontend

# hentikan dan hapus container (tetap simpan volume)
docker compose down

# hentikan dan hapus container + volume (HATI-HATI)
docker compose down -v
```
