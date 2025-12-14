Laporan Deployment Aplikasi Library API: Library Management System (EC2 & PM2)

Dokumen ini menjelaskan langkah-langkah untuk mendeploy aplikasi backend Library API berbasis Node.js dan Prisma (menggunakan SQLite) ke server Ubuntu EC2 menggunakan PM2 (Process Manager 2).

---

## 1. Persiapan Server EC2

Aplikasi ini di-deploy ke Amazon EC2 Instance.

| Detail         | Nilai                          | Catatan                                       |
| -------------- | ------------------------------ | --------------------------------------------- |
| Sistem Operasi | Ubuntu (misalnya, 20.04/22.04) |                                               |
| IP Publik      | 52.91.246.56                   | IP Publik Anda saat ini                       |
| Port Dibuka    | 22, 80 (opsional), 3000        | Port 3000 harus dibuka di AWS Security Group. |

---

## 2. Instalasi Dependensi Dasar

Pastikan server memiliki alat dasar yang diperlukan:

```bash
# 1. Update sistem
sudo apt update

# 2. Instal git
sudo apt install git -y

# 3. Instal Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Instal PM2 secara global
sudo npm install pm2 -g
```

---

## 3. Clone Proyek dan Instalasi

Setelah Node.js dan PM2 terinstal, clone proyek Anda dan instal dependencies:

```bash
# 1. Buat direktori kerja
mkdir library-project
cd library-project

# 2. Clone repositori (Ganti URL dengan repo Anda yang sebenarnya)
git clone https://[URL_REPO_ANDA]

# 3. Masuk ke direktori aplikasi
cd [NAMA_FOLDER_APLIKASI_DARI_GIT_CLONE]/[NAMA_FOLDER_API]
# Contoh: cd library-system-project/library-system-project

# 4. Instal dependencies
npm install
```

---

## 4. Konfigurasi Environment Variables (.env)

Buat dan edit file `.env` di direktori aplikasi.

CATATAN: Kita menggunakan SQLite sesuai instruksi tugas.

```bash
nano .env
```

Isi file `.env` (ganti placeholder dengan nilai sebenarnya):

```env
# --- KONFIGURASI PRODUCTION ---
NODE_ENV=production
PORT=3000

# IP Publik EC2 untuk pengujian. Digunakan sebagai CORS_ORIGIN
CORS_ORIGIN=http://52.91.246.56:3000

# Sesuai instruksi: Menggunakan SQLite (file:./dev.db)
DATABASE_URL="file:./dev.db"

# WAJIB GANTI: Ganti dengan string acak yang kuat (misal: hasil dari openssl rand -base64 48)
JWT_SECRET="MASUKKAN_STRING_RAHASIA_KUAT_ANDA_DI_SINI"

JWT_EXPIRATION_TIME=1h
BCRYPT_SALT_ROUNDS=10
FINE_PER_DAY=1000
```

(Simpan file: **Ctrl + O**, Enter. Keluar: **Ctrl + X**)

---

## 5. Deployment dan Start Aplikasi

Setelah konfigurasi selesai, jalankan migrasi database dan jalankan aplikasi menggunakan PM2.

### 5.1. Migrasi Database (SQLite)

```bash
npx prisma migrate deploy
```

Tugas ini akan membuat file `dev.db` jika belum ada dan menerapkan skema.

### 5.2. Menjalankan Aplikasi dengan PM2

```bash
pm2 start npm --name "library-api" -- start
```

---

## 6. Verifikasi dan Monitoring

### 6.1. Cek Status Aplikasi

Pastikan aplikasi berjalan dengan status `online`:

```bash
pm2 list
```

Output yang diharapkan:

```
...
│ 0  │ library-api     │ fork     │ 0    │ online      │ 0%       │ 55.8mb   │
...
```

### 6.2. Cek Log (untuk Debugging)

Jika Anda perlu melihat error atau output aplikasi:

```bash
pm2 logs library-api
```

### 6.3. Konfigurasi Startup PM2 (Opsional)

Agar aplikasi otomatis berjalan setelah server di-reboot:

```bash
pm2 startup
pm2 save
```
