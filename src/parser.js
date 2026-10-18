"use strict";

const { terjemahkan } = require("./kamus");
const { TipeToken } = require("./tokenizer");

const TipeSimpul = Object.freeze({
  KataKunci     : "KataKunci",
  Pengenal      : "Pengenal",
  Angka         : "Angka",
  String        : "String",
  TemplatString : "TemplatString",
  Simbol        : "Simbol",
  Komentar      : "Komentar",
});

class Parser {
  constructor(daftarToken) {
    this.token = daftarToken;
    this.posisi = 0;
  }

  parsing() {
    const simpul = [];

    while (this.posisi < this.token.length) {
      const t = this.token[this.posisi];

      if (t.tipe === TipeToken.AkhirBerkas) break;

      switch (t.tipe) {
        case TipeToken.KataKunci:
          simpul.push({
            tipe: TipeSimpul.KataKunci,
            lumiNilai: t.nilai,
            jsNilai: terjemahkan(t.nilai),
            baris: t.baris,
            kolom: t.kolom,
          });
          break;

        case TipeToken.Pengenal:
          simpul.push({
            tipe: TipeSimpul.Pengenal,
            nilai: t.nilai,
            baris: t.baris,
            kolom: t.kolom,
          });
          break;

        case TipeToken.Angka:
          simpul.push({
            tipe: TipeSimpul.Angka,
            nilai: t.nilai,
            baris: t.baris,
            kolom: t.kolom,
          });
          break;

        case TipeToken.String:
          simpul.push({
            tipe: TipeSimpul.String,
            nilai: t.nilai,
            baris: t.baris,
            kolom: t.kolom,
          });
          break;

        case TipeToken.TemplatString:
          simpul.push({
            tipe: TipeSimpul.TemplatString,
            nilai: t.nilai,
            baris: t.baris,
            kolom: t.kolom,
          });
          break;

        case TipeToken.Simbol:
          simpul.push({
            tipe: TipeSimpul.Simbol,
            nilai: t.nilai,
            baris: t.baris,
            kolom: t.kolom,
          });
          break;

        case TipeToken.Komentar:
          simpul.push({
            tipe: TipeSimpul.Komentar,
            nilai: t.nilai,
            baris: t.baris,
            kolom: t.kolom,
          });
          break;

        default:
          throw new Error(`Token tak dikenal: ${t.tipe} pada baris ${t.baris}`);
      }

      this.posisi++;
    }

    return { tipe: "Program", isi: simpul };
  }
}

/**
 * @param {Array} daftarToken
 * @returns {Object}
 */
function parsing(daftarToken) {
  return new Parser(daftarToken).parsing();
}

module.exports = { parsing, TipeSimpul };

