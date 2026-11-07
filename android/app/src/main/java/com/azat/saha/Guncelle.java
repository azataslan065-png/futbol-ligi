package com.azat.saha;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/* UYGULAMA GÜNCELLEME SİSTEMİ (2026-11-07, kullanıcı: "kökteki puan tablosu ve admin paneline güncelleme sistemi ekle; kullanıcı v1.4.0
   sürümüne güncelleyebilsin; zorunluluk yok").
   Sayfalar siteden canlı yüklendiği için içerik güncellemesi zaten kendiliğinden gelir; bu sistem APK'nın KENDİSİNİ (kabuk, simge, yeni
   uygulama sürümü) yeniler. Açılışta (günde en çok bir kez, "Sonra" denince 24 saat sonra yeniden) APK sürümündeki surum.json okunur:
     { "<uygulama>": { "kod": derleme no, "ad": "1.4.0", "url": APK adresi, "not": "yenilikler", "zorunlu": false }, ... }
   Uzaktaki sürüm adı yüklü olandan farklı ve derleme numarası büyükse "Yeni sürüm" penceresi açılır: Güncelle → APK indirilir ve Android
   kurulum ekranı açılır (bilinmeyen kaynak izni yoksa ayar sayfasına yönlendirilir); Sonra → pencere kapanır. "zorunlu" yalnızca ileride
   gerekirse diye okunur: true ise "Sonra" düğmesi gösterilmez. Sayfa da SahaApp.guncellemeDenetle() ile elle denetletebilir. */
final class Guncelle {
    private static final String KAYNAK = "https://github.com/azataslan065-png/futbol-ligi/releases/download/apk/surum.json";
    private static final long GUN = 24L * 3600 * 1000;
    private static final Handler H = new Handler(Looper.getMainLooper());
    private static long indirmeNo = -1;

    static void denetle(final Activity a, final boolean elle) {
        final SharedPreferences sp = a.getSharedPreferences("guncelle", Context.MODE_PRIVATE);
        if (!elle && System.currentTimeMillis() - sp.getLong("son", 0) < GUN) return;
        new Thread(new Runnable() { public void run() {
            try {
                JSONObject kok = new JSONObject(oku(KAYNAK));
                final JSONObject j = kok.optJSONObject(BuildConfig.FLAVOR);
                if (j == null) { if (elle) mesaj(a, "Güncelleme bilgisi bulunamadı"); return; }
                PackageInfo pi = a.getPackageManager().getPackageInfo(a.getPackageName(), 0);
                long yerelKod = Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
                String yerelAd = pi.versionName == null ? "" : pi.versionName;
                final String ad = j.optString("ad", ""), url = j.optString("url", ""), not = j.optString("not", "");
                final boolean zorunlu = j.optBoolean("zorunlu", false);
                boolean yeni = j.optLong("kod", 0) > yerelKod && ad.length() > 0 && !ad.equals(yerelAd) && url.startsWith("https://");
                sp.edit().putLong("son", System.currentTimeMillis()).apply();
                Teshis.yaz("guncelle", (yeni ? "yeni " : "güncel ") + ad, yerelAd + " / " + yerelKod);
                if (!yeni) { if (elle) mesaj(a, "Uygulama güncel (v" + yerelAd + ")"); return; }
                H.post(new Runnable() { public void run() { sor(a, ad, url, not, zorunlu); } });
            } catch (Exception e) {
                Teshis.yaz("guncelle", "okunamadı", String.valueOf(e.getMessage()));
                if (elle) mesaj(a, "Güncelleme denetlenemedi, bağlantını kontrol et");
            }
        }}).start();
    }

    private static void sor(final Activity a, final String ad, final String url, String not, boolean zorunlu) {
        if (a.isFinishing()) return;
        AlertDialog.Builder b = new AlertDialog.Builder(a)
            .setTitle("Yeni sürüm: v" + ad)
            .setMessage((not.length() > 0 ? not + "\n\n" : "") + "Güncellemek ister misin? Girişin ve ayarların silinmez.")
            .setPositiveButton("Güncelle", (d, i) -> indir(a, ad, url))
            .setCancelable(!zorunlu);
        if (!zorunlu) b.setNegativeButton("Sonra", null);
        b.show();
    }

