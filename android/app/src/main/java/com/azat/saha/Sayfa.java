package com.azat.saha;

import android.content.Context;
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
    static void baslat(Context c) {
        baglam = c.getApplicationContext();
        try { Uri a = Uri.parse(BuildConfig.ADRES); ev = a.getHost(); yol = a.getPath(); } catch (Exception e) { }
    }
    static WebResourceResponse ver(WebResourceRequest r) {
        try {
            if (!BuildConfig.GOMULU || baglam == null || ev == null || !"GET".equalsIgnoreCase(r.getMethod())) return null;
            Uri u = r.getUrl();
            if (!ev.equals(u.getHost()) || yol == null || !yol.equals(u.getPath())) return null;
            Map<String, String> b = new HashMap<>(); b.put("Cache-Control", "no-store");
            return new WebResourceResponse("text/html", "utf-8", 200, "OK", b, baglam.getAssets().open("sayfa.html"));
        } catch (Exception e) { Teshis.yaz("sayfa", "gömülü sayfa açılamadı", String.valueOf(e.getMessage())); return null; }
    }
}
