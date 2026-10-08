# Juninho Kupası 20261006d — b + c + a birleşimi

Taban: `0f9bfc1`. Sırayla uygulananlar:
1. **20261006b** (`DEGISIKLIK-20261006b.md`): ikinci sevinç, ok tuşlarıyla duruş, stadyum bayrakları.
2. **20261006c** (`DEGISIKLIK-20261006c.md`): FIFA tarzı frikik (zemin oku, falso, basılı tutarak güç, ibre).
3. **20261006a** (`DEGISIKLIK-20261006a.md`): gerçek kayıtlı sesler (vuruş, direk, file, düdük, gol uğultusu).
4. **Düdük pozisyon hazır olunca çalar** (yedek daldan `52c9609` + `9847c25` cherry-pick edildi).

Fizik, kaleci, kural sürümü (rules 9), Edge (`backend/`) ve SQL değişmedi. Yalnız site.

## Düdük
- Hakem düdüğü yeni pozisyon kurulurken (`vurusHazirla`) çalar. Sayfa yenilenip devam edilen vuruşta çalmaz.
- VUR'a basınca, frikikte güç için basılı tutarken ya da ibreye basınca **çalmaz** (`vur`, `vurusUygula`, `fifaBas`, `fifaBirak`, `fifaKare`, `nisanIlerle` içinde düdük yok).
- Yeni pozisyon kurulurken önceki golün uğultusu susturulur (`DT.ses.sustur`).
- `tests/ses-kayit-tam.cjs` bunu kaynak kod üzerinde sınar: düdük yalnız `vurusHazirla` ve ses açma önizlemesinde (2 çağrı), frikik fonksiyonlarında yok.

## Önbellek etiketleri (`index.html`)
- `js/oyun.js` → **20261006d** (b, c ve ses değişikliklerinin birleşimi).
- `js/ses.js` → 20261006a. Ses dosyaları `?v=20261006a`.
- `futbolcu3d`, `sevinc`, `tribun`, `canli` → 20261006b; `cizim` → 20261006c (bc paketindeki gibi). Diğerleri değişmedi.

## Çakışmalar ve çözümü
- **`index.html`** (tek gerçek çakışma): ses commit'i eski etiketleri (`20261005ae`) taşıyordu, bc yenilerini. bc tarafı alındı; yalnız `ses.js` → 20261006a ve `oyun.js` → 20261006d yapıldı.
- **`js/oyun.js`**: git otomatik birleştirdi, çakışma çıkmadı. İki taraf korundu: ses (düdük, sustur) ve bc (`yonKur`/`yonIlerle`, `fifaMod`, `fifaBas`/`fifaBirak`/`fifaKare`, `nisanIlerle`, `vur(zamanVerilen)`). İlk ses commit'i düdüğü `vurusUygula`'ya koyuyordu; ikinci commit onu `vurusHazirla`'ya taşıdı, böylece frikik basılı tutmada düdük çalmaz.
- Diğer dosyalarda çakışma yok.

## Test
Bkz. rapor. `tests/formalar.cjs` Windows'ta bu paketten önce de (`0f9bfc1`) aynı hatayla düşüyordu (`number must stay on opaque shirt`); bu birleşimle ilgisi yok. Gerçek iPhone/Safari, gerçek parmak ve telefon hoparlöründe denenmedi.
