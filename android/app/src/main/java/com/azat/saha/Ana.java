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
import android.database.ContentObserver;
import android.media.AudioManager;
import android.provider.Settings;
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
        Onbellek.baslat(this);   // (2026-11-07) bkz. Onbellek
        Sayfa.baslat(this);      // (2026-11-07) bkz. Sayfa
        etkinAna = this;
        /* CİHAZ SESİ (2026-11-08, kullanıcı: "TV izlerken ekran kapatıldığında arka planda oynatmaya devam edecek APK için ses kontrolünün cihazın
           kendi sesiyle entegre edilmesi gerekiyor"). Ses tuşları uygulamada her zaman MEDYA sesini değiştirir (zil sesini değil); TV oynatıcısının ses
           çubuğu ve kumandadaki ses düğmeleri cihazın medya sesini ayarlar, cihaz sesi tuşlarla değişince sayfadaki çubuk da güncellenir (bkz. sesGozcu). */
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        try { getContentResolver().registerContentObserver(Settings.System.CONTENT_URI, true, sesGozcu); } catch (Exception e) { }
        Teshis.olay("acilis", b != null ? "durum geri yüklendi" : "yeni", "");
        kur();
        // (2026-11-07) Sayfa, etkinlik penceresi kurulduktan sonra yüklenir (bkz. SAYFA BEKÇİSİ).
        h.post(() -> { if (w != null) { basladi = false; w.loadUrl(BuildConfig.ADRES); bekciKur(); } });   // (2026-11-06) sayfa her açılışta baştan yüklenir
        Guncelle.acilis(this);   // (2026-11-07) her açılışta, sayfa kullanılmadan önce zorunlu güncelleme denetimi (bkz. Guncelle)
    }

    private long yuklemeBas;
    /* SAYFA BEKÇİSİ (2026-11-07, kullanıcı: "üç uygulamada güncelleme sonrası girişte bu ekranda [boş, koyu] takılı kalıyor"). Teşhiste sayfa
       yüklenmeye hiç başlamamıştı. Sayfa 12 sn içinde yüklenmezse durum ayrıntısıyla kaydedilir ve sayfa uygulamanın içindeki kopyası
       yerine siteden açılır (kullanıcı boş ekranda kalmaz). Kayıtlar beklemeden gönderilir: uygulama takılıp kapatılsa da kaybolmaz. */
    /* (2026-11-07, 2. düzeltme) Teşhis: telefonda (Android 17, WebView 158) açılıştaki İLK yükleme isteği, sayfa siteden istendiğinde de
       hiç başlamıyordu (ilerleme %10, "başladı" yok); aynı istek birkaç saniye sonra yeniden verilince hemen açılıyordu. Bu yüzden sayfa
       3 sn içinde yüklenmeye başlamazsa istek yenilenir (en çok 3 kez); ikinci denemede de olmazsa uygulamanın içindeki kopya yerine site kullanılır. */
    private volatile boolean basladi;
    private int bekciDeneme;
    private final Runnable bekci = this::bekciCalis;
    private void bekciCalis() {
        if (w == null || basladi || sayfaHazir || isFinishing()) return;
        bekciDeneme++;
        Teshis.yaz("sayfa", "3 sn'de başlamadı, yeniden isteniyor (deneme " + bekciDeneme + ", ilerleme %" + w.getProgress() + ", gömülü=" + Sayfa.acik() + ")", BuildConfig.ADRES);
        Teshis.gonder();
        if (bekciDeneme >= 2 && Sayfa.acik()) Sayfa.kapat();
        if (bekciDeneme > 3) return;
        w.stopLoading(); w.loadUrl(BuildConfig.ADRES); h.postDelayed(bekci, 3000);
    }
    private void bekciKur() { h.removeCallbacks(bekci); bekciDeneme = 0; h.postDelayed(bekci, 3000); }
    private boolean sayfaHazir;
    // Uygulamanın kendi kaynakları: site, veritabanı/giriş, kitaplık sunucuları, ses/müzik deposu.
    private static boolean bizim(Uri u) {
        String h = u == null || u.getHost() == null ? "" : u.getHost();
        return h.equals(EV) || h.endsWith(".firebaseio.com") || h.endsWith(".firebasedatabase.app") || h.endsWith(".googleapis.com") || h.equals("www.gstatic.com")
            || h.equals("cdnjs.cloudflare.com") || h.equals("cdn.jsdelivr.net") || h.equals("unpkg.com") || h.endsWith(".supabase.co");
    }
    private static boolean bizimKaynak(String kaynak) { try { return kaynak == null || kaynak.isEmpty() || bizim(Uri.parse(kaynak)); } catch (Exception e) { return true; } }
    private int bosDeneme;
    private void kur() {
        // Arka planda oynatma sürerken sayfa motoru ekran kapalıyken de pencereyi görünür sayar (bkz. Arka): görünmez sayarsa videoyu durdurur.
        w = new WebView(this) {
            @Override protected void onWindowVisibilityChanged(int v) { super.onWindowVisibilityChanged(arkaOynat && v != View.VISIBLE ? View.VISIBLE : v); }
        };
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
        /* (2026-11-07, kullanıcı: "maç oynanırken ekran sekiyor"). KÖK SEBEP (kabuk tarafı): Android 12+ WebView'da sayfanın kenarına
           dayanan sürükleme (ör. yön çubuğu kenara itilince) tüm sayfayı "esneterek" geri sektiriyordu (overscroll stretch). Kapatıldı;
           kaydırma çubukları da gizli. Sayfa motoru "önemli" öncelikte çalışır: sistem bellek sıkışınca önce onu kapatmaz. */
        w.setOverScrollMode(View.OVER_SCROLL_NEVER);
        w.setVerticalScrollBarEnabled(false); w.setHorizontalScrollBarEnabled(false);
        if (Build.VERSION.SDK_INT >= 26) w.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);
        try {
            android.webkit.ServiceWorkerController.getInstance().setServiceWorkerClient(new android.webkit.ServiceWorkerClient() {
                @Override public WebResourceResponse shouldInterceptRequest(WebResourceRequest r) { WebResourceResponse x = Sayfa.ver(r); if (x == null) x = Reklam.ver(r); return x != null ? x : Onbellek.ver(r); }
            });
        } catch (Exception e) { Teshis.yaz("onbellek", "servis çalışanı bağlanamadı", String.valueOf(e.getMessage())); }

        w.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) { return disari(r.getUrl()); }
            @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) { WebResourceResponse x = Sayfa.ver(r); if (x == null) x = Reklam.ver(r); return x != null ? x : Onbellek.ver(r); }
            @Override public void onPageStarted(WebView v, String u, android.graphics.Bitmap f) { yuklemeBas = System.currentTimeMillis(); sayfaHazir = false; basladi = true; Teshis.olay("sayfa", "başladı" + (Sayfa.acik() ? " (gömülü)" : ""), u); Teshis.gonder(); }
            @Override public void onPageFinished(WebView v, String u) {
                v.evaluateJavascript(YAMA, null);
                sayfaHazir = true;
                if (yuklemeBas > 0) { Teshis.olay("sayfa", "bitti " + (System.currentTimeMillis() - yuklemeBas) + " ms", u);
                    yuklemeBas = 0; if (u != null && u.startsWith("http")) bosDenetle(v, 12000); }
            }
            @Override public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                // (2026-11-07) Yalnızca ana sayfa ya da uygulamanın kendi kaynakları (site, veritabanı, kitaplıklar, ses dosyaları) kaydedilir.
                // Reklam/izleme sunucuları (telefonun reklam engelleyicisi ya da özel DNS'i kapatır) ve YouTube video akışı hata değildir.
                if (r.isForMainFrame() || bizim(r.getUrl())) Teshis.yaz("ag-hata", e.getErrorCode() + " " + e.getDescription(), (r.isForMainFrame() ? "ANA " : "") + r.getUrl());
                if (r.isForMainFrame()) v.loadDataWithBaseURL(BuildConfig.ADRES, HATA, "text/html", "utf-8", null);
            }
            @Override public void onReceivedHttpError(WebView v, WebResourceRequest r, WebResourceResponse e) {
                if (r.isForMainFrame() || (e.getStatusCode() >= 500 && bizim(r.getUrl()))) Teshis.yaz("http", String.valueOf(e.getStatusCode()), r.getUrl().toString());
            }
            @Override public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail d) {
                // Sayfa motoru çökerse (ya da arka planda sistem kapatırsa) uygulama kapanmaz, sayfa yeniden kurulur.
                Teshis.yaz("motor", d.didCrash() ? "çöktü" : "sistem kapattı", "");
                if (v == w) { kok.removeView(w); w.destroy(); w = null; kur(); w.loadUrl(BuildConfig.ADRES); bekciKur(); }
                return true;
            }
        });
        w.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage m) {
                // (2026-11-07) Gömülü YouTube oynatıcısının ve reCAPTCHA'nın kendi iç uyarıları (accelerometer, requestStorageAccess…) bizim hatamız değil.
                if (m.messageLevel() == ConsoleMessage.MessageLevel.ERROR && bizimKaynak(m.sourceId())) Teshis.yaz("konsol", m.message(), m.sourceId() + ":" + m.lineNumber());
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
    private Runnable bekleyenDenetim;
    private void bosDenetle(WebView v, long ms) {
        if (bekleyenDenetim != null) h.removeCallbacks(bekleyenDenetim);
        h.postDelayed(bekleyenDenetim = () -> { bekleyenDenetim = null;
            if (v != w || w == null) return;
            w.evaluateJavascript("(function(){try{var b=document.body;if(!b)return 'govde-yok';var n=0;document.querySelectorAll('body *').forEach(function(e){var r=e.getBoundingClientRect();if(r.width>40&&r.height>20&&getComputedStyle(e).visibility!=='hidden'&&+getComputedStyle(e).opacity>0.05&&r.bottom>0&&r.top<innerHeight)n++});return n+'|'+(b.innerText||'').trim().length+'|'+document.readyState+'|'+innerWidth+'x'+innerHeight}catch(e){return 'hata '+e}})()", r -> {
                String x = r == null ? "" : r.replace("\"", "");
                boolean bos = x.startsWith("0|") || x.startsWith("govde");
                if (bos) Teshis.yaz("ekran", "boş " + x, w == null ? "" : w.getUrl()); else Teshis.olay("ekran", x, w == null ? "" : w.getUrl());
                Teshis.gonder();
                if (bos && bosDeneme++ < 1) w.reload();
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
    /* GERİ TUŞU (2026-11-07, kullanıcı: "telefonun kendi geri tuşları daha stabil çalışsın"). KÖK SEBEP: geri tuşu WebView geçmişine
       (goBack) gidiyordu; Puan Tablosu ve Admin geri tuşunu geçmişe konan 10'luk "tampon" kayıtlarla yakalıyor, SAHA hiç yakalamıyordu -
       tampon tükenince ya da SAHA'da tek basışta sayfa geçmişten geri gidiyor / uygulama arka plana atılıyordu. Artık geri tuşu önce sayfaya
       sorulur (window.__appGeri): sayfa en üstteki pencereyi/menüyü kapatır ya da önceki ekrana döner (true); gidecek yer kalmadıysa (false)
       çıkış onayı açılır. Sayfa bu işlevi tanımlamıyorsa (ör. hata sayfası) eski davranış: geçmişte geri, yoksa çıkış onayı. */
    private boolean geriBekliyor;
    @Override public void onBackPressed() {
        if (tamEkran != null) { tamEkranKapat(); return; }
        if (Guncelle.geri(this)) return;   // güncelleme ekranı açıkken (indirme sürerken uygulamaya geçilmez)
        if (Cikis.acik()) { Cikis.kapat(); return; }
        if (w == null) { super.onBackPressed(); return; }
        if (geriBekliyor) return;
        geriBekliyor = true;
        h.postDelayed(new Runnable() { public void run() { geriBekliyor = false; } }, 1500);
        w.evaluateJavascript("(function(){try{return window.__appGeri?(window.__appGeri()?'evet':'hayir'):'yok';}catch(e){return 'hata';}})()", new ValueCallback<String>() {
            @Override public void onReceiveValue(String r) {
                geriBekliyor = false;
                String v = r == null ? "" : r.replace("\"", "");
                Teshis.olay("geri", v, w == null ? "" : w.getUrl());
                if ("evet".equals(v)) return;
                if (!"hayir".equals(v) && w != null && w.canGoBack()) { w.goBack(); return; }
                cikisSor();
            }
        });
    }
    private void cikisSor() { Cikis.goster(this); }   // (2026-11-07) uygulamanın kendi görünümünde çıkış penceresi (bkz. Cikis)
    @Override protected void onResume() { super.onResume(); if (Build.VERSION.SDK_INT < 24 || !isInPictureInPictureMode()) pipIdi = false; if (w != null) w.onResume(); Teshis.olay("on-plan", "", w == null ? "" : w.getUrl()); Guncelle.donus(this);
        // (2026-11-07) KÖK SEBEP ("ekran boş: yeniden yükleniyor" yanlış alarmı): uygulama yeni açılırken de bu denetim 2,5 sn sonra çalışıyordu;
        // sayfa o an henüz yüklenmeye başlamamıştı (boş ölçüldü) ve sayfa gereksiz yere baştan yükleniyordu. Artık yalnızca yüklenmiş sayfaya bakılır.
        if (w != null && sayfaHazir && w.getUrl() != null && w.getUrl().startsWith("http")) bosDenetle(w, 2500); }
    @Override protected void onDestroy() {
        Teshis.olay("kapandi", isFinishing() ? "kullanıcı" : "sistem", ""); Teshis.gonder(); h.removeCallbacks(bekci); Guncelle.sifirla(this); if (etkinAna == this) { etkinAna = null; arkaOynat = false; Arka.durdur(this); }
        try { getContentResolver().unregisterContentObserver(sesGozcu); } catch (Exception e) { }
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

    /* EKRAN KAYDI (2026-11-13-I, kullanıcı: "telefonun kendi ekran kaydı başlıyor fakat belli bir süre sonra reddediyor veya kaydetmiyor; maç oynanırken
       ve diğer durumlarda da"). Ekran kaydı telefonun video kodlayıcısını ve belleğini uygulamayla paylaşır; oyun ağır çizerken sistem kaydediciyi
       durdurabilir ya da bellek için kapatabilir. Uygulama artık (Android 15+) ekranının kaydedildiğini algılar ve sayfaya bildirir: sayfa bu sürede
       hafif çizime geçer (bkz. saha.html __appEkranKaydi). Sistem bellek uyarıları da teşhis kaydına yazılır ve sayfaya iletilir. */
    private java.util.function.Consumer<Integer> kayitGozcu;
    private boolean ekranKaydiVar;
    private void ekranKaydi(boolean v) {
        if (v == ekranKaydiVar) return; ekranKaydiVar = v;
        Teshis.olay("ekran-kaydi", v ? "başladı" : "bitti", ""); Teshis.gonder();
        if (w != null) w.evaluateJavascript("try{window.__appEkranKaydi&&window.__appEkranKaydi(" + v + ")}catch(e){}", null);
    }
    @Override protected void onStart() {
        super.onStart();
        if (Build.VERSION.SDK_INT >= 35) {
            try {
                if (kayitGozcu == null) kayitGozcu = d -> h.post(() -> ekranKaydi(d == WindowManager.SCREEN_RECORDING_STATE_VISIBLE));
                int ilk = getWindowManager().addScreenRecordingCallback(getMainExecutor(), kayitGozcu);
                ekranKaydi(ilk == WindowManager.SCREEN_RECORDING_STATE_VISIBLE);
            } catch (Throwable e) { Teshis.yaz("ekran-kaydi", "izlenemiyor", String.valueOf(e.getMessage())); }
        }
    }
    @Override public void onTrimMemory(int seviye) {
        super.onTrimMemory(seviye);
        Teshis.olay("bellek", "uyarı " + seviye + (ekranKaydiVar ? " (ekran kaydı açık)" : ""), ""); Teshis.gonder();
        if (w != null && seviye >= 10 && seviye < 20) w.evaluateJavascript("try{window.__appBellek&&window.__appBellek(" + seviye + ")}catch(e){}", null);
    }

    /* PENCERE İÇİNDE PENCERE (2026-11-07, kullanıcı: "TV sekmesinde APK için pencere içinde pencere modu çalışmıyor"). KÖK SEBEP: TV oynatıcısının
       PiP düğmesi tarayıcının video PiP'ini (requestPictureInPicture) çağırıyordu; uygulamanın sayfa motoru (WebView) bunu desteklemez, YouTube
       gibi gömülü oynatıcılarda ise tarayıcıda da hiç çalışmaz. Artık uygulamanın KENDİSİ küçük pencereye geçer (Android PiP): sayfa yayını
       pencereyi kaplayacak şekilde düzenler, düğmeler gizlenir; pencere büyütülünce her şey eski hâline döner. Yayın oynarken ana ekrana
       çıkılırsa da kendiliğinden küçük pencereye geçer. Küçük pencere kapatılınca yayın durur (arka planda ses çalmaya devam etmez). */
    private volatile boolean pipHazir;
    // ---- Cihaz sesi (medya) ----
    static int sesYuzde(android.content.Context c) {
        try { AudioManager am = (AudioManager) c.getSystemService(AUDIO_SERVICE); int m = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            return m <= 0 ? 0 : Math.round(am.getStreamVolume(AudioManager.STREAM_MUSIC) * 100f / m); } catch (Exception e) { return -1; }
    }
    private int sonSes = -2;
    private final ContentObserver sesGozcu = new ContentObserver(new Handler(Looper.getMainLooper())) {
        @Override public void onChange(boolean k) { sesBildir(); }
    };
    void sesBildir() {
        int y = sesYuzde(this); if (y == sonSes || y < 0) return; sonSes = y;
        if (w != null) w.evaluateJavascript("try{window.__appSesDegisti&&window.__appSesDegisti(" + y + ")}catch(e){}", null);
    }
    // ---- Arka planda oynatma (bkz. Arka) ----
    static Ana etkinAna;
    private volatile boolean arkaOynat;
    private boolean bildirimSoruldu;
    private final Runnable arkaKapat = () -> { arkaOynat = false; Arka.durdur(this); };
    /** TV yayını oynuyor/durdu. Durunca hizmet hemen kapanmaz (2 dk): sıradaki videoya geçerken kısa duraklamalarda arka planda yeniden başlatmak gerekmesin. */
    private void arkaAyarla(boolean oynuyor) {
        h.removeCallbacks(arkaKapat);
        Arka.durum(oynuyor);
        if (!oynuyor) { if (arkaOynat) h.postDelayed(arkaKapat, 120000); return; }
        if (arkaOynat) return;
        arkaOynat = true; Teshis.olay("arka", "yayın başladı: arka plan hizmeti açılıyor", "");
        // (2026-11-08-F) bildirim izni artık istenmez: arka plan bildirimi hiç görünmesin (bkz. Arka)
        Arka.baslat(this);
    }
    /** Kilit ekranı / bildirim medya denetimindeki "Oynat". */
    /** Kilit ekranı / bildirim medya denetimindeki "Duraklat": yayın duraklar, hizmet "Oynat" ile sürdürülebilsin diye bir süre açık kalır (bkz. arkaAyarla). */
    static void tvDuraklat() {
        final Ana a = etkinAna; if (a == null) return;
        a.h.post(() -> { if (a.w != null) a.w.evaluateJavascript("try{window.__appTvDurdur&&window.__appTvDurdur()}catch(e){}", null); });
    }
    static void tvOynat() {
        final Ana a = etkinAna; if (a == null) return;
        a.h.post(() -> { if (a.w != null) a.w.evaluateJavascript("try{window.__appTvOynat&&window.__appTvOynat()}catch(e){}", null); });
    }
    /** Bildirimdeki "Durdur". */
    static void tvDurdur() {
        final Ana a = etkinAna; if (a == null) return;
        a.h.post(() -> { if (a.w != null) a.w.evaluateJavascript("try{window.__appTvDurdur&&window.__appTvDurdur()}catch(e){}", null); a.h.removeCallbacks(a.arkaKapat); a.arkaOynat = false; });
    }
    private boolean pipIdi;
    private boolean pipDestek() { return Build.VERSION.SDK_INT >= 26 && getPackageManager().hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE); }
    private android.app.PictureInPictureParams pipAyar() {
        android.app.PictureInPictureParams.Builder b = new android.app.PictureInPictureParams.Builder().setAspectRatio(new android.util.Rational(16, 9));
        if (Build.VERSION.SDK_INT >= 31) b.setAutoEnterEnabled(pipHazir).setSeamlessResizeEnabled(false);
        return b.build();
    }
    private boolean pipGir() {
        try { if (!pipDestek() || isFinishing()) return false; pipIdi = true; return enterPictureInPictureMode(pipAyar()); }
        catch (Exception e) { Teshis.yaz("pip", "açılamadı", String.valueOf(e.getMessage())); return false; }
    }
    @Override protected void onUserLeaveHint() { super.onUserLeaveHint(); if (pipHazir && Build.VERSION.SDK_INT >= 26 && Build.VERSION.SDK_INT < 31) pipGir(); }
    @Override public void onPictureInPictureModeChanged(boolean acik, android.content.res.Configuration c) {
        super.onPictureInPictureModeChanged(acik, c);
        if (acik) pipIdi = true;
        if (w != null) w.evaluateJavascript("try{window.__appPipDurum&&window.__appPipDurum(" + acik + ")}catch(e){}", null);
        if (!acik && BuildConfig.YATAY) gizle();
    }
    @Override protected void onStop() {
        super.onStop();
        if (Build.VERSION.SDK_INT >= 35 && kayitGozcu != null) { try { getWindowManager().removeScreenRecordingCallback(kayitGozcu); } catch (Throwable e) { } }
        Teshis.olay("arka", "görünmez oldu (arka=" + arkaOynat + ", pip=" + pipIdi + ", pipModu=" + (Build.VERSION.SDK_INT >= 24 && isInPictureInPictureMode()) + ")", ""); Teshis.gonder();
        // Küçük pencere kapatıldı (X ya da aşağı kaydırma): etkinlik görünmez oldu - yayın durdurulur. Küçük pencere AÇIKKEN ekran kapatılırsa da
        // onStop gelir; o zaman pencere hâlâ açıktır (isInPictureInPictureMode) ve yayın DURDURULMAZ (2026-11-07, "arka plan yine duruyor").
        if (pipIdi && w != null && !(Build.VERSION.SDK_INT >= 24 && isInPictureInPictureMode())) { pipIdi = false; w.evaluateJavascript("try{window.__appPipKapandi&&window.__appPipKapandi()}catch(e){}", null); }
    }

    private class Kopru {
        /* (2026-11-07) Sayfanın "Uygulamadan çık → Evet" düğmesi window.close() çağırır; WebView'da bu hiçbir şey yapmıyor, sayfa
           "Tarayıcıdan çıkılamıyor" uyarısı gösteriyordu (kök sürümdeki sayfalar). window.close artık uygulamayı kapatır. */
        // (2026-11-07) Sayfadan elle güncelleme denetimi ve yüklü uygulama sürümü (bkz. Guncelle).
        @JavascriptInterface public void guncellemeDenetle() { h.post(new Runnable() { public void run() { Guncelle.denetle(Ana.this, true); } }); }
        @JavascriptInterface public String surum() { try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return ""; } }
        @JavascriptInterface public void teshis(String tur, String ayrinti) { String t = String.valueOf(tur); if (t.contains("hata")) Teshis.yaz(t, String.valueOf(ayrinti), BuildConfig.ADRES); else Teshis.olay(t, String.valueOf(ayrinti), BuildConfig.ADRES); }
        @JavascriptInterface public int kabuk() { return 3; }   // kabuk kuşağı: 2 = zorunlu güncelleme, 3 = sayfa uygulamaya gömülü (güncelleme yalnızca uygulamadan)
        @JavascriptInterface public boolean pip() { if (!pipDestek()) return false; h.post(new Runnable() { public void run() { pipGir(); } }); return true; }
        @JavascriptInterface public void pipHazir(boolean v) { pipHazir = v; h.post(() -> arkaAyarla(v)); if (Build.VERSION.SDK_INT >= 31 && pipDestek()) h.post(new Runnable() { public void run() { try { setPictureInPictureParams(pipAyar()); } catch (Exception e) { } } }); }
        @JavascriptInterface public int sesAl() { return sesYuzde(Ana.this); }
        /** Cihazın medya sesini yüzde olarak ayarlar (0-100). Döner: ayarlanan gerçek yüzde (cihazın ses adımlarına yuvarlanır). */
        @JavascriptInterface public int sesAyarla(int y) {
            try { AudioManager am = (AudioManager) getSystemService(AUDIO_SERVICE); int m = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                int i = Math.max(0, Math.min(m, Math.round(Math.max(0, Math.min(100, y)) * m / 100f)));
                if (y > 0 && i == 0) i = 1;
                if (i > 0 && am.isStreamMute(AudioManager.STREAM_MUSIC)) am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_UNMUTE, 0);
                if (am.getStreamVolume(AudioManager.STREAM_MUSIC) != i) am.setStreamVolume(AudioManager.STREAM_MUSIC, i, 0);
            } catch (Exception e) { Teshis.yaz("ses", "ayarlanamadı", String.valueOf(e.getMessage())); }
            int g = sesYuzde(Ana.this); sonSes = g; return g;
        }
        /** Ses artır/azalt düğmesi: cihazın kendi ses adımıyla bir adım (ses tuşuyla aynı). Döner: yeni yüzde. */
        @JavascriptInterface public int sesAdim(int yon) {
            try { AudioManager am = (AudioManager) getSystemService(AUDIO_SERVICE);
                am.adjustStreamVolume(AudioManager.STREAM_MUSIC, yon > 0 ? AudioManager.ADJUST_RAISE : AudioManager.ADJUST_LOWER, 0);
            } catch (Exception e) { }
            int g = sesYuzde(Ana.this); sonSes = g; return g;
        }
        @JavascriptInterface public void cik() { h.post(new Runnable() { public void run() { finish(); } }); }
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
        + "window.close=function(){try{A.cik()}catch(e){}};"
        + "navigator.vibrate=function(p){var m=Array.isArray(p)?p.reduce(function(s,x,i){return i%2?s:s+x},0):+p||0;if(m>0)A.titresim(m);return true};"
        + "})();";

    private static final String HATA = "<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'>"
        + "<body style='margin:0;background:#0b0b14;color:#e8f2ec;font:16px system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:0 24px;box-sizing:border-box'>"
        + "<div style='font-size:20px;font-weight:700;margin-bottom:8px'>Bağlantı yok</div><div style='color:#8fa89a;margin-bottom:20px'>İnternet bağlantını kontrol edip tekrar dene.</div>"
        + "<button onclick=\"location.replace('" + BuildConfig.ADRES + "')\" style='min-height:48px;padding:0 28px;border:0;border-radius:12px;background:#2e9a52;color:#fff;font:600 16px system-ui'>Tekrar dene</button></body>";
}
