package com.azat.saha;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONObject;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/* (2026-11-06) APK teşhis kaydı: açılış, sayfa yükleme, ağ/konsol hataları, sayfa motorunun çökmesi ve "ekran boş mu" denetimi.
   Anonim Firebase girişiyle test/diagnostics/logs'a yazılır (sayfaların kendi teşhis kayıtlarıyla aynı yer); kişisel veri yazılmaz. */
final class Teshis {
    private static final String ANAHTAR = "AIzaSyDzWf2yD0rlOUJCSHkHJg-JLvBssX1dNUY";
    private static final String DB = "https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/test/diagnostics/logs/";
    /* (2026-11-07) Olağan olaylar (açılış, sayfa yükleme, ekran ölçümü, geri tuşu, ön plana gelme, kapanış, güncelleme denetimi, maç
       performansı) artık ayrı yere yazılır: admin panelindeki "Hata yakalama kayıtları" listesini dolduruyor, gerçek hatalar aralarında
       kayboluyordu. Hata kayıtlarına (logs) yalnızca gerçek sorunlar gider. */
    private static final String DB_OLAY = "https://superlig-208e3-default-rtdb.europe-west1.firebasedatabase.app/test/diagnostics/apk/";
    private static final List<JSONObject> SIRA = new ArrayList<>();
    private static SharedPreferences sp;
    private static String ua = "", jeton = null, cihaz = "";
    private static long jetonSon = 0;
    private static boolean gidiyor = false;

    static void baslat(Context c) {
        sp = c.getSharedPreferences("teshis", Context.MODE_PRIVATE);
        cihaz = Build.MANUFACTURER + " " + Build.MODEL + " Android " + Build.VERSION.RELEASE;
        ua = "SahaApp/" + BuildConfig.FLAVOR + " " + BuildConfig.VERSION_NAME + " " + cihaz;
        try { ua += " WebView/" + android.webkit.WebView.getCurrentWebViewPackage().versionName; } catch (Throwable e) { }
        /* ÇÖKME KAYDI (2026-11-14-A, pazar cihaz denemeleri için): uygulama çökerse kayıt sırası bellekte kaybolurdu. Çökme anında hata ve son
           olaylar telefona (eşzamanlı) yazılır; bir sonraki açılışta teşhis kaydına gönderilir. */
        try {
            String c0 = sp.getString("cokme", null);
            if (c0 != null) { sp.edit().remove("cokme").commit(); yaz("cokme", c0, "önceki oturum"); }
            if (!(Thread.getDefaultUncaughtExceptionHandler() instanceof Yakala)) Thread.setDefaultUncaughtExceptionHandler(new Yakala(Thread.getDefaultUncaughtExceptionHandler()));
        } catch (Throwable e) { }
    }
    private static final class Yakala implements Thread.UncaughtExceptionHandler {
        private final Thread.UncaughtExceptionHandler once;
        Yakala(Thread.UncaughtExceptionHandler o) { once = o; }
        @Override public void uncaughtException(Thread t, Throwable e) {
            try {
                java.io.StringWriter sw = new java.io.StringWriter(); e.printStackTrace(new java.io.PrintWriter(sw));
                StringBuilder b = new StringBuilder(); b.append(t.getName()).append(": ").append(sw.toString().length() > 1500 ? sw.toString().substring(0, 1500) : sw.toString());
                synchronized (Teshis.class) { int n = SIRA.size(); for (int i = Math.max(0, n - 6); i < n; i++) b.append(" | ").append(SIRA.get(i).optString("title")).append(" ").append(SIRA.get(i).optString("detail")); }
                if (sp != null) sp.edit().putString("cokme", b.length() > 2500 ? b.substring(0, 2500) : b.toString()).commit();
            } catch (Throwable x) { }
            if (once != null) once.uncaughtException(t, e);
        }
    }
    /** Gerçek sorun: hata kayıtlarına. */
    static void yaz(String baslik, String ayrinti, String yer) { ekle(baslik, ayrinti, yer, false); }
    /** Olağan olay: ayrı olay kaydına (hata listesinde görünmez). */
    static void olay(String baslik, String ayrinti, String yer) { ekle(baslik, ayrinti, yer, true); }
    private static synchronized void ekle(String baslik, String ayrinti, String yer, boolean olagan) {
        try {
            JSONObject o = new JSONObject();
            o.put("app", "apk-" + BuildConfig.FLAVOR); o.put("mod", "apk"); o.put("kind", "olay"); o.put("title", baslik);
            o.put("detail", (ayrinti == null ? "" : ayrinti) + (yer == null || yer.isEmpty() ? "" : " @ " + yer));
            o.put("ts", System.currentTimeMillis()); o.put("ua", ua); if (olagan) o.put("_olay", true);
            if (SIRA.size() < 200) SIRA.add(o);
        } catch (Exception e) { }
        if (SIRA.size() >= 6) gonder();
    }
    static void gonder() {
        final List<JSONObject> L;
        synchronized (Teshis.class) { if (gidiyor || SIRA.isEmpty()) return; gidiyor = true; L = new ArrayList<>(SIRA); SIRA.clear(); }
        new Thread(() -> {
            try {
                String j = jeton();
                for (JSONObject o : L) {
                    String id = "apk_" + o.getLong("ts") + "_" + Integer.toHexString((int) (Math.random() * 0xffffff));
                    boolean olagan = o.optBoolean("_olay"); o.remove("_olay");
                    istek("PUT", (olagan ? DB_OLAY : DB) + id + ".json?auth=" + j, o.toString());
                }
            } catch (Exception e) { }
            synchronized (Teshis.class) { gidiyor = false; }
        }).start();
    }
    private static String jeton() throws Exception {
        if (jeton != null && System.currentTimeMillis() < jetonSon) return jeton;
        String yenile = sp.getString("yenile", null);
        JSONObject r = null;
        if (yenile != null) {
            try { r = new JSONObject(istek("POST", "https://securetoken.googleapis.com/v1/token?key=" + ANAHTAR, "{\"grant_type\":\"refresh_token\",\"refresh_token\":\"" + yenile + "\"}"));
                jeton = r.getString("id_token"); sp.edit().putString("yenile", r.getString("refresh_token")).apply(); }
            catch (Exception e) { r = null; }
        }
        if (r == null) {
            r = new JSONObject(istek("POST", "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + ANAHTAR, "{\"returnSecureToken\":true}"));
            jeton = r.getString("idToken"); sp.edit().putString("yenile", r.getString("refreshToken")).apply();
        }
        jetonSon = System.currentTimeMillis() + 50 * 60 * 1000;
        return jeton;
    }
    private static String istek(String yontem, String adres, String govde) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(adres).openConnection();
        c.setRequestMethod(yontem); c.setConnectTimeout(10000); c.setReadTimeout(10000);
        c.setRequestProperty("Content-Type", "application/json"); c.setRequestProperty("Referer", "https://azataslan065-png.github.io/futbol-ligi/test/"); c.setDoOutput(true);
        try (OutputStream o = c.getOutputStream()) { o.write(govde.getBytes("UTF-8")); }
        int k = c.getResponseCode();
        InputStream i = k < 400 ? c.getInputStream() : c.getErrorStream();
        byte[] b = new byte[65536]; int n; StringBuilder s = new StringBuilder();
        if (i != null) while ((n = i.read(b)) > 0) s.append(new String(b, 0, n, "UTF-8"));
        if (k >= 400) throw new Exception(k + " " + s);
        return s.toString();
    }
}
