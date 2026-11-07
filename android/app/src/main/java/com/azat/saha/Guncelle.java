package com.azat.saha;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/* UYGULAMA GÜNCELLEME SİSTEMİ (2026-11-07).
   İlk sürüm (kullanıcı: "kökteki puan tablosu ve admin paneline güncelleme sistemi ekle; zorunluluk yok"): açılışta, günde en çok bir kez,
   APK sürümündeki surum.json okunur; sürüm adı farklı ve derleme numarası büyükse güncelleme sunulur.
   (2026-11-07, kullanıcı: "güncelleme kartında başlık 'Uygulamanın Yeni Bir Sürümü Mevcut' olacak; içeriğinde güncelleme boyutu, sürüm
   numarası vb. bilgiler olacak; güncelleme kartı ekranında, güncelleme inerken uygulamaya giriş yapılmasın").
   Artık güncelleme küçük bir pencere değil, uygulamanın tamamını kaplayan bir ekran: uygulama adı, yüklü ve yeni sürüm, güncelleme boyutu,
   yayın tarihi, derleme numarası ve yenilikler. "Güncelle"ye basınca APK uygulamanın içinde indirilir (bildirim yok); ekran ilerleme
   çubuğuyla kalır, indirme bitene kadar geri tuşu ve arkadaki sayfa kapalıdır - uygulamaya girilemez. Bitince Android kurulum ekranı açılır
   (bilinmeyen kaynak izni yoksa önce o ayar). Kurulum iptal edilirse ekranda "Kur" ve "Sonra" kalır. "Sonra" ekranı kapatır, 24 saat sonra
   yeniden sorar. surum.json'da "zorunlu": true olursa "Sonra" gösterilmez (şimdilik hepsi false).
   ZORUNLU GÜNCELLEME (2026-11-07, kullanıcı: "güncelleme düşmedi; hem kökte hem testte güncelleme mevcutsa uygulama açılınca bu bilgi görünür,
   zorunlu güncelleme yapılır ve giriş sağlanır; güncelleme indirilmezse yeni özellikler görünmesin ve çalışmasın"). KÖK SEBEP ("düşmedi"):
   denetim günde en çok bir kez yapılıyordu ve açılıştan 5 sn sonra başlıyordu; aynı gün içinde çıkan sürüm ertesi güne kadar görünmüyordu.
   ŞİMDİ: her açılışta, sayfa kullanılmadan ÖNCE denetlenir (denetim bitene kadar "Sürüm denetleniyor" ekranı; bağlantı yoksa en çok 6 sn
   beklenir, sonra uygulama açılır). Uygulama arka plandan dönünce de 15 dk'da bir denetlenir. Güncelleme her zaman zorunludur: "Sonra"
   yoktur, geri tuşu uygulamayı kapatır; güncelleme kurulmadan uygulamaya girilemez, dolayısıyla eski sürümle yeni özellikler kullanılamaz. */
final class Guncelle {
    private static final String KAYNAK = "https://github.com/azataslan065-png/futbol-ligi/releases/download/apk/surum.json";
    private static final long ARALIK = 15L * 60 * 1000;   // arka plandan dönüşte denetim aralığı
    private static FrameLayout bekle;
    private static final Handler H = new Handler(Looper.getMainLooper());
    private static FrameLayout ekran;
    private static volatile boolean iniyor, denetiyor;
    /** Etkinlik kapanırken: ekran görünümleri o etkinliğe aittir, yeni açılışta yeniden kurulur. */
    static void sifirla(Activity a) { if (etkin == a) etkin = null; ekran = null; bekle = null; durum = null; cubuk = null; dugmeler = null; }
    /* Denetim sonucu, denetim süresince etkinlik yeniden kurulduysa (açılışta sistem bunu yapabiliyor; emülatör denemesinde görüldü: kart
       kapanmış eski etkinliğe ekleniyor, ekranda hiç görünmüyordu) her zaman o anda AÇIK olan etkinliğe gösterilir. */
    private static Activity etkin;
    private static Activity etkin() { Activity x = etkin; return (x == null || x.isFinishing() || (Build.VERSION.SDK_INT >= 17 && x.isDestroyed())) ? null : x; }

