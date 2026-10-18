// src/kamus.js
// ============================================================
// Kamus Kata Kunci — satu-satunya sumber kebenaran
// untuk semua kata kunci bahasa Lumi → JavaScript.
// ============================================================

"use strict";

/**
 * Peta kata kunci Lumi → JavaScript.
 * Kunci   = kata kunci Lumi (bahasa Indonesia)
 * Nilai   = padanan JavaScript
 */
const KATA_KUNCI = Object.freeze({
  // ── Deklarasi ──────────────────────────────────────
  "misal"       : "let",
  "tetap"       : "const",
  "variabel"    : "var",

  // ── Fungsi ─────────────────────────────────────────
  "fungsi"      : "function",
  "kembalikan"  : "return",
  "panah"       : "=>",

  // ── Kontrol alur ───────────────────────────────────
  "jika"        : "if",
  "lainnya"     : "else",
  "selama"      : "while",
  "untuk"       : "for",
  "dari"        : "of",
  "lakukan"     : "do",
  "berhenti"    : "break",
  "lanjut"      : "continue",
  "saklar"      : "switch",
  "kasus"       : "case",
  "bawaan"      : "default",

  // ── Percobaan / kesalahan ──────────────────────────
  "coba"        : "try",
  "tangkap"     : "catch",
  "akhirnya"    : "finally",
  "lempar"      : "throw",

  // ── Kelas & OOP ────────────────────────────────────
  "kelas"       : "class",
  "warisi"      : "extends",
  "super"       : "super",
  "baru"        : "new",
  "ini"         : "this",

  // ── Logika / nilai ─────────────────────────────────
  "benar"       : "true",
  "salah"       : "false",
  "kosong"      : "null",
  "takTerdefinisi" : "undefined",
  "tipeDari"    : "typeof",
  "instansiDari": "instanceof",
  "dan"         : "&&",
  "atau"        : "||",
  "bukan"       : "!",

  // ── Async ──────────────────────────────────────────
  "asinkron"    : "async",
  "tunggu"      : "await",

  // ── Modul ──────────────────────────────────────────
  "impor"       : "import",
  "ekspor"      : "export",

  // ── Built-in aliases ───────────────────────────────
  "cetak"           : "console.log",
  "cetakPeringatan" : "console.warn",
  "cetakKesalahan"  : "console.error",

  // ── Tambahan ───────────────────────────────────────
  "hapus"       : "delete",
  "hasil"       : "yield",
  "di"          : "in",
});

// Set berisi semua kata kunci Lumi agar pencarian O(1)
const HIMPUNAN_KATA_KUNCI = new Set(Object.keys(KATA_KUNCI));

/**
 * Apakah sebuah token merupakan kata kunci Lumi?
 */
function apakahKataKunci(kata) {
  return HIMPUNAN_KATA_KUNCI.has(kata);
}

/**
 * Terjemahkan kata kunci Lumi → padanan JS.
 * Mengembalikan kata asli jika bukan kata kunci.
 */
function terjemahkan(kata) {
  return KATA_KUNCI[kata] ?? kata;
}

module.exports = { KATA_KUNCI, HIMPUNAN_KATA_KUNCI, apakahKataKunci, terjemahkan };

