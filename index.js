/**
 * Konversi dari index.php + deteksi.php (PHP) ke Cloudflare Worker (JS murni).
 * Setara dengan:
 *   - GET  /            -> index.php   (status check)
 *   - POST /deteksi     -> deteksi.php (terima upload gambar, ukur payload,
 *                                       simulasikan waktu proses, balas JSON)
 *
 * Tidak perlu Docker/PHP sama sekali — Worker ini jalan native di Cloudflare.
 */

const MAX_BYTES = 5 * 1024 * 1024; // 5MB, sama seperti batas di deteksi.php

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}

async function handleIndex() {
  // Setara dengan index.php
  return json({
    status: "ok",
    message: "Server uji sisi server aktif (Cloudflare Workers).",
    endpoint_deteksi: 'POST /deteksi (multipart/form-data, field "image")',
  });
}

async function handleDeteksi(request, url) {
  const t0 = Date.now();

  if (request.method !== "POST") {
    return json(
      { error: 'Method tidak diizinkan. Gunakan POST multipart/form-data dengan field "image".' },
      405
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return json({ error: "Body bukan multipart/form-data yang valid." }, 400);
  }

  const file = formData.get("image");

  if (!file || typeof file === "string") {
    return json({ error: 'Field "image" tidak ditemukan pada request.' }, 400);
  }

  const payloadBytes = file.size;

  if (payloadBytes > MAX_BYTES) {
    return json({ error: "Ukuran file melebihi batas 5MB." }, 413);
  }

  // ---- TODO: proses deteksi wajah sungguhan di sini ----
  // Contoh: ambil bytes gambar dengan `await file.arrayBuffer()`, lalu kirim
  // ke API/model deteksi wajah pihak ketiga (mis. via fetch ke Azure Face,
  // AWS Rekognition, atau Cloudflare Workers AI), lalu isi hasilnya ke
  // variabel detectionResult di bawah.
  const detectionResult = null; // placeholder — Worker ini belum melakukan deteksi nyata

  // Simulasi beban komputasi server (default 80ms, bisa diubah lewat ?delay=120)
  const delayParam = parseInt(url.searchParams.get("delay") ?? "80", 10);
  const simulatedMs = Math.min(3000, Math.max(0, isNaN(delayParam) ? 80 : delayParam));
  await new Promise((resolve) => setTimeout(resolve, simulatedMs));
  // ---- akhir bagian yang bisa diganti ----

  const serverProcessMs = Date.now() - t0;

  return json({
    status: "ok",
    payload_bytes: payloadBytes,
    payload_kb: Math.round((payloadBytes / 1024) * 10) / 10,
    server_process_ms: serverProcessMs,
    detection: detectionResult,
    note:
      "Server ini mengukur ukuran payload & mensimulasikan waktu proses. Ganti bagian TODO di src/index.js dengan pipeline deteksi wajah sungguhan bila diperlukan.",
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/" || url.pathname === "") {
      return handleIndex();
    }

    if (url.pathname === "/deteksi") {
      return handleDeteksi(request, url);
    }

    return json({ error: "Not found" }, 404);
  },
};
