// src/tokenizer.js
// ============================================================
// Tokenizer (Lexer) — membaca kode sumber karakter per karakter
// dan menghasilkan daftar token.
//
// Token yang dihasilkan tidak pernah mengubah isi string atau
// komentar — hanya identifier yang cocok dengan kamus yang
// diklasifikasikan sebagai KataKunci.
// ============================================================

"use strict";

const { apakahKataKunci } = require("./kamus");

// Tipe token
const TipeToken = Object.freeze({
  KataKunci     : "KataKunci",
  Pengenal      : "Pengenal",
  Angka         : "Angka",
  String        : "String",
  TemplatString : "TemplatString",
  Simbol        : "Simbol",
  Komentar      : "Komentar",
  AkhirBerkas   : "AkhirBerkas",
});

class Tokenizer {
  constructor(sumberKode) {
    this.sumber = sumberKode;
    this.posisi = 0;
    this.baris  = 1;
    this.kolom  = 1;
    this.token  = [];
    this._awalBaris = 1;
    this._awalKolom = 1;
  }

  // Intip karakter saat ini tanpa memajukan posisi
  intip() {
    return this.posisi < this.sumber.length ? this.sumber[this.posisi] : null;
  }

  // Intip karakter ke-n di depan
  intipDepan(n = 1) {
    const idx = this.posisi + n;
    return idx < this.sumber.length ? this.sumber[idx] : null;
  }

  // Konsumsi karakter saat ini dan majukan posisi
  maju() {
    const ch = this.sumber[this.posisi++];
    if (ch === "\n") {
      this.baris++;
      this.kolom = 1;
    } else {
      this.kolom++;
    }
    return ch;
  }

  // Buat objek token
  buatToken(tipe, nilai) {
    return { tipe, nilai, baris: this._awalBaris, kolom: this._awalKolom };
  }

  // ── Metode utama tokenisasi ────────────────────────
  tokenisasi() {
    while (this.posisi < this.sumber.length) {
      this._awalBaris = this.baris;
      this._awalKolom = this.kolom;
      const ch = this.intip();

      // Lewati spasi putih
      if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
        this.maju();
        continue;
      }

      // Komentar satu baris
      if (ch === "/" && this.intipDepan() === "/") {
        this.bacaKomentarSeBaris();
        continue;
      }

      // Komentar blok
      if (ch === "/" && this.intipDepan() === "*") {
        this.bacaKomentarBlok();
        continue;
      }

      // String (kutip ganda atau tunggal)
      if (ch === '"' || ch === "'") {
        this.token.push(this.bacaString());
        continue;
      }

      // Template literal (backtick)
      if (ch === "`") {
        this.token.push(this.bacaTemplatString());
        continue;
      }

      // Angka
      if (this.adalahDigit(ch) || (ch === "." && this.adalahDigit(this.intipDepan()))) {
        this.token.push(this.bacaAngka());
        continue;
      }

      // Pengenal dan kata kunci
      if (this.adalahAwalPengenal(ch)) {
        this.token.push(this.bacaPengenal());
        continue;
      }

      // Simbol / operator
      this.token.push(this.bacaSimbol());
    }

    this.token.push({
      tipe: TipeToken.AkhirBerkas,
      nilai: null,
      baris: this.baris,
      kolom: this.kolom,
    });

