# Panduan Deploy ke Cloudflare Workers (tanpa PHP, tanpa Docker)

Paket ini adalah **konversi dari index.php + deteksi.php** ke Cloudflare Worker (JavaScript
murni). Fungsinya identik dengan versi PHP: status check di `/`, dan endpoint upload gambar
di `/deteksi` yang mengukur payload & mensimulasikan waktu proses.

## Isi paket

| File | Peran | Setara dengan (versi PHP) |
|---|---|---|
| `src/index.js` | Seluruh logika Worker (routing `/` dan `/deteksi`) | `index.php` + `deteksi.php` |
| `wrangler.jsonc` | Konfigurasi deploy | — |

Tidak perlu Apache, tidak perlu PHP, tidak perlu Docker — Worker jalan native di edge Cloudflare.

## Langkah deploy

### 1. Install Wrangler (kalau belum ada)
```bash
npm install -g wrangler
```

### 2. Login ke akun Cloudflare Anda
```bash
wrangler login
```

### 3. Masuk ke folder paket ini, lalu deploy
```bash
cd deteksi-wajah-worker
wrangler deploy
```

Setelah selesai, Wrangler akan menampilkan URL Worker Anda, contoh:
```
https://deteksi-wajah-worker.<subdomain-anda>.workers.dev
```
(Berdasarkan dashboard Anda, subdomain-nya kemungkinan `sismadi.workers.dev`.)

### 4. Uji endpoint
```bash
curl https://deteksi-wajah-worker.sismadi.workers.dev/
curl -F "image=@/path/ke/foto.jpg" "https://deteksi-wajah-worker.sismadi.workers.dev/deteksi?delay=150"
```

## Menghubungkan ke instrumen HTML (index.html)

Sama seperti versi PHP — pada bagian **6 · Perbandingan Pemrosesan Sisi Server vs Sisi Client**,
pilih **"Panggil API Server Sungguhan"**, lalu isi Endpoint URL dengan:
```
https://deteksi-wajah-worker.sismadi.workers.dev/deteksi
```

Karena Worker otomatis HTTPS, masalah *mixed content* (yang muncul di versi Ubuntu/HTTP) tidak
akan terjadi lagi — instrumen bisa diakses dari `https://` mana pun tanpa hambatan.

## Perbedaan penting dari versi PHP/Ubuntu

- **Tidak ada server untuk dikelola** — tidak ada SSH, tidak ada Apache/php.ini yang perlu
  dikonfigurasi, tidak ada `upload_max_filesize`. Batas ukuran file (5MB) sudah dicek langsung
  di kode (`MAX_BYTES`).
- **Deploy dalam hitungan detik** — `wrangler deploy` cukup sekali, tanpa `scp` manual.
- **Global by default** — Worker otomatis berjalan di banyak lokasi Cloudflare terdekat dengan
  pengguna, tidak terpaku pada satu IP server seperti `167.99.65.190`.
- **Mengganti simulasi dengan deteksi wajah sungguhan**: cari komentar
  `TODO: proses deteksi wajah sungguhan di sini` di `src/index.js`. Bisa diisi dengan `fetch()`
  ke API pihak ketiga (Azure Face, AWS Rekognition) atau ke Cloudflare Workers AI, menggunakan
  `await file.arrayBuffer()` sebagai data gambar.
