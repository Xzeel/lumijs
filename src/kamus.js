"use strict";

const KATA_KUNCI = Object.freeze({
  misal: "let",
  tetap: "const",
  variabel: "var",

  fungsi: "function",
  kembalikan: "return",
  panah: "=>",

  jika: "if",
  lainnya: "else",
  selama: "while",
  untuk: "for",
  dari: "of",
  lakukan: "do",
  berhenti: "break",
  lanjut: "continue",
  saklar: "switch",
  kasus: "case",
  bawaan: "default",

  coba: "try",
  tangkap: "catch",
  akhirnya: "finally",
  lempar: "throw",

  kelas: "class",
  warisi: "extends",
  super: "super",
  baru: "new",
  ini: "this",

  benar: "true",
  salah: "false",
  kosong: "null",
  takTerdefinisi: "undefined",
  tipeDari: "typeof",
  instansiDari: "instanceof",
  dan: "&&",
  atau: "||",
  bukan: "!",

  asinkron: "async",
  tunggu: "await",

  impor: "import",
  ekspor: "export",

  cetak: "console.log",
  cetakPeringatan: "console.warn",
  cetakKesalahan: "console.error",

  hapus: "delete",
  hasil: "yield",
  di: "in",
});

const HIMPUNAN_KATA_KUNCI = new Set(Object.keys(KATA_KUNCI));

function apakahKataKunci(kata) {
  return HIMPUNAN_KATA_KUNCI.has(kata);
}

function terjemahkan(kata) {
  return KATA_KUNCI[kata] ?? kata;
}

module.exports = {
  KATA_KUNCI,
  HIMPUNAN_KATA_KUNCI,
  apakahKataKunci,
  terjemahkan,
};
