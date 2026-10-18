#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const { tokenisasi } = require("./tokenizer");
const { parsing } = require("./parser");
const { hasilkan } = require("./emitter");

const W = {
  reset: "\x1b[0m",
  merah: "\x1b[31m",
  hijau: "\x1b[32m",
  kuning: "\x1b[33m",
  biru: "\x1b[34m",
  cyan: "\x1b[36m",
  redup: "\x1b[2m",
  tebal: "\x1b[1m",
};

function cetakBanner() {
  console.log(`${W.cyan}${W.tebal}`);
  console.log(`   ██╗     ██╗   ██╗███╗   ███╗██╗     ██╗███████╗`);
  console.log(`   ██║     ██║   ██║████╗ ████║██║     ██║██╔════╝`);
  console.log(`   ██║     ██║   ██║██╔████╔██║██║     ██║███████╗`);
  console.log(`   ██║     ██║   ██║██║╚██╔╝██║██║██   ██║╚════██║`);
  console.log(`   ███████╗╚██████╔╝██║ ╚═╝ ██║██║╚█████╔╝███████║`);
  console.log(`   ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝ ╚════╝ ╚══════╝`);
  console.log(
    `${W.reset}${W.redup}           © LumiJS. All Rights Reserved.${W.reset}`,
  );
  console.log();
}

function cetakPenggunaan() {
  cetakBanner();
  console.log(`${W.kuning}Penggunaan:${W.reset}`);
  console.log(
    `  node src/lumi.js <berkas.lumi>        ${W.redup}Jalankan berkas${W.reset}`,
  );
  console.log(
    `  node src/lumi.js <berkas.lumi> --cetak ${W.redup}Tampilkan hasil JS tanpa menjalankan${W.reset}`,
  );
  console.log(
    `  node src/lumi.js <berkas.lumi> --token ${W.redup}Tampilkan daftar token${W.reset}`,
  );
  console.log(
    `  node src/lumi.js <berkas.lumi> --ast   ${W.redup}Tampilkan AST${W.reset}`,
  );
  console.log();
}

function utama() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    cetakPenggunaan();
    process.exit(1);
  }

  const berkasLumi = args[0];
  const bendera = new Set(args.slice(1));

  if (path.extname(berkasLumi) !== ".lumi") {
    console.error(
      `${W.merah}Kesalahan:${W.reset} Berkas harus berekstensi .lumi`,
    );
    process.exit(1);
  }

  let sumberKode;
  try {
    sumberKode = fs.readFileSync(berkasLumi, "utf-8");
  } catch (err) {
    console.error(
      `${W.merah}Kesalahan:${W.reset} Tidak dapat membaca berkas '${berkasLumi}'`,
    );
    console.error(`  ${W.redup}${err.message}${W.reset}`);
    process.exit(1);
  }

  cetakBanner();
  console.log(`${W.biru}▸ Berkas:${W.reset} ${berkasLumi}`);
  console.log();

  try {
    const daftarToken = tokenisasi(sumberKode);

    if (bendera.has("--token")) {
      console.log(`${W.kuning}══════ DAFTAR TOKEN ══════${W.reset}`);
      for (const t of daftarToken) {
        if (t.tipe === "AkhirBerkas") continue;
        console.log(
          `  ${W.redup}[${t.baris}:${t.kolom}]${W.reset} ` +
            `${W.hijau}${t.tipe.padEnd(14)}${W.reset} ${t.nilai}`,
        );
      }
      console.log();
    }

    const ast = parsing(daftarToken);

    if (bendera.has("--ast")) {
      console.log(`${W.kuning}══════ AST ══════${W.reset}`);
      console.log(JSON.stringify(ast, null, 2));
      console.log();
    }

    const kodeJS = hasilkan(ast);

    if (bendera.has("--cetak")) {
      console.log(`${W.kuning}══════ KODE JAVASCRIPT ══════${W.reset}`);
      const baris = kodeJS.split("\n");
      baris.forEach((b, i) => {
        const noBaris = String(i + 1).padStart(3);
        console.log(`  ${W.redup}${noBaris} │${W.reset} ${b}`);
      });
      console.log();
    }

    if (
      (bendera.has("--cetak") ||
        bendera.has("--token") ||
        bendera.has("--ast")) &&
      !bendera.has("--jalankan")
    ) {
      if (bendera.has("--cetak")) return;
    }

    console.log(`${W.hijau}══════ HASIL EKSEKUSI ══════${W.reset}`);

    const konteks = vm.createContext({
      console,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      require,
      process,
      Buffer,
      __filename: path.resolve(berkasLumi),
      __dirname: path.dirname(path.resolve(berkasLumi)),
      Math,
      Date,
      JSON,
      Array,
      Object,
      String: globalThis.String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      Promise,
      Error,
      TypeError,
      RangeError,
      SyntaxError,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURIComponent,
      decodeURIComponent,
      encodeURI,
      decodeURI,
    });

    vm.runInContext(kodeJS, konteks, {
      filename: berkasLumi,
      displayErrors: true,
    });

    console.log();
    console.log(`${W.hijau}✔ Selesai.${W.reset}`);
  } catch (err) {
    console.error();
    console.error(`${W.merah}✘ Kesalahan saat transpilasi:${W.reset}`);
    console.error(`  ${err.message}`);
    if (err.stack) {
      const barisStack = err.stack.split("\n").slice(1, 4);
      for (const b of barisStack) {
        console.error(`  ${W.redup}${b.trim()}${W.reset}`);
      }
    }
    process.exit(1);
  }
}

utama();
