package com.azat.saha;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.Environment;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

/* Güncelleme APK'sını Android kurulum ekranına veren küçük dosya sağlayıcı (bkz. Guncelle). Yalnızca uygulamanın kendi indirme klasöründeki
   .apk dosyalarını, yalnızca okuma için ve yalnızca izin verilen kuruluma açar (dışa kapalı, grantUriPermissions). */
public class Dosya extends ContentProvider {
    private File dosya(Uri u) throws FileNotFoundException {
        File klasor = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        String ad = u.getLastPathSegment();
        if (klasor == null || ad == null || ad.contains("/") || !ad.endsWith(".apk")) throw new FileNotFoundException();
        File f = new File(klasor, ad);
        if (!f.exists()) throw new FileNotFoundException();
        return f;
    }
    @Override public boolean onCreate() { return true; }
    @Override public String getType(Uri u) { return "application/vnd.android.package-archive"; }
    @Override public ParcelFileDescriptor openFile(Uri u, String mod) throws FileNotFoundException {
        return ParcelFileDescriptor.open(dosya(u), ParcelFileDescriptor.MODE_READ_ONLY);
    }
    @Override public Cursor query(Uri u, String[] s, String w, String[] a, String o) {
        try { File f = dosya(u); MatrixCursor c = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
              c.addRow(new Object[]{f.getName(), f.length()}); return c; } catch (Exception e) { return null; }
    }
    @Override public Uri insert(Uri u, ContentValues v) { return null; }
    @Override public int delete(Uri u, String w, String[] a) { return 0; }
    @Override public int update(Uri u, ContentValues v, String w, String[] a) { return 0; }
}
