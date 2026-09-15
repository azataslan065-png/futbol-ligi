# SAHA ↔ Puan Tablosu Entegrasyonu — Veri Şeması ve Kurallar

Sürüm: taslak 1 · Hazırlanma tarihi: 2026-09-14

Bu belge, oyuncuların kendi takımıyla maç oynadığı ve transfer ekonomisi olan
yapının veri şemasını tanımlar. Kod yazmadan önce buradaki kararların
onaylanması gerekir — şema değişikliği sonradan veri taşıma anlamına gelir.

---

## 1. Temel karar: oyun puan tablosuna DOKUNMAZ

Oyun sonucu doğrudan `matches` dalına yazmaz. Kendi alanına yazar, Puan
Tablosu oradan okur.

**Sebep:** Kullanıcı kendi cihazında oynuyor. Tarayıcıdaki kodu değiştirip
istediği skoru gönderebilir. `matches` yalnızca yöneticiye açık kalırsa,
hile yapılsa bile puan tablosu bozulmaz; yönetici düzeltir.

---

## 2. Şema

### 2.1 Kullanıcılar

```
kullanicilar/{uid}
  ad            : "AZAT"
  takimId       : "t3"              hangi takımın sahibi
  durum         : "bekliyor"|"onayli"   yönetici onayı (bkz. 2.4)
  para          : 250               saha lirası
  kadro:                            MAÇ KADROSU - en fazla 18 kişi
    ilk11       : [oyuncuId x11]    sıra = diziliş sırası (0 kaleci)
    yedek       : [oyuncuId x0-7]
  kayitTs       : 1789...
```

**SAHİPLİK ile MAÇ KADROSU ayrı şeylerdir.** Kullanıcı sınırsız oyuncu
satın alabilir; sahip olduğu oyuncular `oyuncuHavuzu` içinde `sahip: {uid}`
ile bellidir. `kadro` ise yalnızca o maça çıkacak 18 kişiyi seçer.

Bu ayrım olmadan "sınırsız alım" ile "18 kişilik kadro" kuralları
çelişirdi: ya alım sınırlanır ya kadro şişerdi.

Kadro doğrulaması (maça girerken):
- `ilk11` tam 11 kişi, biri kaleci mevkisinde
- `yedek` en fazla 7 kişi
- hepsinin `sahip` alanı bu kullanıcı olmalı
- aynı oyuncu iki listede olamaz

`para` alanına kullanıcı **yazamaz**. Kazanç maç sonucundan, harcama satın
alma işleminden hesaplanır (bkz. 4).

### 2.2 Oyuncu havuzu

Tüm oyuncular tek yerde. Kimin elinde olduğu `sahip` alanıyla belli.

```
oyuncuHavuzu/{oyuncuId}
  ad            : "Kerem Yıldız"
  mevki         : "SF"              KL/STP/SGB/SLB/GO/DOS/OOS/SGK/SLK/SF/GF
  guc           : 34                1-99 arası genel güç
  hiz, sut, pas : 0.95 / 1.10 / 0.92
  sahip         : "{uid}" | null    null = havuzda, satışta olabilir
  baslangic     : true|false        başlangıç kadrosundan mı geldi
  alisFiyat     : 0                 kullanıcının ödediği (başlangıçta 0)
  satista       : true|false        yönetici satışa sundu mu
  fiyat         : 180               yöneticinin belirlediği fiyat
  macSayisi     : 0                 performans için
  puanToplam    : 0                 performans için
```

**`baslangic` alanı kritik:** Bu oyuncular satılınca gelir getirmez
(kullanıcı kararı). Ayrı bir bayrak olmadan, satın alınmış oyuncudan
ayırt edilemezdi.

### 2.3 Canlı maç

```
canliMac/{macId}
  homeUid, awayUid
  homeGoals, awayGoals
  olaylar       : [{type,min,player,player2,team}]
  stats         : { home:{...}, away:{...} }
  guncelTs      : 1789...
  bitti         : true|false
```

İleride canlı izleme için eklenecek dal (şemayı bozmaz):

```
canliMac/{macId}/konum
  top           : [x, z]
  oyuncular     : [[x,z,takim], ...]
```

Saniyede birkaç kez yazılır, maç bitince silinir.

---

## 3. Güvenlik kuralları

```
kullanicilar/{uid}
  .read   : auth != null
  .write  : auth.uid == uid
            && !data.child('para').exists()      // para alanına dokunulamaz
            && !newData.child('para').exists()

oyuncuHavuzu/{id}
  .read   : auth != null
  .write  : yalnızca yönetici

canliMac/{macId}
  .read   : auth != null
  .write  : auth != null
            && root.child('matches/'+macId+'/canli').val() == true
            && (root.child('kullanicilar/'+auth.uid+'/takimId').val()
                  == root.child('matches/'+macId+'/homeId').val()
                || root.child('kullanicilar/'+auth.uid+'/takimId').val()
                  == root.child('matches/'+macId+'/awayId').val())

matches/{macId}
  .write  : yalnızca yönetici
```

