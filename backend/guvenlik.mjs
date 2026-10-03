// Sunucu güvenlik yardımcıları. Saf fonksiyonlar: Deno'da (index.ts) ve Node testlerinde aynen çalışır.
// 1) Kaleci tohumu oyuncuya özel ve istemcinin bilmediği bir sırdan türetilir (HMAC); eskiden herkes için
//    "oda kodu × vuruş" idi, yani biri oynayınca kalecinin rastgele kararları herkesçe biliniyordu.
// 2) Başkalarının girdileri (nişan, temas, zamanlama, tohum) durum cevabından çıkarılır; yalnızca sonuç ve puan kalır.
const enc = new TextEncoder();

export async function hmac(secret, text) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(text)));
}

/** int32 ORTAK tohum: sunucu sırrı, oda ve vuruş indeksinden. Oyuncudan BAĞIMSIZDIR: aynı odada, aynı vuruşta beş arkadaşın
 *  kaleci koşulları (yanlış karar zarları ve tahmin gürültüsü dahil) aynıdır; aynı girdi herkese aynı sonucu verir.
 *  İstemci oda kodundan ya da başka bir şeyden bunu hesaplayamaz; yalnızca vuruşu attıktan sonra kendi vuruşunun tohumunu görür. */
export async function tohum(secret, roomId, idx) {
  const sig = await hmac(secret, 'duran-top|v6|ortak|' + roomId + '|' + idx);
  return new DataView(sig.buffer).getInt32(0);
}

function gizle(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const kopya = { ...entry };
  delete kopya.input;      // nişan, temas, zamanlama ve tohum yalnızca vuruşu atan oyuncuya gider
  return kopya;
}

function ozetle(entries) {
  const e = entries || [];
  return { puan: e.reduce((t, x) => t + (x.puan || 0), 0), gol: e.filter((x) => x.gol).length, yesil: e.filter((x) => x.yesil).length };
}

/** Durum cevabındaki oyuncu listesi. Kaleci koşulları ortak olduğu için başkalarının sonuçları sıra gelmeden öğretici olabilir:
 *  - kendi girdilerin ve sonuçların tam görünür;
 *  - başkası turunu bitirene kadar yalnızca ilerlemesi (idx) görünür;
 *  - bitirmiş birinin toplamı (ozet) görünür; vuruş vuruş sonuçlarını ise sen de turunu bitirdikten sonra görürsün;
 *  - başkasının nişan, temas, zamanlama ve tohumu hiçbir zaman görünmez. */
export function oyuncular(rows, hash, total=5) {
  const ben = rows.find(function (p) { return p.token_hash === hash; });
  const benBitirdi = !!ben && ben.idx >= total;
  return rows.map(function (p) {
    const mine = p.token_hash === hash;
    if (mine) return { player: p.player, idx: p.idx, entries: p.entries, mine: true };
    const bitti = p.idx >= total;
    return {
      player: p.player, idx: p.idx, mine: false,
      entries: bitti && benBitirdi ? (p.entries || []).map(gizle) : [],
      ozet: bitti ? ozetle(p.entries) : null
    };
  });
}

/** Günlük oda sınırları. Sayım ve ekleme veritabanında TEK atomik işlemdir (schema.sql: dt_live_create_room); burada yalnızca sınır değerleri. */
export const ODA_SINIRI = { token: 8, genel: 100 };
