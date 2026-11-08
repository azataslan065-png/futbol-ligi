package com.azat.saha;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/* ARKA PLANDA OYNATMA (2026-11-07, kullanıcı: "TV için arka planda oynatma çalışmıyor; ekran kapatıldığında yayın duruyor"). KÖK SEBEP: ekran
   kapanınca (ya da uygulamadan çıkılınca) sayfa motoru sayfayı "görünmez" sayıp videoyu durduruyor, Android da arka plandaki uygulamayı
   bir süre sonra donduruyordu. ŞİMDİ TV'de yayın oynarken: (1) bu ön plan hizmeti çalışır - bildirim çubuğunda "yayın oynatılıyor" görünür,
   telefon uyusa da işlemci ve kablosuz bağlantı açık kalır, uygulama dondurulmaz; (2) sayfa motoruna ekran kapalıyken de sayfanın görünür
   olduğu söylenir (bkz. Ana), video ve YouTube durmaz. Bildirimdeki "Durdur" yayını duraklatır; yayın durunca hizmet kendiliğinden kapanır.

   CİHAZ SESİYLE BÜTÜNLEŞME (2026-11-08, kullanıcı: "ekran kapatıldığında arka planda oynatmaya devam edecek APK için ses kontrolünün cihazın
   kendi sesiyle entegre edilmesi gerekiyor"). KÖK SEBEP: hizmet yalnızca düz bir bildirim gösteriyordu; Android'e "medya çalıyor" diye bir
   MEDYA OTURUMU bildirilmiyordu. Ekran kapalıyken ya da kilit ekranındayken ses tuşları bu yüzden çoğu cihazda medya sesini değil zil/bildirim
   sesini değiştiriyordu, kilit ekranında yayın denetimi de yoktu. Artık yayın oynarken etkin bir medya oturumu açılır: ses tuşları ekran kapalıyken
   de MEDYA sesini değiştirir, kilit ekranı ve bildirim alanında medya denetimi (Duraklat/Oynat, Durdur) görünür, Bluetooth kulaklık düğmeleri
   de çalışır. Uygulama içindeki ses çubuğu da cihazın medya sesini ayarlar (bkz. Ana sesAyarla / sesGozcu). */
public class Arka extends Service {
    static final String DURDUR = "com.azat.saha.ARKA_DURDUR";
    static final String DURAKLAT = "com.azat.saha.ARKA_DURAKLAT";
    static final String OYNAT = "com.azat.saha.ARKA_OYNAT";
    private static Arka etkin;
    private static boolean oynuyor = true;
    private PowerManager.WakeLock kilit;
    private WifiManager.WifiLock ag;
    private MediaSession oturum;

