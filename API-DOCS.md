# API Documentation: Library Management System

Ini adalah dokumentasi teknis untuk RESTful API yang berfungsi sebagai *backend* sistem manajemen perpustakaan. API ini dibangun menggunakan Node.js (Express.js), Prisma, dan arsitektur *Modular Monolith*.

---

## 1. Base URL

Semua *endpoint* API harus diawali dengan *Base URL* berikut:

| Lingkungan      | Base URL                             |
| :-------------- | :----------------------------------- |
| **Development** | `http://localhost:3000/`       |
| **Production**  | `http://http://52.91.246.56:3000/` |

---

## 2. Autentikasi dan Otorisasi

API ini menggunakan **JSON Web Tokens (JWT)** untuk autentikasi dan otorisasi. Token harus disertakan di setiap permintaan terproteksi.

### Format Autentikasi

```http
Authorization: Bearer <access_token_yang_didapat>
```

### Roles & Access Control

Otorisasi diterapkan pada *middleware* di level *route* berdasarkan peran (`role`) pengguna.

| Entitas     | GET            | POST    | PUT/PATCH | DELETE  | Keterangan                                 |
| :---------- | :------------- | :------ | :-------- | :------ | :----------------------------------------- |
| **Auth**    | -              | Public  | -         | -       | Endpoint login bersifat publik.            |
| **Users**   | `ADMIN`        | `ADMIN` | `ADMIN`   | `ADMIN` | CRUD untuk pengelolaan pengguna.           |
| **Members** | `ADMIN`        | `ADMIN` | `ADMIN`   | `ADMIN` | CRUD untuk data anggota.                   |
| **Books**   | `ADMIN`/`USER` | `ADMIN` | `ADMIN`   | `ADMIN` | User biasa hanya bisa melihat daftar buku. |
| **Loans**   | `ADMIN`        | `ADMIN` | `ADMIN`   | `ADMIN` | Peminjaman dan pengembalian.               |

---

### **[POST] /auth/login**

Digunakan untuk mendapatkan *Access Token*.

| Field      | Tipe   | Wajib | Deskripsi                 |
| :--------- | :----- | :---- | :------------------------ |
| `email`    | String | Ya    | Email pengguna terdaftar. |
| `password` | String | Ya    | Kata sandi pengguna.      |

**Respons Sukses (200 OK):**

```json
{
  "meta": {
    "status": 200,
    "message": "Login successful"
  },
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "tokenExpiresIn": "1h",
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@library.com",
      "role": "ADMIN"
    }
  }
}
```

---

## 3. Endpoints Utama & Query Parameters

Semua endpoints yang mengembalikan daftar (`GET /...`) mendukung Query String Parameter untuk Pagination, Search, Filtering, dan Sorting.

### Query Parameter Universal

| Parameter | Contoh Nilai           | Deskripsi                              | Berlaku Untuk         |
| :-------- | :--------------------- | :------------------------------------- | :-------------------- |
| `page`    | `?page=2`              | Nomor halaman data (default: 1).       | Semua GET List        |
| `limit`   | `?limit=25`            | Jumlah data per halaman (default: 10). | Semua GET List        |
| `search`  | `?search=Fiksi`        | Mencari di kolom kunci.                | Books, Users, Members |
| `sort`    | `?sort=createdAt:desc` | Mengurutkan data.                      | Semua GET List        |
| `filter`  | `?filter=stock:gt:0`   | Memfilter data (`eq`, `gt`, `lt`).     | Books, Loans          |

---

## 3.1. Book Management (`/books`)

### **[GET] /books**

**Query Params Spesifik:**

* `filter=tagId:eq:3` → Filter buku berdasarkan Tag ID.

**Respons:**

* Mengembalikan daftar buku lengkap dengan data `tags`.

---

### **[POST] /books** *(ADMIN Only)*

| Field       | Tipe          | Wajib | Deskripsi                    |
| :---------- | :------------ | :---- | :--------------------------- |
| `title`     | String        | Ya    | Judul buku.                  |
| `author`    | String        | Ya    | Penulis.                     |
| `stock`     | Number        | Ya    | Jumlah stok awal (min. 0).   |
| `tagIds`    | Array<Number> | Ya    | Daftar ID Tag terkait.       |
| `isbn`      | String        | Tidak | ISBN buku (unik jika diisi). |
| `publisher` | String        | Tidak | Penerbit.                    |
| `year`      | Number        | Tidak | Tahun terbit.                |

---

## 3.2. Loan Management (`/loans`)

### **[POST] /loans/borrow** *(ADMIN Only)*

Membuat transaksi peminjaman baru. Stok buku akan berkurang 1.

| Field      | Tipe        | Wajib | Deskripsi                                |
| :--------- | :---------- | :---- | :--------------------------------------- |
| `bookId`   | Number      | Ya    | ID Buku yang dipinjam.                   |
| `memberId` | Number      | Ya    | ID Anggota yang meminjam.                |
| `dueDate`  | Date String | Ya    | Tanggal wajib pengembalian (YYYY-MM-DD). |

---

### **[POST] /loans/return** *(ADMIN Only)*

Memproses pengembalian buku. Stok buku akan bertambah 1.

| Field    | Tipe   | Wajib | Deskripsi                |
| :------- | :----- | :---- | :----------------------- |
| `loanId` | Number | Ya    | ID Transaksi Peminjaman. |

**Respons Pengembalian (200 OK):**

```json
{
  "meta": {
    "status": 200,
    "message": "Book returned successfully."
  },
  "data": {
    "loanId": 2,
    "isLate": true,
    "fineAmount": 5000,
    "daysLate": 5
  }
}
```

---

## 4. Health Check Endpoint

### **[GET] /health**

Endpoint publik (tidak memerlukan autentikasi) untuk memverifikasi status aplikasi dan server.

**Respons Sukses (200 OK):**

```json
{
  "status": "OK",
  "message": "Library API is up and running.",
  "timestamp": "2025-12-14T10:45:00.000Z",
  "uptime": "5 hours, 30 minutes, 15 seconds"
}
```

---

## 5. Test Credentials (Seeder Data)

Kredensial berikut dibuat melalui seeder:

```bash
npm run seed
```

| Role  | Email                                         | Password | Keterangan                  |
| :---- | :-------------------------------------------- | :------- | :-------------------------- |
| Admin | [azwansihandal@gmail.com](mailto:azwansihandal@gmail.com) | azwan123 | Akses penuh                 |
| User  | [john.doe@.com](mailto:john.doe@test.com) | user123  | Akses terbatas (GET /books) |

---

Dokumen **`API-DOCS.md`** sekarang sudah final dan siap digunakan.
