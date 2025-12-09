# AI Learning Insight — Petunjuk Docker (Windows)

Panduan singkat ini menjelaskan cara menjalankan proyek menggunakan Docker Compose pada Windows atau Linux.

Prasyarat

- Docker Desktop (dengan Docker Compose v2)

File penting

- `docker-compose.yml` — konfigurasi layanan dasar (db, backend, ml, frontend)
- `docker-compose.override.yml` — override untuk development / team
- `backend/.env`, `ml/.env`, dan `frontend/.env` — file environment per service (JANGAN commit file berisi credential)
- Folder `.csv_data` yang berisi file-file `csv` yang didapat dari mengkonversi `dataset` yang didapat dari dicoding. Maaf, kami tidak bisa melampirkan data tersebut di sini

Quick start — Development

1. Buat salinan file .env untuk diedit secara lokal (PowerShell):

```powershell
Copy-Item backend\.env backend\.env.local
Copy-Item ml\.env ml\.env.local
```

2. Jalankan layanan (dari folder project root):

```powershell
docker compose up
```

Keterangan singkat

- Mode development biasanya memanfaatkan `docker-compose.override.yml` untuk memasang (bind mount) folder `./backend` dan `./ml` ke container sehingga perubahan kode langsung terlihat.
- Akses service di host:
  - Frontend: http://localhost:8080
  - Backend: http://localhost:3000
  - ML service: ml:8000 (hanya bisa diakses di linkungan docker)
  - Postgres: db:5432 (hanya bisa diakses di lingkungan docker)

Migrations & import otomatis

Migrasi skema database dan proses import CSV dijalankan otomatis oleh entrypoint image saat container `backend` mulai. Jadi dalam kebanyakan kasus Anda tidak perlu menjalankan migrasi atau import secara manual — cukup jalankan `docker compose up` dan tunggu layanan selesai inisialisasi.

Jika Anda sedang debugging dan perlu menjalankan migrasi manual, lakukan dari dalam container atau gunakan WSL dengan Node.js terpasang.

Penggunaan user database yang sama

Secara default layanan `backend` dan `ml` menggunakan user database yang sama (`capstone`). Pastikan `backend/.env` dan `ml/.env` diatur dengan kredensial yang sama (mis. `PGUSER=capstone` dan `PGPASSWORD=...`).

Jika tim ingin menerapkan pembatasan akses di kemudian hari (mis. user terpisah untuk ML), saya bisa bantu menyiapkan skrip dan instruksi untuk itu.

Menggunakan image yang sudah dipublikasikan (team / production)

Jika tim ingin menarik image yang sudah dipublish (mis. GHCR atau Docker Hub), gunakan compose yang mereferensikan image (mis. `docker-compose.prod.yml` atau `docker-compose.override.yml` yang telah diatur). Contoh:

```powershell
docker compose pull
docker compose up -d
```

Catatan:

- Pastikan image yang dipublikasikan sudah berisi entrypoint yang menjalankan migrasi/import idempoten.
- Jika image privat, login ke registry dulu: `echo $env:GH_PAT | docker login ghcr.io -u USER --password-stdin` (PowerShell).

Pekerjaan latar (long-running) untuk ML

Endpoint ML seperti `/check/insight` bisa memakan waktu. Opsi:

- Development cepat: gunakan BackgroundTasks (FastAPI) + polling — mudah tapi data job tidak persisten jika container restart.
- Production: gunakan message broker (RabbitMQ / Redis) + worker (Celery / custom worker) supaya job tahan restart dan scalable.

Keamanan & praktik terbaik

- Jangan commit `.env` berisi credential. Gunakan `.env.example` untuk referensi.
- Gunakan `PGHOST=db` di file env saat menjalankan dengan compose.
- Simpan secrets (API keys, registry tokens) di secret manager atau GitHub Actions Secrets.

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

# hentikan dan hapus container (tetap simpan volume)
docker compose down

# hentikan dan hapus container + volume (HATI-HATI)
docker compose down -v
```