Üç koruma birden:
- Maç canlı değilse yazılamaz → **aynı maç ikinci kez oynanamaz**
- Başkasının maçına yazılamaz
- Puan tablosuna yalnızca yönetici dokunur

---

## 4. Ekonomi

### 4.1 Kazanç

| Sonuç | Saha lirası |
|---|---|
| Galibiyet | 50 |
| Beraberlik | 10 |
| Yenilgi | 0 |

Değerler `globalAdminSettings/ekonomi` altında tutulur, yönetici değiştirir.

**Kazanç yönetici tarafında işlenir** — maç sonucu onaylanırken. Kullanıcı
tarafında hesaplanırsa, kodu değiştirip istediği parayı yazabilir.

### 4.2 Satın alma

Yönetici oyuncuyu satışa sunar ve fiyatı belirler; istediği zaman değiştirir.

Satın alma işlemi **tek adımda** yapılmalı (atomik): para düşer ve `sahip`
atanır. Ayrı ayrı yapılırsa, arada bağlantı koparsa para gider oyuncu gelmez.

```
Kontroller (sunucu tarafında):
  - satista == true
  - sahip == null
  - kullanicilar/{uid}/para >= fiyat
```

**Alım sınırı YOKTUR** (kullanıcı kararı). Sahip olunan oyuncu sayısı
serbest; sınır yalnızca maç kadrosundadır (18). Kullanıcı 40 oyuncuya
sahip olup her maç farklı 18'ini seçebilir.

### 4.3 Satış fiyatı

**Başlangıç oyuncusu** (`baslangic: true`) → satılabilir, **gelir 0**.
Kadrodan çıkarma yolu, para kaynağı değil.

**Satın alınan oyuncu** → fiyat sistem tarafından hesaplanır:

```
ortalamaPuan = puanToplam / macSayisi        (Puan Tablosu'ndaki 1.1-10.0 ölçeği)
carpan       = 0.5 + (ortalamaPuan - 5.0) * 0.16
satisFiyat   = round(alisFiyat * clamp(carpan, 0.4, 1.6))
```

| Ortalama puan | Çarpan | 200 liralık oyuncu |
|---|---|---|
| 8.0 | 0.98 → 1.0 civarı | ~196 |
| 7.0 | 0.82 | ~164 |
| 6.0 | 0.66 | ~132 |
| 5.0 | 0.50 | ~100 |

**Not:** Çarpan 1.0'ı ancak çok iyi performansla geçer. Amaç kâr değil,
zararı azaltmak — transfer bir yatırım riski olmalı, kazanç kapısı değil.
Değerler tartışmaya açık; oynanışta test edilmeli.

`ortalamaPuan` Puan Tablosu'nun `ptOyuncuPuani` işlevinden gelir. Ayrı bir
performans ölçümü kurulmaz — iki sistem ayrışırsa aynı oyuncu iki yerde
farklı değerlendirilir.

### 4.4 Başlangıç kadrosu

11 ilk 11 + birkaç yedek, hepsi **30-40 güç** aralığında rastgele.
`baslangic: true`, `alisFiyat: 0`.

---

### 2.4 Kayıt ve onay

Kullanıcı kaydolurken takımını **kendi seçer**. Kayıt `durum: "bekliyor"`
ile açılır; yönetici onaylayınca `"onayli"` olur.

**Sebep:** İki kullanıcı aynı takımı seçebilir. Onay adımı olmadan aynı
takımın iki sahibi olur ve fikstürde hangisinin oynayacağı belirsizleşir.

Onay bekleyen kullanıcı maça giremez; kural `durum == "onayli"` şartını
arar.

---

## 5. Kadro kilidi

Maç `canli` iken kullanıcı kadro değiştiremez ve oyuncu alamaz.

**Sebep:** Yenilen kullanıcı devre arasında daha iyi oyuncu alıp takımını
güçlendirebilirdi.

---

## 6. Uygulama sırası

Her adım tek başına çalışır durumda bırakılmalı; yarım bırakılan bir adım
diğerlerini bloke etmemeli.

1. **Yönetici: oyuncu havuzu ekranı** — oyuncu ekleme, güç/mevki/fiyat,
   satışa sunma. Ekonomi ayarları (50/10/0).
2. **Kullanıcı kaydı ve başlangıç kadrosu** — takım seçimi, 30-40 güçlü
   rastgele kadro üretimi.
3. **Transfer ekranı** — satıştaki oyuncular, satın alma, satış.
4. **Oyun ↔ fikstür bağlantısı** — canlı maça girme, `canliMac`'a yazma.
5. **Sonuç işleme** — yönetici onayı, `matches`'a yazma, kazanç dağıtımı.
6. *(sonra)* Canlı izleme ve 2D anlatım.

---

## Onaylanan kararlar

- Satış çarpanı aralığı **0.4 - 1.6** · onaylandı
- Maç kadrosu **11 + 7 = 18** · onaylandı
- Satın alma sınırı **yok** · kullanıcı sınırsız oyuncuya sahip olabilir
- Takımı **kullanıcı seçer**, yönetici onaylar
