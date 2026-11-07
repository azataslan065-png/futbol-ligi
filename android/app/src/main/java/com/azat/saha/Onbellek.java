package com.azat.saha;

import android.content.Context;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/* KALICI DOSYA ÖNBELLEĞİ (2026-11-07, kullanıcı: "oyun tarayıcıdan yüklendiği için ilgili ekranlar bazen geç yükleniyor; bu tür
   sorunlardan kurtulmak için APK sistemine geçtik"). KÖK SEBEP: sayfa her açılışta oyuncu modellerini (GLB), dokuları, sesleri ve kitaplık
   dosyalarını siteden yeniden istiyordu; tarayıcı önbelleği GitHub Pages'in 10 dakikalık süresi dolunca her dosyayı sunucuya yeniden
   soruyor, yavaş ya da kopuk bağlantıda ekranlar geç açılıyordu. Artık bu ağır, sık değişmeyen dosyalar telefonda kalıcı saklanır ve
   doğrudan diskten verilir; arka planda (en çok 2 saatte bir) siteden yenisi kontrol edilip bir sonraki açılış için güncellenir.
   Sayfanın kendisi (.html), veri (.json) ve sürüm numarası olmayan kod dosyaları önbelleğe ALINMAZ - güncellemeler eskisi gibi hemen gelir.
   Önbellek 400 MB'ı aşarsa en eski dosyalar silinir. Herhangi bir hata olursa istek normal yoldan (ağdan) yapılır. */
final class Onbellek {
    private static File klasor;
    private static final ExecutorService ARKA = Executors.newFixedThreadPool(2);
    private static final Map<String, Boolean> YENILENIYOR = new ConcurrentHashMap<>();
    private static final long TAZE = 2L * 3600 * 1000, SINIR = 400L * 1024 * 1024;

    static void baslat(Context c) {
        klasor = new File(c.getCacheDir(), "onbellek");
        if (!klasor.exists()) klasor.mkdirs();
        ARKA.execute(Onbellek::temizle);
    }

    private static String tur(String yol) {
        String y = yol.toLowerCase();
        if (y.endsWith(".glb")) return "model/gltf-binary";
        if (y.endsWith(".bin")) return "application/octet-stream";
        if (y.endsWith(".png")) return "image/png";
        if (y.endsWith(".jpg") || y.endsWith(".jpeg")) return "image/jpeg";
        if (y.endsWith(".webp")) return "image/webp";
        if (y.endsWith(".m4a")) return "audio/mp4";
        if (y.endsWith(".mp3")) return "audio/mpeg";
        if (y.endsWith(".ogg")) return "audio/ogg";
        if (y.endsWith(".woff2")) return "font/woff2";
        if (y.endsWith(".js")) return "application/javascript";
        if (y.endsWith(".css")) return "text/css";
        return null;
    }

    /** Önbelleğe uygun mu: GET, bizim site ya da bilinen kitaplık sunucusu, ağır/sabit dosya türü. Ses ve video aralık isteği hariç. */
    private static boolean uygun(WebResourceRequest r) {
        if (klasor == null || !"GET".equalsIgnoreCase(r.getMethod())) return false;
        Uri u = r.getUrl(); String h = u.getHost(), p = u.getPath();
        if (h == null || p == null || !"https".equals(u.getScheme())) return false;
        boolean site = h.equals("azataslan065-png.github.io"), kitaplik = h.equals("cdnjs.cloudflare.com") || h.equals("cdn.jsdelivr.net") || h.equals("unpkg.com");
        if (!site && !kitaplik) return false;
        String t = tur(p); if (t == null) return false;
        Map<String, String> bas = r.getRequestHeaders();
        if (bas != null) for (String k : bas.keySet()) if ("range".equalsIgnoreCase(k)) return false;
        boolean kod = t.endsWith("javascript") || t.equals("text/css");
        if (kod && site && u.getQueryParameter("v") == null) return false;   // sürümsüz kod dosyası: her zaman siteden
        return true;
    }

    private static File dosya(String url) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1"); byte[] b = md.digest(url.getBytes("UTF-8"));
            StringBuilder s = new StringBuilder(); for (byte x : b) s.append(String.format("%02x", x));
            return new File(klasor, s.toString());
        } catch (Exception e) { return null; }
    }

    static WebResourceResponse ver(WebResourceRequest r) {
        try {
            if (!uygun(r)) return null;
            final String url = r.getUrl().toString();
            final File f = dosya(url); if (f == null) return null;
            if (!f.exists() || f.length() == 0) { if (!indir(url, f)) return null; }
            else if (System.currentTimeMillis() - f.lastModified() > TAZE && YENILENIYOR.putIfAbsent(url, Boolean.TRUE) == null)
                ARKA.execute(() -> { try { indir(url, f); } finally { YENILENIYOR.remove(url); } });
            Map<String, String> bas = new HashMap<>();
            bas.put("Access-Control-Allow-Origin", "*");
            bas.put("Cache-Control", "no-cache");
            InputStream in = new FileInputStream(f);
            return new WebResourceResponse(tur(r.getUrl().getPath()), null, 200, "OK", bas, in);
        } catch (Exception e) { return null; }
    }

    /** Dosyayı indirir; yalnızca tam inen dosya eskisinin yerine geçer. */
    private static boolean indir(String adres, File hedef) {
        File gecici = new File(hedef.getPath() + ".i" + Thread.currentThread().getId());
        try {
            String u = adres; HttpURLConnection c = null;
            for (int i = 0; i < 5; i++) {
                c = (HttpURLConnection) new URL(u).openConnection(); c.setConnectTimeout(10000); c.setReadTimeout(20000); c.setInstanceFollowRedirects(false);
                int k = c.getResponseCode();
                if (k >= 300 && k < 400) { u = new URL(new URL(u), c.getHeaderField("Location")).toString(); c.disconnect(); continue; }
                if (k != 200) { c.disconnect(); return false; }
                break;
            }
            long beklenen = c.getContentLengthLong(), say = 0;
            try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(gecici)) {
                byte[] b = new byte[64 * 1024]; int n; while ((n = in.read(b)) > 0) { out.write(b, 0, n); say += n; }
            }
            if (say == 0 || (beklenen > 0 && say != beklenen)) { gecici.delete(); return false; }
            if (hedef.exists()) hedef.delete();
            return gecici.renameTo(hedef);
        } catch (Exception e) { gecici.delete(); return false; }
    }

    private static void temizle() {
        try {
            File[] l = klasor.listFiles(); if (l == null) return;
            long top = 0; for (File f : l) { if (f.getName().contains(".i")) { f.delete(); continue; } top += f.length(); }
            if (top <= SINIR) return;
            java.util.Arrays.sort(l, (x, y) -> Long.compare(x.lastModified(), y.lastModified()));
            for (File f : l) { if (top <= SINIR * 3 / 4) break; if (!f.exists()) continue; top -= f.length(); f.delete(); }
        } catch (Exception e) {}
    }
}
