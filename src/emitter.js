"use strict";

const { TipeSimpul } = require("./parser");

const TEMPEL_KANAN = new Set(["(", "[", "!", "~", ".", "?.", "..."]);

const TEMPEL_KIRI = new Set([")", "]", ";", ",", ".", "?.", ":"]);

class Emitter {
  constructor(ast) {
    this.ast = ast;
  }

  perluSpasi(sebelum, sesudah) {
    if (!sebelum) return false;

    const nilaiSebelum =
      sebelum.tipe === TipeSimpul.KataKunci ? sebelum.jsNilai : sebelum.nilai;
    const nilaiSesudah =
      sesudah.tipe === TipeSimpul.KataKunci ? sesudah.jsNilai : sesudah.nilai;

    if (TEMPEL_KANAN.has(nilaiSebelum)) return false;

    if (TEMPEL_KIRI.has(nilaiSesudah)) return false;

    if (
      nilaiSesudah === "(" &&
      (sebelum.tipe === TipeSimpul.Pengenal ||
        sebelum.tipe === TipeSimpul.KataKunci)
    ) {
      return false;
    }

    if (nilaiSesudah === "++" || nilaiSesudah === "--") return false;

    return true;
  }

  hasilkan() {
    const bagian = [];
    let barisSaatIni = 1;
    let sebelum = null;
    let adalahAwalBaris = true;

    for (const simpul of this.ast.isi) {
      const barisTujuan = simpul.baris;
      const kolomTujuan = simpul.kolom;

      if (barisTujuan > barisSaatIni) {
        const jumlahBaris = barisTujuan - barisSaatIni;
        bagian.push("\n".repeat(jumlahBaris));
        barisSaatIni = barisTujuan;
        adalahAwalBaris = true;
      }

      if (adalahAwalBaris) {
        if (kolomTujuan > 1) {
          bagian.push(" ".repeat(kolomTujuan - 1));
        }
        adalahAwalBaris = false;
      } else {
        if (this.perluSpasi(sebelum, simpul)) {
          bagian.push(" ");
        }
      }

      let teks;
      switch (simpul.tipe) {
        case TipeSimpul.KataKunci:
          teks = simpul.jsNilai;
          break;

        case TipeSimpul.Pengenal:
        case TipeSimpul.Angka:
        case TipeSimpul.String:
        case TipeSimpul.TemplatString:
        case TipeSimpul.Simbol:
        case TipeSimpul.Komentar:
          teks = simpul.nilai;
          break;

        default:
          throw new Error(`Simpul tak dikenal: ${simpul.tipe}`);
      }

      bagian.push(teks);

      const barisTeks = teks.split("\n");
      if (barisTeks.length > 1) {
        barisSaatIni += barisTeks.length - 1;
        adalahAwalBaris = false;
      }

      sebelum = simpul;
    }

    return bagian.join("");
  }
}

/**
 * @param {Object} ast
 * @returns {string}
 */
function hasilkan(ast) {
  return new Emitter(ast).hasilkan();
}

module.exports = { hasilkan };
