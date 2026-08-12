/**
 * Server contoh untuk endpoint "Sisi Server" pada instrumen komparasi
 * OpenCV.js vs face-api.js (bagian 6: Perbandingan Pemrosesan Sisi Server vs Sisi Client).
 *
 * Fungsi:
 *  - Menerima upload gambar (multipart/form-data, field "image")
 *  - Mengukur ukuran payload yang diterima
 *  - Mensimulasikan waktu pemrosesan server (bisa dikonfigurasi via query ?delay=ms)
 *  - Mengembalikan JSON berisi metrik, untuk dibandingkan dengan latensi client-side
 *
 * Catatan: logika di dalam blok "TODO: proses deteksi wajah sungguhan di sini"
 * bisa diganti dengan pipeline deteksi wajah nyata (mis. panggil model/API lain)
 * bila ingin server ini benar-benar melakukan deteksi, bukan hanya simulasi.
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();

// Simpan file upload di memori (bukan disk) — cocok untuk kuota storage kecil di GearHost.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // maks 5MB per gambar
});

// Izinkan diakses dari domain mana pun (instrumen HTML bisa dibuka lokal atau di-hosting terpisah).
// Jika ingin membatasi, ganti origin: '*' dengan origin: 'https://domain-instrumen-anda.com'
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server uji sisi server aktif di GearHost.',
    endpoint_deteksi: 'POST /deteksi (multipart/form-data, field "image")'
  });
});

app.post('/deteksi', upload.single('image'), async (req, res) => {
  const t0 = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Field "image" tidak ditemukan pada request.' });
    }

    const payloadBytes = req.file.size;

    // ---- TODO: proses deteksi wajah sungguhan di sini ----
    // Contoh: panggil model/API deteksi wajah lain menggunakan req.file.buffer,
    // lalu isi hasilnya ke variabel `detectionResult` di bawah.
    const detectionResult = null; // placeholder — server ini belum melakukan deteksi nyata

    // Simulasi beban komputasi server (default 80ms, bisa diubah lewat ?delay=120 pada URL)
    const simulatedMs = Math.min(3000, Math.max(0, parseInt(req.query.delay, 10) || 80));
    await new Promise(resolve => setTimeout(resolve, simulatedMs));
    // ---- akhir bagian yang bisa diganti ----

    const serverProcessMs = Date.now() - t0;

    res.json({
      status: 'ok',
      payload_bytes: payloadBytes,
      payload_kb: +(payloadBytes / 1024).toFixed(1),
      server_process_ms: serverProcessMs,
      detection: detectionResult,
      note: 'Server ini mengukur ukuran payload & mensimulasikan waktu proses. Ganti bagian TODO di server.js dengan pipeline deteksi wajah sungguhan bila diperlukan.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GearHost/iisnode menyuntikkan nomor port lewat process.env.PORT — wajib dipakai, jangan hardcode.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server uji sisi server berjalan di port ' + port);
});