    private static void indir(final Activity a, String ad, final String url) {
        try {
            File klasor = a.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            final File apk = new File(klasor, BuildConfig.FLAVOR + "-" + ad + ".apk");
            if (apk.exists()) apk.delete();
            DownloadManager dm = (DownloadManager) a.getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url))
                .setTitle(a.getString(R.string.app_name) + " v" + ad)
                .setDescription("Güncelleme indiriliyor")
                .setMimeType("application/vnd.android.package-archive")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
                .setDestinationUri(Uri.fromFile(apk));
            indirmeNo = dm.enqueue(r);
            mesaj(a, "Güncelleme indiriliyor…");
            BroadcastReceiver bitti = new BroadcastReceiver() {
                @Override public void onReceive(Context c, Intent i) {
                    if (i.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -2) != indirmeNo) return;
                    try { a.unregisterReceiver(this); } catch (Exception e) {}
                    kur(a, apk, url);
                }
            };
            IntentFilter f = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
            if (Build.VERSION.SDK_INT >= 33) a.registerReceiver(bitti, f, Context.RECEIVER_EXPORTED);
            else a.registerReceiver(bitti, f);
        } catch (Exception e) {
            Teshis.yaz("guncelle", "indirilemedi", String.valueOf(e.getMessage()));
            tarayicida(a, url);
        }
    }

    private static void kur(Activity a, File apk, String url) {
        try {
            if (!apk.exists() || apk.length() < 10000) { mesaj(a, "İndirme tamamlanamadı"); tarayicida(a, url); return; }
            if (Build.VERSION.SDK_INT >= 26 && !a.getPackageManager().canRequestPackageInstalls()) {
                mesaj(a, "Kurulum için bu uygulamaya izin ver, sonra Güncelle'ye yeniden bas");
                a.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + a.getPackageName())));
                return;
            }
            Uri u = androidx_yok_dosya(a, apk);
            Intent i = new Intent(Intent.ACTION_VIEW).setDataAndType(u, "application/vnd.android.package-archive")
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            a.startActivity(i);
        } catch (Exception e) {
            Teshis.yaz("guncelle", "kurulamadı", String.valueOf(e.getMessage()));
            tarayicida(a, url);
        }
    }

    // Kendi dosya sağlayıcımız (Dosya.java): androidx bağımlılığı eklemeden APK'yı kurulum ekranına content:// ile verir.
    private static Uri androidx_yok_dosya(Activity a, File apk) {
        return Uri.parse("content://" + a.getPackageName() + ".dosya/" + Uri.encode(apk.getName()));
    }

    private static void tarayicida(Activity a, String url) {
        try { a.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); } catch (Exception e) {}
    }

    private static String oku(String adres) throws Exception {
        String u = adres;
        for (int i = 0; i < 5; i++) {
            HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection();
            c.setConnectTimeout(8000); c.setReadTimeout(8000); c.setInstanceFollowRedirects(false);
            c.setRequestProperty("Cache-Control", "no-cache");
            int k = c.getResponseCode();
            if (k >= 300 && k < 400) { u = new URL(new URL(u), c.getHeaderField("Location")).toString(); c.disconnect(); continue; }
            if (k != 200) throw new Exception("HTTP " + k);
            StringBuilder s = new StringBuilder();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), "UTF-8"))) { String l; while ((l = r.readLine()) != null) s.append(l); }
            return s.toString();
        }
        throw new Exception("çok fazla yönlendirme");
    }

    private static void mesaj(final Activity a, final String m) {
        H.post(new Runnable() { public void run() { Toast.makeText(a, m, Toast.LENGTH_LONG).show(); } });
    }
}
