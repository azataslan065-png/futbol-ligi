package com.azat.saha;

import android.net.Uri;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/* YOUTUBE REKLAMLARI (2026-11-07, kullanıcı: "YouTube bağlantılı videolarda daha önce reklam çıkmıyordu, şimdi çıkıyor; bunu önle").
   KÖK SEBEP: TV sekmesi tarayıcıda açılırken telefonun tarayıcısındaki reklam engelleyici YouTube reklamlarını kesiyordu; uygulamanın
   sayfa motorunda (WebView) böyle bir engelleyici yok, gömülü oynatıcı reklamları olduğu gibi gösteriyordu. İki katman:
   1) Reklam ve reklam ölçüm sunucularına giden istekler boş yanıtla kapatılır (doubleclick, googlesyndication, IMA vb.).
   2) Gömülü oynatıcı sayfası (youtube.com/embed/…) uygulama tarafından alınır ve oynatıcının kodundan ÖNCE küçük bir betik eklenir:
      oynatıcıya gelen yayın bilgisinden reklam alanları (adPlacements, playerAds, adSlots…) çıkarılır; oynatıcı reklam olduğunu hiç bilmez.
   Herhangi bir hata olursa istek normal yoldan yapılır (video yine oynar). Yalnızca reklamlara dokunulur; video, ses, kalite değişmez. */
final class Reklam {
    private static final String[] SUNUCU = { "doubleclick.net", "googlesyndication.com", "googleadservices.com", "imasdk.googleapis.com",
        "adservice.google.com", "googletagservices.com", "pagead2.googlesyndication.com", "ads.youtube.com" };
    private static final String[] YOL = { "/pagead/", "/api/stats/ads", "/ptracking", "/get_midroll_info", "/youtubei/v1/player/ad_break", "/pcs/activeview" };
    private static final String BETIK = "<script>(function(){try{"
        // (2026-11-07) Arka planda oynatma: oynatıcı sayfanın gizlendiğini görüp videoyu durdurmasın (bkz. Arka)
        + "try{Object.defineProperty(document,'hidden',{configurable:true,get:function(){return false;}});Object.defineProperty(document,'visibilityState',{configurable:true,get:function(){return 'visible';}});"
        + "['visibilitychange','webkitvisibilitychange'].forEach(function(t){document.addEventListener(t,function(e){e.stopImmediatePropagation();},true);});}catch(e){}"
        + "var K=['adPlacements','adSlots','playerAds','adBreakHeartbeatParams','adBreakParams','adParams','adInferredBlockingStatus'];"
        + "function t(o){try{if(o&&typeof o==='object'){for(var i=0;i<K.length;i++){if(K[i] in o)delete o[K[i]];}"
        + "if(o.playerResponse)t(o.playerResponse);if(o.response)t(o.response);if(o.embedded_player_response&&typeof o.embedded_player_response==='object')t(o.embedded_player_response);}}catch(e){}return o;}"
        + "var jp=JSON.parse;JSON.parse=function(){return t(jp.apply(this,arguments));};"
        + "try{var rj=Response.prototype.json;Response.prototype.json=function(){return rj.apply(this,arguments).then(t);};}catch(e){}"
        + "['ytInitialPlayerResponse','playerResponse'].forEach(function(a){try{var v;Object.defineProperty(window,a,{configurable:true,get:function(){return v;},set:function(x){v=t(x);}});}catch(e){}});"
        + "}catch(e){}})();</script>";

    private static boolean reklamSunucusu(String h) {
        for (String s : SUNUCU) if (h.equals(s) || h.endsWith("." + s)) return true;
        return false;
    }
    private static boolean youtube(String h) {
        return h.equals("www.youtube.com") || h.equals("youtube.com") || h.equals("m.youtube.com") || h.equals("www.youtube-nocookie.com") || h.equals("youtube-nocookie.com");
    }
    private static WebResourceResponse bos() {
        Map<String, String> b = new HashMap<>(); b.put("Access-Control-Allow-Origin", "*");
        return new WebResourceResponse("text/plain", "utf-8", 204, "No Content", b, new ByteArrayInputStream(new byte[0]));
    }

    static WebResourceResponse ver(WebResourceRequest r) {
        try {
            Uri u = r.getUrl(); String h = u.getHost(), p = u.getPath();
            if (h == null) return null; h = h.toLowerCase(); if (p == null) p = "";
            if (reklamSunucusu(h)) return bos();
            if (!youtube(h)) return null;
            for (String y : YOL) if (p.startsWith(y)) return bos();
            if (p.startsWith("/embed/") && "GET".equalsIgnoreCase(r.getMethod())) return gomulu(r);
        } catch (Exception e) { }
        return null;
    }

    /** Gömülü oynatıcı sayfasını alır, güvenlik başlığını (CSP) çıkarır ve reklam ayıklayıcı betiği ekler. */
    private static WebResourceResponse gomulu(WebResourceRequest r) {
        HttpURLConnection c = null;
        try {
            String adres = r.getUrl().toString();
            c = (HttpURLConnection) new URL(adres).openConnection();
            c.setConnectTimeout(10000); c.setReadTimeout(15000); c.setInstanceFollowRedirects(true);
            Map<String, String> ist = r.getRequestHeaders();
            if (ist != null) for (Map.Entry<String, String> e : ist.entrySet()) { String k = e.getKey(); if (k == null || "accept-encoding".equalsIgnoreCase(k)) continue; c.setRequestProperty(k, e.getValue()); }
            String cerez = CookieManager.getInstance().getCookie(adres); if (cerez != null) c.setRequestProperty("Cookie", cerez);
            int kod = c.getResponseCode();
            if (kod != 200) { c.disconnect(); return null; }
            String tur = c.getContentType(); if (tur == null || !tur.toLowerCase().contains("text/html")) { c.disconnect(); return null; }
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            try (InputStream in = c.getInputStream()) { byte[] b = new byte[32768]; int n; while ((n = in.read(b)) > 0) o.write(b, 0, n); }
            String html = o.toString("UTF-8");
            int i = html.indexOf("<head>"); if (i < 0) i = html.indexOf("<head ");
            if (i >= 0) { int j = html.indexOf('>', i) + 1; html = html.substring(0, j) + BETIK + html.substring(j); } else html = BETIK + html;
            Map<String, String> bas = new HashMap<>();
            for (Map.Entry<String, List<String>> e : c.getHeaderFields().entrySet()) {
                String k = e.getKey(); if (k == null || e.getValue() == null || e.getValue().isEmpty()) continue;
                String kk = k.toLowerCase();
                if (kk.startsWith("content-security-policy") || kk.equals("content-length") || kk.equals("content-encoding") || kk.equals("content-type") || kk.equals("transfer-encoding")) continue;
                if (kk.equals("set-cookie")) { for (String v : e.getValue()) CookieManager.getInstance().setCookie(adres, v); continue; }
                bas.put(k, e.getValue().get(0));
            }
            return new WebResourceResponse("text/html", "utf-8", 200, "OK", bas, new ByteArrayInputStream(html.getBytes("UTF-8")));
        } catch (Exception e) {
            return null;
        } finally { if (c != null) try { c.disconnect(); } catch (Exception e) { } }
    }
}