    /** Güncelleme ekranı açıkken geri tuşu: indirme sürüyorsa yutulur; değilse ("Sonra" varsa) ekran kapanır. true = geri tuşu işlendi. */
    static boolean geri(Activity a) {
        if (ekran == null) return false;
        if (iniyor) { Toast.makeText(a, "Güncelleme indiriliyor, lütfen bekle", Toast.LENGTH_SHORT).show(); return true; }
        a.finish(); return true;                                      // zorunlu güncelleme: geri tuşu uygulamayı kapatır
    }

    /** Açılışta: denetim bitene (ya da 6 sn dolana) kadar sayfanın üstünde "Sürüm denetleniyor" ekranı. */
    static void acilis(final Activity a) {
        etkin = a;
        if (ekran != null) return;
        bekleGoster(a);
        H.postDelayed(Guncelle::bekleKapat, 6000);
        denetle(a, false, true);
    }
    /** Arka plandan dönüşte: son denetimden 15 dk geçtiyse. */
    static void donus(Activity a) {
        SharedPreferences sp = a.getSharedPreferences("guncelle", Context.MODE_PRIVATE);
        etkin = a;
        if (ekran == null && System.currentTimeMillis() - sp.getLong("son", 0) > ARALIK) denetle(a, false, true);
    }
    static void denetle(final Activity a, final boolean elle) { denetle(a, elle, true); }
    private static void denetle(final Activity a, final boolean elle, boolean zorla) {
        final SharedPreferences sp = a.getSharedPreferences("guncelle", Context.MODE_PRIVATE);
        if (ekran != null) { H.post(Guncelle::bekleKapat); return; }
        if (denetiyor) return; denetiyor = true;
        new Thread(new Runnable() { public void run() {
            try {
                JSONObject kok = new JSONObject(oku(KAYNAK));
                final JSONObject j = kok.optJSONObject(BuildConfig.FLAVOR);
                if (j == null) { if (elle) mesaj(a, "Güncelleme bilgisi bulunamadı"); return; }
                PackageInfo pi = a.getPackageManager().getPackageInfo(a.getPackageName(), 0);
                long yerelKod = Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
                final String yerelAd = pi.versionName == null ? "" : pi.versionName;
                final String ad = j.optString("ad", ""), url = j.optString("url", "");
                boolean yeni = j.optLong("kod", 0) > yerelKod && ad.length() > 0 && !ad.equals(yerelAd) && url.startsWith("https://");
                sp.edit().putLong("son", System.currentTimeMillis()).apply();
                Teshis.olay("guncelle", (yeni ? "yeni " : "güncel ") + ad, yerelAd + " / " + yerelKod);
                if (!yeni) { H.post(Guncelle::bekleKapat); if (elle) mesaj(a, "Uygulama güncel (v" + yerelAd + ")"); return; }
                H.post(new Runnable() { public void run() { Activity x = etkin(); if (x != null) goster(x, j, yerelAd); bekleKapat(); } });
            } catch (Exception e) {
                H.post(Guncelle::bekleKapat);
                Teshis.yaz("guncelle", "okunamadı", String.valueOf(e.getMessage()));
                if (elle) mesaj(a, "Güncelleme denetlenemedi, bağlantını kontrol et");
            } finally { denetiyor = false; }
        }}).start();
    }

