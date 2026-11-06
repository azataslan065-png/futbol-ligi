package com.azat.saha;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.webkit.ConsoleMessage;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceResponse;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/* SAHA / Puan Tablosu / Admin APK kabuğu (2026-11-06). Sayfa GitHub Pages'ten canlı yüklenir: siteye atılan her sürüm
   uygulamaya kendiliğinden gelir, APK yalnızca kabuk değişince yenilenir. Tarayıcının WebView'da olmayan parçaları
   (indirme, paylaşma, ekran yönü, tam ekran, dosya seçme, mikrofon) burada karşılanır. */
public class Ana extends Activity {
    private static final String EV = "azataslan065-png.github.io";
    private static final int DOSYA = 11, IZIN = 12;
    private WebView w;
    private FrameLayout kok;
    private View tamEkran;
    private WebChromeClient.CustomViewCallback tamEkranGeri;
    private ValueCallback<Uri[]> dosyaGeri;
    private PermissionRequest bekleyenIzin;
    private final Handler h = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        Window pen = getWindow();
        if (BuildConfig.YATAY) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            pen.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            if (Build.VERSION.SDK_INT >= 28) pen.getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        kok = new FrameLayout(this);
        kok.setBackgroundColor(Color.parseColor("#0b0b14"));
        setContentView(kok);
        if (BuildConfig.YATAY) gizle();
        Teshis.baslat(this);
        Teshis.yaz("acilis", b != null ? "durum geri yüklendi" : "yeni", "");
        kur();
        w.loadUrl(BuildConfig.ADRES);      // (2026-11-06) restoreState kaldırıldı: sayfa her açılışta baştan yüklenir
    }

    private long yuklemeBas;
    private int bosDeneme;
    private void kur() {
        w = new WebView(this);
        w.setBackgroundColor(Color.parseColor("#0b0b14"));
        kok.addView(w, 0, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        WebSettings s = w.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(true);
        s.setAllowFileAccess(false);
        s.setTextZoom(100);                       // telefonun yazı boyutu sayfa düzenini bozmasın
        s.setSupportZoom(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setUserAgentString(s.getUserAgentString() + " SahaApp/" + BuildConfig.FLAVOR);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(w, true);
        w.addJavascriptInterface(new Kopru(), "SahaApp");

        w.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) { return disari(r.getUrl()); }
            @Override public void onPageStarted(WebView v, String u, android.graphics.Bitmap f) { yuklemeBas = System.currentTimeMillis(); Teshis.yaz("sayfa", "başladı", u); }
            @Override public void onPageFinished(WebView v, String u) {
                v.evaluateJavascript(YAMA, null);
                Teshis.yaz("sayfa", "bitti " + (System.currentTimeMillis() - yuklemeBas) + " ms", u);
                if (u != null && u.startsWith("http")) bosDenetle(v, 12000);
            }
            @Override public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                Teshis.yaz("ag-hata", e.getErrorCode() + " " + e.getDescription(), (r.isForMainFrame() ? "ANA " : "") + r.getUrl());
                if (r.isForMainFrame()) v.loadDataWithBaseURL(BuildConfig.ADRES, HATA, "text/html", "utf-8", null);
            }
            @Override public void onReceivedHttpError(WebView v, WebResourceRequest r, WebResourceResponse e) {
                if (r.isForMainFrame() || e.getStatusCode() >= 500) Teshis.yaz("http", String.valueOf(e.getStatusCode()), r.getUrl().toString());
            }
            @Override public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail d) {
                // Sayfa motoru çökerse (ya da arka planda sistem kapatırsa) uygulama kapanmaz, sayfa yeniden kurulur.
                Teshis.yaz("motor", d.didCrash() ? "çöktü" : "sistem kapattı", "");
                if (v == w) { kok.removeView(w); w.destroy(); w = null; kur(); w.loadUrl(BuildConfig.ADRES); }
                return true;
            }
        });
        w.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage m) {
                if (m.messageLevel() == ConsoleMessage.MessageLevel.ERROR) Teshis.yaz("konsol", m.message(), m.sourceId() + ":" + m.lineNumber());
                return false;
            }
            @Override public void onShowCustomView(View v, CustomViewCallback g) {
                if (tamEkran != null) { g.onCustomViewHidden(); return; }
                tamEkran = v; tamEkranGeri = g;
                kok.addView(v, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                gizle();
            }
            @Override public void onHideCustomView() { tamEkranKapat(); }
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> g, FileChooserParams p) {
                if (dosyaGeri != null) dosyaGeri.onReceiveValue(null);
                dosyaGeri = g;
                Intent i = p.createIntent();
                if (p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try { startActivityForResult(Intent.createChooser(i, "Dosya seç"), DOSYA); }
                catch (ActivityNotFoundException e) { dosyaGeri = null; return false; }
                return true;
            }
            @Override public void onPermissionRequest(PermissionRequest r) {
                h.post(() -> {
                    boolean ses = false;
                    for (String k : r.getResources()) if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(k)) ses = true;
                    if (ses && Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                        bekleyenIzin = r; requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, IZIN);
                    } else r.grant(r.getResources());
                });
            }
            @Override public boolean onCreateWindow(WebView v, boolean diyalog, boolean kullanici, android.os.Message m) {
                WebView gecici = new WebView(Ana.this);
                gecici.setWebViewClient(new WebViewClient() {
                    @Override public boolean shouldOverrideUrlLoading(WebView g, WebResourceRequest r) {
                        Uri u = r.getUrl();
                        if (!disari(u)) w.loadUrl(u.toString());
                        g.destroy(); return true;
                    }
                });
                ((WebView.WebViewTransport) m.obj).setWebView(gecici); m.sendToTarget();
                return true;
            }
        });
        w.setDownloadListener((url, ua, cd, tip, boy) -> {
            if (url.startsWith("blob:") || url.startsWith("data:")) return;   // bunları sayfadaki yama yakalar
            try {
                DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
                String ad = URLUtil.guessFileName(url, cd, tip);
                r.setMimeType(tip); r.addRequestHeader("User-Agent", ua);
                r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, ad);
                ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(r);
                Toast.makeText(this, "İndiriliyor: " + ad, Toast.LENGTH_SHORT).show();
            } catch (Exception e) { ac(Uri.parse(url)); }
        });
    }

    // Sayfa yüklendiği halde ekranda hiçbir şey yoksa kaydedilir ve bir kez yeniden yüklenir.
    private void bosDenetle(WebView v, long ms) {
        h.postDelayed(() -> {
            if (v != w || w == null) return;
            w.evaluateJavascript("(function(){try{var b=document.body;if(!b)return 'govde-yok';var n=0;document.querySelectorAll('body *').forEach(function(e){var r=e.getBoundingClientRect();if(r.width>40&&r.height>20&&getComputedStyle(e).visibility!=='hidden'&&+getComputedStyle(e).opacity>0.05&&r.bottom>0&&r.top<innerHeight)n++});return n+'|'+(b.innerText||'').trim().length+'|'+document.readyState+'|'+innerWidth+'x'+innerHeight}catch(e){return 'hata '+e}})()", r -> {
                Teshis.yaz("ekran", r, w == null ? "" : w.getUrl()); Teshis.gonder();
                String x = r == null ? "" : r.replace("\"", "");
                if ((x.startsWith("0|") || x.startsWith("govde")) && bosDeneme++ < 1) { Teshis.yaz("ekran", "boş: yeniden yükleniyor", ""); w.reload(); }
            });
        }, ms);
    }

    // true: uygulama dışında açılır (ya da hiç açılmaz)
    private boolean disari(Uri u) {
        String sema = u.getScheme() == null ? "" : u.getScheme(), ev = u.getHost() == null ? "" : u.getHost();
        if (("https".equals(sema) || "http".equals(sema)) && (ev.equals(EV) || ev.endsWith(".firebaseapp.com") || ev.endsWith(".web.app"))) return false;
        ac(u); return true;
    }
    private void ac(Uri u) {
        try {
            Intent i = "intent".equals(u.getScheme()) ? Intent.parseUri(u.toString(), Intent.URI_INTENT_SCHEME) : new Intent(Intent.ACTION_VIEW, u);
            i.addCategory(Intent.CATEGORY_BROWSABLE); i.setComponent(null); startActivity(i);
        } catch (Exception e) { Toast.makeText(this, "Bağlantı açılamadı", Toast.LENGTH_SHORT).show(); }
    }
    private void gizle() {
        kok.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }
    private void tamEkranKapat() {
        if (tamEkran == null) return;
        kok.removeView(tamEkran); tamEkran = null;
        if (tamEkranGeri != null) tamEkranGeri.onCustomViewHidden();
        tamEkranGeri = null;
        if (BuildConfig.YATAY) gizle(); else kok.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
    }
    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f && (BuildConfig.YATAY || tamEkran != null)) gizle(); }
    @Override public void onBackPressed() {
        if (tamEkran != null) { tamEkranKapat(); return; }
        // En başta geri: uygulama kapanmaz, arka plana alınır (tekrar açınca kaldığı yerden devam eder).
        if (w.canGoBack()) w.goBack(); else moveTaskToBack(true);
    }
    @Override protected void onResume() { super.onResume(); if (w != null) w.onResume(); Teshis.yaz("on-plan", "", w == null ? "" : w.getUrl()); if (w != null && w.getUrl() != null && w.getUrl().startsWith("http")) bosDenetle(w, 2500); }
    @Override protected void onDestroy() {
        Teshis.yaz("kapandi", isFinishing() ? "kullanıcı" : "sistem", ""); Teshis.gonder();
        if (w != null) { kok.removeView(w); w.destroy(); w = null; }   // eski sayfa arka planda açık kalmasın (iki oturum çakışırdı)
        super.onDestroy();
    }
    @Override protected void onActivityResult(int k, int s, Intent d) {
        if (k == DOSYA && dosyaGeri != null) {
            Uri[] sonuc = null;
            if (s == RESULT_OK && d != null) {
                if (d.getClipData() != null) {
                    sonuc = new Uri[d.getClipData().getItemCount()];
                    for (int i = 0; i < sonuc.length; i++) sonuc[i] = d.getClipData().getItemAt(i).getUri();
                } else if (d.getData() != null) sonuc = new Uri[]{d.getData()};
            }
            dosyaGeri.onReceiveValue(sonuc); dosyaGeri = null; return;
        }
        super.onActivityResult(k, s, d);
    }
    @Override public void onRequestPermissionsResult(int k, String[] p, int[] g) {
        if (k == IZIN && bekleyenIzin != null) {
            if (g.length > 0 && g[0] == PackageManager.PERMISSION_GRANTED) bekleyenIzin.grant(bekleyenIzin.getResources()); else bekleyenIzin.deny();
            bekleyenIzin = null;
        }
    }
    @Override protected void onPause() { super.onPause(); CookieManager.getInstance().flush(); Teshis.gonder(); }

    private class Kopru {
        @JavascriptInterface public void kaydet(String ad, String tip, String b64) {
            h.post(() -> {
                try {
                    byte[] veri = Base64.decode(b64, Base64.DEFAULT);
                    String a = (ad == null || ad.isEmpty()) ? "dosya" : ad.replaceAll("[\\\\/:*?\"<>|]", "_");
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues cv = new ContentValues();
                        cv.put(MediaStore.MediaColumns.DISPLAY_NAME, a);
                        cv.put(MediaStore.MediaColumns.MIME_TYPE, (tip == null || tip.isEmpty()) ? "application/octet-stream" : tip);
                        cv.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                        Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                        try (OutputStream o = getContentResolver().openOutputStream(u)) { o.write(veri); }
                    } else {
                        if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                            requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 13);
                            Toast.makeText(Ana.this, "Depolama izni verip tekrar dene", Toast.LENGTH_LONG).show(); return;
                        }
                        File f = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), a);
                        try (FileOutputStream o = new FileOutputStream(f)) { o.write(veri); }
                    }
                    Toast.makeText(Ana.this, "İndirilenler klasörüne kaydedildi: " + a, Toast.LENGTH_LONG).show();
                } catch (Exception e) { Toast.makeText(Ana.this, "Kaydedilemedi: " + e.getMessage(), Toast.LENGTH_LONG).show(); }
            });
        }
        @JavascriptInterface public void paylas(String baslik, String metin, String url) {
            h.post(() -> {
                Intent i = new Intent(Intent.ACTION_SEND); i.setType("text/plain");
                String m = ((metin == null ? "" : metin) + (url == null || url.isEmpty() ? "" : "\n" + url)).trim();
                i.putExtra(Intent.EXTRA_TEXT, m); if (baslik != null) i.putExtra(Intent.EXTRA_SUBJECT, baslik);
                try { startActivity(Intent.createChooser(i, "Paylaş")); } catch (Exception e) { }
            });
        }
        @JavascriptInterface public void yon(String y) {
            h.post(() -> {
                if (BuildConfig.YATAY && (y == null || !y.startsWith("portrait"))) { setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE); return; }
                int o = y == null ? ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                    : y.startsWith("landscape") ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
                    : y.startsWith("portrait") ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT : ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED;
                setRequestedOrientation(o);
            });
        }
        @JavascriptInterface public void titresim(int ms) {
            android.os.Vibrator v = (android.os.Vibrator) getSystemService(VIBRATOR_SERVICE);
            if (v != null) v.vibrate(Math.max(1, Math.min(2000, ms)));
        }
    }

    // Sayfaya eklenen küçük yama: blob/data indirmeleri, paylaşma, ekran yönü kilidi.
    private static final String YAMA = "(function(){if(window.__sahaApp)return;window.__sahaApp=1;var A=window.SahaApp;"
        + "function kaydet(h,ad){return fetch(h).then(function(r){return r.blob()}).then(function(b){return new Promise(function(ok){var f=new FileReader();f.onload=function(){A.kaydet(ad||'dosya',b.type||'',String(f.result).split(',')[1]||'');ok()};f.readAsDataURL(b)})})}"
        + "function ind(a){var h=a.href||'';if(a.hasAttribute('download')&&/^(blob|data):/.test(h)){kaydet(h,a.getAttribute('download'));return true}return false}"
        + "var oc=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(ind(this))return;return oc.apply(this,arguments)};"
        + "document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[download]');if(a&&ind(a)){e.preventDefault();e.stopPropagation()}},true);"
        + "navigator.share=function(d){d=d||{};A.paylas(d.title||'',d.text||'',d.url||'');return Promise.resolve()};"
        + "navigator.canShare=function(d){return !(d&&d.files&&d.files.length)};"
        + "try{if(screen.orientation){screen.orientation.lock=function(y){A.yon(String(y||''));return Promise.resolve()};screen.orientation.unlock=function(){A.yon('')}}}catch(e){}"
        + "navigator.vibrate=function(p){var m=Array.isArray(p)?p.reduce(function(s,x,i){return i%2?s:s+x},0):+p||0;if(m>0)A.titresim(m);return true};"
        + "})();";

    private static final String HATA = "<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'>"
        + "<body style='margin:0;background:#0b0b14;color:#e8f2ec;font:16px system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:0 24px;box-sizing:border-box'>"
        + "<div style='font-size:20px;font-weight:700;margin-bottom:8px'>Bağlantı yok</div><div style='color:#8fa89a;margin-bottom:20px'>İnternet bağlantını kontrol edip tekrar dene.</div>"
        + "<button onclick=\"location.replace('" + BuildConfig.ADRES + "')\" style='min-height:48px;padding:0 28px;border:0;border-radius:12px;background:#2e9a52;color:#fff;font:600 16px system-ui'>Tekrar dene</button></body>";
}