    static void baslat(Context c) {
        oynuyor = true;
        try { Intent i = new Intent(c, Arka.class); if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i); }
        catch (Exception e) { Teshis.yaz("arka", "başlatılamadı", String.valueOf(e.getMessage())); }
    }
    static void durdur(Context c) { try { c.stopService(new Intent(c, Arka.class)); } catch (Exception e) { } }
    /** Sayfa yayının oynadığını/durduğunu bildirdi (bkz. Ana.arkaAyarla): oturum durumu ve bildirim düğmesi güncellenir. */
    static void durum(boolean o) {
        oynuyor = o; final Arka a = etkin; if (a == null) return;
        try { a.durumYaz(); a.bildirimGoster(); } catch (Exception e) { }
    }

    private void oturumKur() {
        if (oturum != null) return;
        try {
            oturum = new MediaSession(this, "saha-tv");
            oturum.setCallback(new MediaSession.Callback() {
                @Override public void onPlay() { Ana.tvOynat(); durum(true); }
                @Override public void onPause() { Ana.tvDuraklat(); durum(false); }
                @Override public void onStop() { Ana.tvDurdur(); stopSelf(); }
            });
            oturum.setPlaybackToLocal(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MOVIE).build());
            int bay = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
            oturum.setSessionActivity(PendingIntent.getActivity(this, 1, new Intent(this, Ana.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), bay));
            oturum.setMetadata(new MediaMetadata.Builder().putString(MediaMetadata.METADATA_KEY_TITLE, "TV yayını")
                .putString(MediaMetadata.METADATA_KEY_ARTIST, getString(R.string.app_name)).build());
            durumYaz();
            oturum.setActive(true);
        } catch (Exception e) { Teshis.yaz("arka", "medya oturumu açılamadı", String.valueOf(e.getMessage())); oturum = null; }
    }
    private void durumYaz() {
        if (oturum == null) return;
        oturum.setPlaybackState(new PlaybackState.Builder()
            .setActions(PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE | PlaybackState.ACTION_PLAY_PAUSE | PlaybackState.ACTION_STOP)
            .setState(oynuyor ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED, PlaybackState.PLAYBACK_POSITION_UNKNOWN, oynuyor ? 1f : 0f).build());
    }
    private Notification bildirim() {
        String kanal = "yayin";
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(kanal) == null) {
            NotificationChannel k = new NotificationChannel(kanal, "Arka planda yayın", NotificationManager.IMPORTANCE_LOW);
            k.setShowBadge(false); nm.createNotificationChannel(k);
        }
        int bay = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        PendingIntent ac = PendingIntent.getActivity(this, 1, new Intent(this, Ana.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), bay);
        PendingIntent dur = PendingIntent.getService(this, 2, new Intent(this, Arka.class).setAction(DURDUR), bay);
        PendingIntent oyn = PendingIntent.getService(this, 3, new Intent(this, Arka.class).setAction(oynuyor ? DURAKLAT : OYNAT), bay);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, kanal) : new Notification.Builder(this);
        b.setSmallIcon(oynuyor ? android.R.drawable.ic_media_play : android.R.drawable.ic_media_pause).setContentTitle(getString(R.string.app_name))
         .setContentText(oynuyor ? "TV yayını arka planda oynatılıyor" : "TV yayını duraklatıldı").setContentIntent(ac).setOngoing(true)
         .setVisibility(Notification.VISIBILITY_PUBLIC)
         .addAction(oynuyor ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play, oynuyor ? "Duraklat" : "Oynat", oyn)
         .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Durdur", dur);
        Notification.MediaStyle st = new Notification.MediaStyle().setShowActionsInCompactView(0, 1);
        if (oturum != null) st.setMediaSession(oturum.getSessionToken());
        b.setStyle(st);
        return b.build();
    }
    private void bildirimGoster() {
        try { ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).notify(7, bildirim()); } catch (Exception e) { }
    }

    @Override public int onStartCommand(Intent i, int f, int id) {
        String a = i == null ? null : i.getAction();
        if (DURDUR.equals(a)) { Ana.tvDurdur(); stopSelf(); return START_NOT_STICKY; }
        if (DURAKLAT.equals(a)) { Ana.tvDuraklat(); durum(false); return START_NOT_STICKY; }
        if (OYNAT.equals(a)) { Ana.tvOynat(); durum(true); return START_NOT_STICKY; }
        etkin = this;
        oturumKur();
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(7, bildirim(), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            else startForeground(7, bildirim());
        } catch (Exception e) { Teshis.yaz("arka", "ön plana alınamadı", String.valueOf(e.getMessage())); stopSelf(); return START_NOT_STICKY; }
        Teshis.olay("arka", "hizmet ön planda (medya oturumu " + (oturum != null) + ", ses %" + Ana.sesYuzde(this) + ")", "");
        try {
            if (kilit == null) { kilit = ((PowerManager) getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "saha:yayin"); kilit.setReferenceCounted(false); }
            kilit.acquire(4 * 3600 * 1000L);
            if (ag == null) { ag = ((WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE)).createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "saha:yayin"); ag.setReferenceCounted(false); }
            ag.acquire();
        } catch (Exception e) { }
        return START_NOT_STICKY;
    }
    @Override public void onDestroy() {
        Teshis.olay("arka", "hizmet kapandı", ""); Teshis.gonder();
        if (etkin == this) etkin = null;
        try { if (oturum != null) { oturum.setActive(false); oturum.release(); oturum = null; } } catch (Exception e) { }
        try { if (kilit != null && kilit.isHeld()) kilit.release(); } catch (Exception e) { }
        try { if (ag != null && ag.isHeld()) ag.release(); } catch (Exception e) { }
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent i) { return null; }
}