    // ---- Ekran ----
    private static int dp(Activity a, float v) { return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, a.getResources().getDisplayMetrics()); }
    private static TextView yazi(Activity a, String s, float boy, int renk, boolean kalin) {
        TextView t = new TextView(a); t.setText(s); t.setTextSize(TypedValue.COMPLEX_UNIT_SP, boy); t.setTextColor(renk);
        if (kalin) t.setTypeface(Typeface.DEFAULT_BOLD); return t;
    }
    private static GradientDrawable zemin(int renk, float yaricap, int kenar) {
        GradientDrawable g = new GradientDrawable(); g.setColor(renk); g.setCornerRadius(yaricap); if (kenar != 0) g.setStroke(2, kenar); return g;
    }
    private static String surumYazi(String s) { return s.startsWith("test.") ? "Test · derleme " + s.substring(5) : (s.matches("^1\\.0\\.\\d+$") ? "Test · derleme " + s.substring(4) : "v" + s); }
    private static String mb(long b) { return b <= 0 ? "bilinmiyor" : String.format(Locale.US, "%.1f MB", b / 1048576.0).replace('.', ','); }
    private static String tarih(long ms) { return ms <= 0 ? "" : new SimpleDateFormat("dd.MM.yyyy HH:mm", new Locale("tr")).format(new Date(ms)); }

    private static TextView durum; private static ProgressBar cubuk; private static LinearLayout dugmeler;

    private static void goster(final Activity a, final JSONObject j, String yerelAd) {
        if (a.isFinishing() || ekran != null) return;
        final String ad = j.optString("ad", ""), url = j.optString("url", ""), not = j.optString("not", "");
        final boolean zorunlu = true;                                // (2026-11-07) her güncelleme zorunlu
        final long boyut = j.optLong("boyut", 0), zaman = j.optLong("tarih", 0), kod = j.optLong("kod", 0);

        ekran = new FrameLayout(a);
        ekran.setTag(zorunlu);
        ekran.setBackgroundColor(Color.parseColor("#F00B0B14"));
        ekran.setClickable(true);                                  // dokunuşlar arkadaki sayfaya geçmez
        ekran.setFocusable(true);
        ScrollView kaydir = new ScrollView(a);
        kaydir.setFillViewport(true);
        LinearLayout dis = new LinearLayout(a); dis.setGravity(Gravity.CENTER); dis.setPadding(dp(a, 18), dp(a, 18), dp(a, 18), dp(a, 18));
        LinearLayout kart = new LinearLayout(a); kart.setOrientation(LinearLayout.VERTICAL);
        kart.setPadding(dp(a, 22), dp(a, 20), dp(a, 22), dp(a, 18));
        kart.setBackground(zemin(Color.parseColor("#1A1D2B"), dp(a, 18), Color.parseColor("#33FFFFFF")));
        LinearLayout.LayoutParams kp = new LinearLayout.LayoutParams(Math.min(dp(a, 440), a.getResources().getDisplayMetrics().widthPixels - dp(a, 36)), ViewGroup.LayoutParams.WRAP_CONTENT);
        dis.addView(kart, kp);
        kaydir.addView(dis, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        ekran.addView(kaydir, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        TextView bas = yazi(a, "Uygulamanın Yeni Bir Sürümü Mevcut", 19, Color.WHITE, true);
        bas.setGravity(Gravity.CENTER); kart.addView(bas);
        TextView alt = yazi(a, a.getString(R.string.app_name), 13, Color.parseColor("#9AA3B8"), false);
        alt.setGravity(Gravity.CENTER); alt.setPadding(0, dp(a, 4), 0, dp(a, 14)); kart.addView(alt);

        String[][] satir = {
            {"Yüklü sürüm", surumYazi(yerelAd)},
            {"Yeni sürüm", surumYazi(ad)},
            {"Güncelleme boyutu", mb(boyut)},
            {"Yayın tarihi", tarih(zaman)},
            {"Derleme numarası", kod > 0 ? String.valueOf(kod) : ""},
            {"Güncelleme türü", zorunlu ? "Zorunlu" : "İsteğe bağlı"}
        };
        for (String[] s : satir) {
            if (s[1].length() == 0) continue;
            LinearLayout r = new LinearLayout(a); r.setPadding(0, dp(a, 5), 0, dp(a, 5));
            TextView k = yazi(a, s[0], 14, Color.parseColor("#9AA3B8"), false);
            TextView v = yazi(a, s[1], 14, Color.WHITE, true); v.setGravity(Gravity.END);
            r.addView(k, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
            r.addView(v, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));
            kart.addView(r);
        }
        if (not.length() > 0) {
            TextView nb = yazi(a, "Yenilikler", 14, Color.parseColor("#9AA3B8"), false); nb.setPadding(0, dp(a, 12), 0, dp(a, 4)); kart.addView(nb);
            TextView nt = yazi(a, not, 14, Color.WHITE, false); nt.setLineSpacing(0, 1.25f); kart.addView(nt);
        }
        TextView bilgi = yazi(a, "Uygulamayı kullanmaya devam etmek için güncellemen gerekiyor. Girişin ve ayarların silinmez.", 12, Color.parseColor("#7C8499"), false);
        bilgi.setPadding(0, dp(a, 12), 0, dp(a, 10)); kart.addView(bilgi);

        cubuk = new ProgressBar(a, null, android.R.attr.progressBarStyleHorizontal);
        cubuk.setMax(1000); cubuk.setVisibility(View.GONE); kart.addView(cubuk, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(a, 10)));
        durum = yazi(a, "", 13, Color.WHITE, false); durum.setGravity(Gravity.CENTER); durum.setVisibility(View.GONE); durum.setPadding(0, dp(a, 6), 0, 0);
        kart.addView(durum);

        dugmeler = new LinearLayout(a); dugmeler.setPadding(0, dp(a, 12), 0, 0);
        kart.addView(dugmeler);
        dugmeleriKur(a, "Güncelle", url, ad, boyut, zorunlu);

        ((FrameLayout) a.findViewById(android.R.id.content)).addView(ekran, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        ekran.requestFocus();
    }

    private static Button dugme(Activity a, String s, boolean ana) {
        Button b = new Button(a); b.setText(s); b.setAllCaps(false); b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        b.setTypeface(Typeface.DEFAULT_BOLD); b.setTextColor(ana ? Color.parseColor("#0B0B14") : Color.WHITE);
        b.setBackground(zemin(ana ? Color.parseColor("#3FCF8E") : Color.parseColor("#262A3B"), 24, 0)); b.setMinHeight(dp(a, 46));
        return b;
    }
    private static void dugmeleriKur(final Activity a, String anaYazi, final String url, final String ad, final long boyut, boolean zorunlu) {
        dugmeler.removeAllViews();
        if (!zorunlu) {
            Button sonra = dugme(a, "Sonra", false);
            sonra.setOnClickListener(v -> kapat());
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1); p.setMargins(0, 0, dp(a, 8), 0);
            dugmeler.addView(sonra, p);
        }
        Button g = dugme(a, anaYazi, true);
        g.setOnClickListener(v -> indir(a, ad, url, boyut));
        dugmeler.addView(g, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
    }

    private static void kapat() {
        if (ekran == null || iniyor) return;
        ViewGroup p = (ViewGroup) ekran.getParent(); if (p != null) p.removeView(ekran);
        ekran = null; durum = null; cubuk = null; dugmeler = null;
    }

    // ---- Açılış denetim ekranı ----
    private static void bekleGoster(Activity a) {
        if (bekle != null || a.isFinishing()) return;
        bekle = new FrameLayout(a); bekle.setBackgroundColor(Color.parseColor("#0B0B14")); bekle.setClickable(true);
        LinearLayout ic = new LinearLayout(a); ic.setOrientation(LinearLayout.VERTICAL); ic.setGravity(Gravity.CENTER_HORIZONTAL);
        ProgressBar p = new ProgressBar(a); ic.addView(p, new LinearLayout.LayoutParams(dp(a, 40), dp(a, 40)));
        TextView t = yazi(a, "Sürüm denetleniyor…", 14, Color.parseColor("#9AA3B8"), false); t.setPadding(0, dp(a, 12), 0, 0); ic.addView(t);
        bekle.addView(ic, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER));
        ((FrameLayout) a.findViewById(android.R.id.content)).addView(bekle, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }
    private static void bekleKapat() {
        if (bekle == null) return; final View b = bekle; bekle = null;
        b.animate().alpha(0f).setDuration(150).withEndAction(() -> { ViewGroup p = (ViewGroup) b.getParent(); if (p != null) p.removeView(b); }).start();
    }

    // ---- İndirme ve kurulum ----
    private static void indir(final Activity a, final String ad, final String url, final long boyut) {
        if (iniyor) return;
        iniyor = true;
        dugmeler.setVisibility(View.GONE); cubuk.setVisibility(View.VISIBLE); durum.setVisibility(View.VISIBLE);
        cubuk.setProgress(0); durum.setText("İndiriliyor…");
        final File apk = new File(a.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), BuildConfig.FLAVOR + "-" + ad + ".apk");
        new Thread(new Runnable() { public void run() {
            boolean tamam = false; String hata = "";
            try {
                String u = url; HttpURLConnection c = null;
                for (int i = 0; i < 6; i++) {
                    c = (HttpURLConnection) new URL(u).openConnection(); c.setConnectTimeout(15000); c.setReadTimeout(20000); c.setInstanceFollowRedirects(false);
                    int k = c.getResponseCode();
                    if (k >= 300 && k < 400) { u = new URL(new URL(u), c.getHeaderField("Location")).toString(); c.disconnect(); continue; }
                    if (k != 200) throw new Exception("HTTP " + k);
                    break;
                }
                final long top = c.getContentLength() > 0 ? c.getContentLength() : boyut;
                File gecici = new File(apk.getPath() + ".iniyor");
                try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(gecici)) {
                    byte[] buf = new byte[64 * 1024]; long say = 0, sonBildir = 0; int n;
                    while ((n = in.read(buf)) > 0) {
                        out.write(buf, 0, n); say += n;
                        long simdi = System.currentTimeMillis();
                        if (simdi - sonBildir > 150) { sonBildir = simdi; final long s2 = say; H.post(() -> ilerleme(s2, top)); }
                    }
                }
                if (apk.exists()) apk.delete();
                if (!gecici.renameTo(apk)) throw new Exception("dosya yazılamadı");
                tamam = apk.length() > 10000;
            } catch (Exception e) { hata = String.valueOf(e.getMessage()); Teshis.yaz("guncelle", "indirilemedi", hata); }
            final boolean ok = tamam; final String h2 = hata;
            H.post(() -> {
                iniyor = false;
                if (ekran == null) return;
                cubuk.setVisibility(View.GONE); dugmeler.setVisibility(View.VISIBLE);
                if (!ok) { durum.setText("İndirme tamamlanamadı (" + h2 + "). Bağlantını kontrol edip yeniden dene."); dugmeleriKur(a, "Yeniden dene", url, ad, boyut, true); return; }
                durum.setText("İndirme tamamlandı. Kurulum ekranında \"Güncelle\"ye dokun.");
                dugmeleriKur(a, "Kur", "", ad, boyut, true);
                ((Button) dugmeler.getChildAt(dugmeler.getChildCount() - 1)).setOnClickListener(v -> kur(a, apk));
                kur(a, apk);
            });
        }}).start();
    }

    private static void ilerleme(long say, long top) {
        if (cubuk == null || durum == null) return;
        if (top > 0) { cubuk.setProgress((int) Math.min(1000, say * 1000 / top)); durum.setText("İndiriliyor… %" + Math.min(100, say * 100 / top) + "  (" + mb(say) + " / " + mb(top) + ")"); }
        else durum.setText("İndiriliyor… " + mb(say));
    }

    private static void kur(Activity a, File apk) {
        try {
            if (Build.VERSION.SDK_INT >= 26 && !a.getPackageManager().canRequestPackageInstalls()) {
                if (durum != null) durum.setText("Kurulum için bu uygulamaya izin ver, sonra \"Kur\"a dokun.");
                a.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + a.getPackageName())));
                return;
            }
            Uri u = Uri.parse("content://" + a.getPackageName() + ".dosya/" + Uri.encode(apk.getName()));
            a.startActivity(new Intent(Intent.ACTION_VIEW).setDataAndType(u, "application/vnd.android.package-archive")
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK));
        } catch (Exception e) {
            Teshis.yaz("guncelle", "kurulamadı", String.valueOf(e.getMessage()));
            if (durum != null) durum.setText("Kurulum açılamadı: " + e.getMessage());
        }
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
