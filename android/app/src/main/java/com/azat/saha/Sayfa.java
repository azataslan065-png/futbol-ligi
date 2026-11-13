package com.azat.saha;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import java.util.HashMap;
import java.util.Map;

/* UYGULAMAYA GÖMÜLÜ SAYFA (2026-11-07, kullanıcı: "güncelleme indirilmezse yeni özellikler görünmesin ve çalışmasın"; güncelleme kartında
   "Yüklü Sürüm: 2026-11-07-J / Gereken Sürüm: 2026-11-07-K"). KÖK SEBEP: uygulama sayfayı her açılışta siteden alıyordu; siteye yüklenen her
   yenilik, uygulama güncellenmese de hemen görünüyordu - uygulamanın "sürümü" anlamsızdı. ŞİMDİ test uygulamalarında sayfa (saha.html,
   index.html, admin.html) APK'nın İÇİNDEDİR: derlenirken o anki dosya gömülür, uygulama sayfayı her zaman kendi kopyasından açar. Sürüm adı
   sayfanın sürüm damgasıdır (APP_BUILD). Yeni sayfa ancak güncelleme kurulunca gelir. Adres aynı kaldığı için giriş, ayarlar, veritabanı ve
   önbellek eskisi gibi çalışır; ortak dosyalar (ortak.js, modeller, sesler) siteden gelmeye devam eder. Kök uygulamalarda sayfa siteden açılır. */
final class Sayfa {
    private static Context baglam;
    private static String ev, yol;
    private static volatile boolean kapali, ilk = true;
    /* SİTEDEN AÇILIŞ (2026-11-14-E, kullanıcı: "zorunlu güncelleme kapalıyken en son sürüm kullanılacak, açıkken zorunlu olacak"). Admin anahtarı
       kapalıysa (sayfanın bildirdiği son durum, bkz. Guncelle.ayar) sayfa uygulamanın içindeki kopya yerine siteden açılır: kullanıcı güncelleme
       ekranı görmeden her zaman en son sürümü kullanır. Oturum içinde sitede daha yeni sürüm çıkarsa sayfa uygun anda siteden yenilenir
       (bkz. ortak.js SESSİZ GÜNCELLEME). Site açılamazsa (internet yok) içerideki kopya kullanılır. */
    private static volatile boolean site;
    static boolean siteModu() { return site; }
    static void siteAc() { site = true; }
    static void siteKapat() { site = false; }
    static boolean acik() { return BuildConfig.GOMULU && !kapali && !site; }
    static boolean verildi() { return !ilk; }
    /* (2026-11-07) Telefonda (Android 17, WebView 158) gömülü kopya verildiği halde sayfa motoru yüklemeye başlamadı (teşhis: ilerleme %10,
       "başladı" yok); emülatörde sorun yok. Gömülü kopya bu cihazda bir kez açılamazsa, bu sürüm için hatırlanır ve sonraki açılışlarda
       hiç beklemeden siteden açılır - kullanıcı her girişte beklemez. */
    static void kapat() { kapali = true; try { baglam.getSharedPreferences("sayfa", Context.MODE_PRIVATE).edit().putLong("bozuk", BuildConfig.VERSION_CODE).apply(); } catch (Exception e) { } }
    private static byte[] veri;
    static void baslat(Context c) {
        baglam = c.getApplicationContext();
        try { if (baglam.getSharedPreferences("sayfa", Context.MODE_PRIVATE).getLong("bozuk", -1) == BuildConfig.VERSION_CODE) kapali = true; } catch (Exception e) { }
        try { SharedPreferences g = baglam.getSharedPreferences("guncelle", Context.MODE_PRIVATE); if (g.contains("zorunlu") && !g.getBoolean("zorunlu", true)) site = true; } catch (Exception e) { }
        // Sayfa önceden belleğe okunur: yanıt tek parça, uzunluğu belli olarak verilir (akış okuma gecikmesi/takılması olmaz).
        if (BuildConfig.GOMULU && !kapali) new Thread(() -> oku()).start();
        try { Uri a = Uri.parse(BuildConfig.ADRES); ev = a.getHost(); yol = a.getPath(); } catch (Exception e) { }
    }
    private static synchronized byte[] oku() {
        if (veri != null) return veri;
        try (java.io.InputStream in = baglam.getAssets().open("sayfa.html"); java.io.ByteArrayOutputStream o = new java.io.ByteArrayOutputStream(3 << 20)) {
            byte[] t = new byte[65536]; int n; while ((n = in.read(t)) > 0) o.write(t, 0, n); veri = o.toByteArray();
        } catch (Exception e) { Teshis.yaz("sayfa", "gömülü sayfa okunamadı", String.valueOf(e.getMessage())); }
        return veri;
    }
    static WebResourceResponse ver(WebResourceRequest r) {
        try {
            if (!acik() || baglam == null || ev == null || !"GET".equalsIgnoreCase(r.getMethod())) return null;
            Uri u = r.getUrl();
            if (!ev.equals(u.getHost()) || yol == null || !yol.equals(u.getPath())) return null;
            byte[] d = oku(); if (d == null) return null;
            Map<String, String> b = new HashMap<>(); b.put("Cache-Control", "no-store"); b.put("Content-Type", "text/html; charset=utf-8"); b.put("Content-Length", String.valueOf(d.length));
            WebResourceResponse x = new WebResourceResponse("text/html", "utf-8", 200, "OK", b, new java.io.ByteArrayInputStream(d));
            if (ilk) { ilk = false; Teshis.olay("sayfa", "gömülü kopya verildi (" + Thread.currentThread().getName() + ")", u.toString()); }
            return x;
        } catch (Exception e) { Teshis.yaz("sayfa", "gömülü sayfa açılamadı", String.valueOf(e.getMessage())); return null; }
    }
}
