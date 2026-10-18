"use strict";

const { apakahKataKunci } = require("./kamus");

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

  intip() {
    return this.posisi < this.sumber.length ? this.sumber[this.posisi] : null;
  }

  intipDepan(n = 1) {
    const idx = this.posisi + n;
    return idx < this.sumber.length ? this.sumber[idx] : null;
  }

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

  buatToken(tipe, nilai) {
    return { tipe, nilai, baris: this._awalBaris, kolom: this._awalKolom };
  }

  tokenisasi() {
    while (this.posisi < this.sumber.length) {
      this._awalBaris = this.baris;
      this._awalKolom = this.kolom;
      const ch = this.intip();

      if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
        this.maju();
        continue;
      }

      if (ch === "/" && this.intipDepan() === "/") {
        this.bacaKomentarSeBaris();
        continue;
      }

      if (ch === "/" && this.intipDepan() === "*") {
        this.bacaKomentarBlok();
        continue;
      }

      if (ch === '"' || ch === "'") {
        this.token.push(this.bacaString());
        continue;
      }

      if (ch === "`") {
        this.token.push(this.bacaTemplatString());
        continue;
      }

      if (this.adalahDigit(ch) || (ch === "." && this.adalahDigit(this.intipDepan()))) {
        this.token.push(this.bacaAngka());
        continue;
      }

      if (this.adalahAwalPengenal(ch)) {
        this.token.push(this.bacaPengenal());
        continue;
      }

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

  bacaKomentarSeBaris() {
    let nilai = "";
    while (this.posisi < this.sumber.length && this.intip() !== "\n") {
      nilai += this.maju();
    }
    this.token.push(this.buatToken(TipeToken.Komentar, nilai));
  }

  bacaKomentarBlok() {
    let nilai = "";
    nilai += this.maju();
    nilai += this.maju();
    while (this.posisi < this.sumber.length) {
      if (this.intip() === "*" && this.intipDepan() === "/") {
        nilai += this.maju();
        nilai += this.maju();
        break;
      }
      nilai += this.maju();
    }
    this.token.push(this.buatToken(TipeToken.Komentar, nilai));
  }

  bacaString() {
    const kutip = this.maju();
    let nilai = kutip;
    while (this.posisi < this.sumber.length) {
      const ch = this.intip();
      if (ch === "\\") {
        nilai += this.maju();
        if (this.posisi < this.sumber.length) {
          nilai += this.maju();
        }
        continue;
      }
      if (ch === kutip) {
        nilai += this.maju();
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
    let nilai = this.maju();
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

    if (this.intip() === "0" && this.intipDepan() &&
        "xXoObB".includes(this.intipDepan())) {
      nilai += this.maju();
      nilai += this.maju();
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
      nilai += this.maju();
      while (this.posisi < this.sumber.length && this.adalahDigit(this.intip())) {
        nilai += this.maju();
      }
    }
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

    if (ch === "=" && next === "=" && next2 === "=") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, "==="); }
    if (ch === "!" && next === "=" && next2 === "=") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, "!=="); }
    if (ch === "." && next === "." && next2 === ".") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, "..."); }
    if (ch === ">" && next === ">" && next2 === ">") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, ">>>"); }
    if (ch === "*" && next === "*" && next2 === "=") { this.maju(); this.maju(); return this.buatToken(TipeToken.Simbol, "**="); }

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

    return this.buatToken(TipeToken.Simbol, ch);
  }
}

/**
 * @param {string} sumberKode
 * @returns {Array}
 */
function tokenisasi(sumberKode) {
  return new Tokenizer(sumberKode).tokenisasi();
}

module.exports = { tokenisasi, TipeToken };

