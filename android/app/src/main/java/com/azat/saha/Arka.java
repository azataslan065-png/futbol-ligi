package com.azat.saha;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/* ARKA PLANDA OYNATMA (2026-11-07, kullanıcı: "TV için arka planda oynatma çalışmıyor; ekran kapatıldığında yayın duruyor"). KÖK SEBEP: ekran
   kapanınca (ya da uygulamadan çıkılınca) sayfa motoru sayfayı "görünmez" sayıp videoyu durduruyor, Android da arka plandaki uygulamayı
   bir süre sonra donduruyordu. ŞİMDİ TV'de yayın oynarken: (1) bu ön plan hizmeti çalışır - bildirim çubuğunda "yayın oynatılıyor" görünür,
   telefon uyusa da işlemci ve kablosuz bağlantı açık kalır, uygulama dondurulmaz; (2) sayfa motoruna ekran kapalıyken de sayfanın görünür
   olduğu söylenir (bkz. Ana), video ve YouTube durmaz. Bildirimdeki "Durdur" yayını duraklatır; yayın durunca hizmet kendiliğinden kapanır. */
public class Arka extends Service {
    static final String DURDUR = "com.azat.saha.ARKA_DURDUR";
    private PowerManager.WakeLock kilit;
    private WifiManager.WifiLock ag;

    static void baslat(Context c) {
        try { Intent i = new Intent(c, Arka.class); if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i); }
        catch (Exception e) { Teshis.yaz("arka", "başlatılamadı", String.valueOf(e.getMessage())); }
    }
    static void durdur(Context c) { try { c.stopService(new Intent(c, Arka.class)); } catch (Exception e) { } }

    @Override public int onStartCommand(Intent i, int f, int id) {
        if (i != null && DURDUR.equals(i.getAction())) { Ana.tvDurdur(); stopSelf(); return START_NOT_STICKY; }
        String kanal = "yayin";
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(kanal) == null) {
            NotificationChannel k = new NotificationChannel(kanal, "Arka planda yayın", NotificationManager.IMPORTANCE_LOW);
            k.setShowBadge(false); nm.createNotificationChannel(k);
        }
        int bay = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        PendingIntent ac = PendingIntent.getActivity(this, 1, new Intent(this, Ana.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), bay);
        PendingIntent dur = PendingIntent.getService(this, 2, new Intent(this, Arka.class).setAction(DURDUR), bay);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, kanal) : new Notification.Builder(this);
        b.setSmallIcon(android.R.drawable.ic_media_play).setContentTitle(getString(R.string.app_name)).setContentText("TV yayını arka planda oynatılıyor")
         .setContentIntent(ac).setOngoing(true).addAction(android.R.drawable.ic_media_pause, "Durdur", dur);
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(7, b.build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            else startForeground(7, b.build());
        } catch (Exception e) { Teshis.yaz("arka", "ön plana alınamadı", String.valueOf(e.getMessage())); stopSelf(); return START_NOT_STICKY; }
        try {
            if (kilit == null) { kilit = ((PowerManager) getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "saha:yayin"); kilit.setReferenceCounted(false); }
            kilit.acquire(4 * 3600 * 1000L);
            if (ag == null) { ag = ((WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE)).createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "saha:yayin"); ag.setReferenceCounted(false); }
            ag.acquire();
        } catch (Exception e) { }
        return START_NOT_STICKY;
    }
    @Override public void onDestroy() {
        try { if (kilit != null && kilit.isHeld()) kilit.release(); } catch (Exception e) { }
        try { if (ag != null && ag.isHeld()) ag.release(); } catch (Exception e) { }
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent i) { return null; }
}
