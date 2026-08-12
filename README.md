# Panduan Deploy ke GearHost

Paket ini berisi server Node.js/Express minimal untuk dijadikan endpoint **"API Sungguhan"**
pada bagian 6 (Perbandingan Pemrosesan Sisi Server vs Sisi Client) di instrumen komparasi
OpenCV.js vs face-api.js.

## Isi paket
- `server.js` — logika server (terima upload gambar, ukur payload, simulasi waktu proses)
- `package.json` — daftar dependensi (express, multer, cors)
- `web.config` — konfigurasi IIS/iisnode agar GearHost menjalankan `server.js`

## Langkah deploy

1. **Buat CloudSite baru** (atau pakai yang sudah ada) di dashboard GearHost, pilih tipe
   aplikasi **Node.js**.
2. Buka menu **Publish** pada CloudSite tersebut, pilih metode **Local Git**. GearHost akan
   memberi Anda URL Git dan kredensial (username/password) untuk push.
3. Di komputer Anda, masuk ke folder paket ini lalu jalankan:
   ```bash
   git init
   git add .
   git commit -m "server uji sisi server"
   git remote add gearhost <URL_GIT_DARI_GEARHOST>
   git push gearhost master
   ```
4. GearHost akan otomatis menjalankan `npm install` untuk memasang `express`, `multer`, dan
   `cors`, lalu menjalankan `server.js` melalui iisnode.
5. Setelah deploy selesai, cek status **Running** di tab **Overview** (seperti pada dashboard
   yang Anda tunjukkan sebelumnya), lalu buka URL preview-nya, contoh:
   ```
   https://nama-cloudsite-anda.gearhostpreview.com/
   ```
   Anda akan melihat respons JSON `{"status":"ok", ...}` — tandanya server sudah aktif.

## Menghubungkan ke instrumen HTML

Pada instrumen `instrumen-komparasi-opencv-faceapi.html`, bagian **6 · Perbandingan
Pemrosesan Sisi Server vs Sisi Client**:

1. Pilih mode **"Panggil API Server Sungguhan"**.
2. Isi kolom **Endpoint URL** dengan:
   ```
   https://nama-cloudsite-anda.gearhostpreview.com/deteksi
   ```
3. Klik **"Jalankan Uji Sisi Server"** — instrumen akan mengirim frame kamera ke server ini,
   dan latensi unggah–proses–respons akan tercatat di tabel perbandingan.

Opsional: tambahkan `?delay=150` di akhir URL endpoint untuk mengatur simulasi waktu proses
server (dalam milidetik), misalnya:
```
https://nama-cloudsite-anda.gearhostpreview.com/deteksi?delay=150
```

## Mengganti simulasi dengan deteksi wajah sungguhan

Di dalam `server.js`, cari komentar `TODO: proses deteksi wajah sungguhan di sini`. Bagian itu
bisa diganti dengan pipeline deteksi wajah nyata, misalnya memanggil API pihak ketiga
(Azure Face, AWS Rekognition, dll.) menggunakan `req.file.buffer` sebagai data gambarnya.
Pertimbangkan kuota CPU Time (60 menit/hari pada tier gratis) — pipeline yang berat
sebaiknya diuji dengan trial dalam jumlah terbatas.

## Catatan tentang batasan tier gratis GearHost

- **CPU Time**: 60 menit/hari — cukup untuk puluhan–ratusan trial ringan, tapi hindari
  menjalankan 36-skenario-otomatis di instrumen HTML terlalu sering dalam mode server dalam
  satu hari yang sama.
- **Memory**: 256 MB — cukup untuk server Express sederhana ini.
- **File System Storage**: 100 MB — cukup untuk `node_modules` dari 3 paket ini.
- **Bandwidth**: 1 GB per periode reset — perhatikan jika gambar yang diunggah cukup besar
  dan trial dijalankan berkali-kali.
