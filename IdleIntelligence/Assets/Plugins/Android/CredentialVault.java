package com.idleintelligence.secure;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** AndroidKeystore-only, non-exported Unity native plugin; no plaintext token in prefs. */
public final class CredentialVault {
    private static final String ALIAS="idle-intelligence-company-bearer-v1";
    private static final String FILE="idle-intelligence-secure-session";
    private static final String KEY="encrypted-token-v1";
    private CredentialVault() {}
    private static SecretKey key() throws Exception {
        KeyStore ks=KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        if(ks.containsAlias(ALIAS))return (SecretKey)ks.getKey(ALIAS,null);
        KeyGenerator generator=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(ALIAS,
                KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT)
              .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
              .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
              .setKeySize(256).build());
        return generator.generateKey();
    }
    private static SharedPreferences prefs(Context context){
        return context.getApplicationContext().getSharedPreferences(FILE,Context.MODE_PRIVATE);
    }
    public static boolean store(Context context,String bearer){
        if(context==null||bearer==null||!bearer.matches("[A-Za-z0-9_-]{43}"))return false;
        try {
            Cipher aes=Cipher.getInstance("AES/GCM/NoPadding");
            aes.init(Cipher.ENCRYPT_MODE,key(),new SecureRandom());
            byte[] encrypted=aes.doFinal(bearer.getBytes(StandardCharsets.UTF_8));
            byte[] iv=aes.getIV();
            if(iv.length!=12)return false;
            return prefs(context).edit().putString(KEY,
              Base64.encodeToString(iv,Base64.NO_WRAP)+":"+
              Base64.encodeToString(encrypted,Base64.NO_WRAP)).commit();
        }catch(Exception e){return false;}
    }
    public static String read(Context context){
        if(context==null)return "";
        String packed=prefs(context).getString(KEY,null);
        if(packed==null)return "";
        try{
            String[] values=packed.split(":",-1);
            if(values.length!=2)return "";
            byte[] iv=Base64.decode(values[0],Base64.NO_WRAP);
            byte[] encrypted=Base64.decode(values[1],Base64.NO_WRAP);
            if(iv.length!=12||encrypted.length<16)return "";
            Cipher aes=Cipher.getInstance("AES/GCM/NoPadding");
            aes.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,iv));
            String token=new String(aes.doFinal(encrypted),StandardCharsets.UTF_8);
            return token.matches("[A-Za-z0-9_-]{43}")?token:"";
        }catch(Exception e){
            prefs(context).edit().remove(KEY).apply();
            return "";
        }
    }
    public static void clear(Context context){
        if(context!=null)prefs(context).edit().remove(KEY).commit();
    }
}
