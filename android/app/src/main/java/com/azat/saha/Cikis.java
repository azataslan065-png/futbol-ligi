package com.azat.saha;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

/* ÇIKIŞ PENCERESİ (2026-11-07, kullanıcı: "pop-up'ı yeniden tasarla, üç uygulama için"). Android'in standart gri onay kutusu yerine
   uygulamaların kendi görünümünde bir kart: karartılmış arka plan, yuvarlak köşeli koyu kart, uygulama simgesi, başlık ve açıklama,
   yan yana iki geniş düğme (Vazgeç / Çık). Güncelleme ekranıyla aynı renkler. Kartın dışına dokunmak ya da geri tuşu = Vazgeç.
   Yatay (SAHA) ve dikey (Puan Tablosu, Admin) ekranda ortalanır, genişliği ekrana göre sınırlanır. */
final class Cikis {
    private static FrameLayout ekran;

    static boolean acik() { return ekran != null; }

    static void kapat() {
        if (ekran == null) return;
        final View e = ekran; ekran = null;
        e.animate().alpha(0f).setDuration(120).withEndAction(() -> { ViewGroup p = (ViewGroup) e.getParent(); if (p != null) p.removeView(e); }).start();
    }

    private static int dp(Activity a, float v) { return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, a.getResources().getDisplayMetrics()); }

    static void goster(final Activity a) {
        if (ekran != null || a.isFinishing()) return;
        ekran = new FrameLayout(a);
        ekran.setBackgroundColor(Color.parseColor("#B3050710"));
        ekran.setClickable(true);
        ekran.setOnClickListener(v -> kapat());                    // kartın dışına dokununca vazgeç

        LinearLayout kart = new LinearLayout(a);
        kart.setOrientation(LinearLayout.VERTICAL);
        kart.setGravity(Gravity.CENTER_HORIZONTAL);
        kart.setClickable(true);                                   // karta dokunmak pencereyi kapatmasın
        kart.setPadding(dp(a, 22), dp(a, 22), dp(a, 22), dp(a, 18));
        GradientDrawable z = new GradientDrawable(); z.setColor(Color.parseColor("#1A1D2B")); z.setCornerRadius(dp(a, 22)); z.setStroke(dp(a, 1), Color.parseColor("#33FFFFFF"));
        kart.setBackground(z);
        kart.setElevation(dp(a, 12));

        ImageView ik = new ImageView(a);
        ik.setImageResource(R.mipmap.ic_launcher);
        kart.addView(ik, new LinearLayout.LayoutParams(dp(a, 56), dp(a, 56)));

        TextView bas = new TextView(a);
        bas.setText("Uygulamadan çıkılsın mı?");
        bas.setTextColor(Color.WHITE); bas.setTextSize(TypedValue.COMPLEX_UNIT_SP, 19); bas.setTypeface(Typeface.DEFAULT_BOLD);
        bas.setGravity(Gravity.CENTER); bas.setPadding(0, dp(a, 12), 0, dp(a, 4));
        kart.addView(bas);

        TextView alt = new TextView(a);
        alt.setText(a.getString(R.string.app_name) + " kapanacak. Girişin ve ayarların korunur; tekrar açtığında kaldığın yerden devam edersin.");
        alt.setTextColor(Color.parseColor("#9AA3B8")); alt.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14); alt.setGravity(Gravity.CENTER);
        alt.setLineSpacing(0, 1.2f); alt.setPadding(0, 0, 0, dp(a, 18));
        kart.addView(alt);

        LinearLayout dug = new LinearLayout(a);
        Button vaz = dugme(a, "Vazgeç", "#262A3B", Color.WHITE);
        vaz.setOnClickListener(v -> kapat());
        Button cik = dugme(a, "Çık", "#E5533D", Color.WHITE);
        cik.setOnClickListener(v -> { kapat(); a.finish(); });
        LinearLayout.LayoutParams p1 = new LinearLayout.LayoutParams(0, dp(a, 48), 1); p1.setMargins(0, 0, dp(a, 10), 0);
        dug.addView(vaz, p1);
        dug.addView(cik, new LinearLayout.LayoutParams(0, dp(a, 48), 1));
        kart.addView(dug, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        int gen = Math.min(dp(a, 360), a.getResources().getDisplayMetrics().widthPixels - dp(a, 40));
        FrameLayout.LayoutParams kp = new FrameLayout.LayoutParams(gen, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER);
        ekran.addView(kart, kp);

        ((FrameLayout) a.findViewById(android.R.id.content)).addView(ekran, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        ekran.setAlpha(0f); ekran.animate().alpha(1f).setDuration(140).start();
        kart.setScaleX(0.94f); kart.setScaleY(0.94f); kart.animate().scaleX(1f).scaleY(1f).setDuration(160).start();
        vaz.requestFocus();
    }

    private static Button dugme(Activity a, String s, String zemin, int yazi) {
        Button b = new Button(a); b.setText(s); b.setAllCaps(false); b.setTextColor(yazi);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15); b.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable g = new GradientDrawable(); g.setColor(Color.parseColor(zemin)); g.setCornerRadius(dp(a, 24));
        b.setBackground(g); b.setStateListAnimator(null);
        return b;
    }
}