    return this.token;
  }

  // ── Pembantu ───────────────────────────────────────

  adalahDigit(ch) {
    return ch >= "0" && ch <= "9";
  }

  adalahAwalPengenal(ch) {
    return (ch >= "a" && ch <= "z") ||
           (ch >= "A" && ch <= "Z") ||
           ch === "_" || ch === "$";
  }

  adalahBagianPengenal(ch) {
    return this.adalahAwalPengenal(ch) || this.adalahDigit(ch);
  }

  // ── Pembaca token ──────────────────────────────────

  bacaKomentarSeBaris() {
    let nilai = "";
    while (this.posisi < this.sumber.length && this.intip() !== "\n") {
      nilai += this.maju();
    }
    this.token.push(this.buatToken(TipeToken.Komentar, nilai));
  }

  bacaKomentarBlok() {
    let nilai = "";
    nilai += this.maju(); // /
    nilai += this.maju(); // *
    while (this.posisi < this.sumber.length) {
      if (this.intip() === "*" && this.intipDepan() === "/") {
        nilai += this.maju(); // *
        nilai += this.maju(); // /
        break;
      }
      nilai += this.maju();
    }
    this.token.push(this.buatToken(TipeToken.Komentar, nilai));
  }

  bacaString() {
    const kutip = this.maju(); // kutip pembuka
    let nilai = kutip;
    while (this.posisi < this.sumber.length) {
      const ch = this.intip();
      if (ch === "\\") {
        nilai += this.maju(); // backslash
        if (this.posisi < this.sumber.length) {
          nilai += this.maju(); // karakter yang di-escape
        }
        continue;
      }
      if (ch === kutip) {
        nilai += this.maju(); // kutip penutup
        break;
      }
      if (ch === "\n") {
        throw new SyntaxError(
          `String belum ditutup pada baris ${this._awalBaris}, kolom ${this._awalKolom}`
        );
      }
      nilai += this.maju();
    }
    return this.buatToken(TipeToken.String, nilai);
  }

  bacaTemplatString() {
    let nilai = this.maju(); // backtick pembuka
    while (this.posisi < this.sumber.length) {
      const ch = this.intip();
      if (ch === "\\") {
        nilai += this.maju();
        if (this.posisi < this.sumber.length) nilai += this.maju();
        continue;
      }
      if (ch === "`") {
        nilai += this.maju();
        break;
      }
      nilai += this.maju();
    }
    return this.buatToken(TipeToken.TemplatString, nilai);
  }

  bacaAngka() {
    let nilai = "";
    // Tangani prefix 0x, 0o, 0b
    if (this.intip() === "0" && this.intipDepan() &&
        "xXoObB".includes(this.intipDepan())) {
      nilai += this.maju(); // 0
      nilai += this.maju(); // x/o/b
      while (this.posisi < this.sumber.length &&
             (this.adalahDigit(this.intip()) ||
              (this.intip() >= "a" && this.intip() <= "f") ||
              (this.intip() >= "A" && this.intip() <= "F") ||
              this.intip() === "_")) {
        nilai += this.maju();
      }
      return this.buatToken(TipeToken.Angka, nilai);
    }

    while (this.posisi < this.sumber.length &&
           (this.adalahDigit(this.intip()) || this.intip() === "_")) {
      nilai += this.maju();
    }
    if (this.intip() === "." && this.adalahDigit(this.intipDepan())) {
      nilai += this.maju(); // .
      while (this.posisi < this.sumber.length && this.adalahDigit(this.intip())) {
        nilai += this.maju();
      }
    }
    // Tangani eksponen
    if (this.intip() === "e" || this.intip() === "E") {
      nilai += this.maju();
      if (this.intip() === "+" || this.intip() === "-") {
        nilai += this.maju();
      }
      while (this.posisi < this.sumber.length && this.adalahDigit(this.intip())) {
        nilai += this.maju();
      }
    }
    return this.buatToken(TipeToken.Angka, nilai);
  }

  bacaPengenal() {
    let nilai = "";
    while (this.posisi < this.sumber.length && this.adalahBagianPengenal(this.intip())) {
      nilai += this.maju();
    }
    const tipe = apakahKataKunci(nilai) ? TipeToken.KataKunci : TipeToken.Pengenal;
    return this.buatToken(tipe, nilai);
  }

  bacaSimbol() {
    const ch = this.maju();
    const next = this.intip();
    const next2 = this.intipDepan();

    // Operator tiga karakter
    if (ch === "=" && next === "=" && next2 === "=") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, "==="); }
    if (ch === "!" && next === "=" && next2 === "=") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, "!=="); }
    if (ch === "." && next === "." && next2 === ".") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, "..."); }
    if (ch === ">" && next === ">" && next2 === ">") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, ">>>"); }
    if (ch === "*" && next === "*" && next2 === "=") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, "**="); }

    // Operator dua karakter
    if (ch === "=" && next === "=") { this.maju(); return this.buatToken(TipeToken.Simbol, "=="); }
    if (ch === "!" && next === "=") { this.maju(); return this.buatToken(TipeToken.Simbol, "!="); }
    if (ch === "<" && next === "=") { this.maju(); return this.buatToken(TipeToken.Simbol, "<="); }
    if (ch === ">" && next === "=") { this.maju(); return this.buatToken(TipeToken.Simbol, ">="); }
    if (ch === "+" && next === "+") { this.maju(); return this.buatToken(TipeToken.Simbol, "++"); }
    if (ch === "-" && next === "-") { this.maju(); return this.buatToken(TipeToken.Simbol, "--"); }
    if (ch === "+" && next === "=") { this.maju(); return this.buatToken(TipeToken.Simbol, "+="); }
    if (ch === "-" && next === "=") { this.maju(); return this.buatToken(TipeToken.Simbol, "-="); }
    if (ch === "*" && next === "=") { this.maju(); return this.buatToken(TipeToken.Simbol, "*="); }
    if (ch === "/" && next === "=") { this.maju(); return this.buatToken(TipeToken.Simbol, "/="); }
    if (ch === "%" && next === "=") { this.maju(); return this.buatToken(TipeToken.Simbol, "%="); }
    if (ch === "&" && next === "&") { this.maju(); return this.buatToken(TipeToken.Simbol, "&&"); }
    if (ch === "|" && next === "|") { this.maju(); return this.buatToken(TipeToken.Simbol, "||"); }
    if (ch === "?" && next === "?") { this.maju(); return this.buatToken(TipeToken.Simbol, "??"); }
    if (ch === "?" && next === ".") { this.maju(); return this.buatToken(TipeToken.Simbol, "?."); }
    if (ch === "=" && next === ">") { this.maju(); return this.buatToken(TipeToken.Simbol, "=>"); }
    if (ch === "*" && next === "*") { this.maju(); return this.buatToken(TipeToken.Simbol, "**"); }
    if (ch === "<" && next === "<") { this.maju(); return this.buatToken(TipeToken.Simbol, "<<"); }
    if (ch === ">" && next === ">") { this.maju(); return this.buatToken(TipeToken.Simbol, ">>"); }

    // Operator/pembatas satu karakter
    return this.buatToken(TipeToken.Simbol, ch);
  }
}

/**
 * Tokenisasi kode sumber Lumi menjadi daftar token.
 * @param {string} sumberKode — kode sumber Lumi
 * @returns {Array} daftar token
 */
function tokenisasi(sumberKode) {
  return new Tokenizer(sumberKode).tokenisasi();
}

module.exports = { tokenisasi, TipeToken };

