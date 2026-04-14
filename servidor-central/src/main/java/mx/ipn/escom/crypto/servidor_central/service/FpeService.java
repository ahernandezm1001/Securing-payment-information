package mx.ipn.escom.crypto.servidor_central.service;
import org.bouncycastle.crypto.fpe.FPEFF1Engine;
import org.bouncycastle.crypto.params.FPEParameters;
import org.bouncycastle.crypto.params.KeyParameter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Base64;

@Service
public class FpeService {

    @Value("${app.crypto.fpe-key}")
    private String keyHex;

    @Value("${app.crypto.fpe-tweak}")
    private String tweakBase64;

    private static final int RADIX = 10; //Radix para datos numéricos

    private FPEFF1Engine engine;
    private byte[] tweak;
    private byte[] key;

    @PostConstruct
    public void init() {
        this.engine = new FPEFF1Engine();
        this.tweak = Base64.getDecoder().decode(tweakBase64);
        this.key = hexStringToByteArray(keyHex);
    }

    public String encrypt(String input) {
        byte[] inputChars = convertToIndexes(input);
        FPEParameters params = new FPEParameters(new KeyParameter(key), RADIX, tweak);
        engine.init(true, params);
        byte[] encryptedChars = new byte[inputChars.length];
        engine.processBlock(inputChars, 0, inputChars.length, encryptedChars, 0);
        return convertToChars(encryptedChars);
    }
    
    public String decrypt(String input) {
        byte[] inputChars = convertToIndexes(input);
        FPEParameters params = new FPEParameters(new KeyParameter(key), RADIX, tweak);
        engine.init(false, params);
        byte[] decryptedChars = new byte[inputChars.length];
        engine.processBlock(inputChars, 0, inputChars.length, decryptedChars, 0);
        return convertToChars(decryptedChars);
    }

    private byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4) + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }

    private byte[] convertToIndexes(String input) {
        byte[] indexes = new byte[input.length()];
        for (int i = 0; i < input.length(); i++) {
            indexes[i] = (byte) Character.digit(input.charAt(i), 10);
        }
        return indexes;
    }

    private String convertToChars(byte[] indexes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : indexes) {
            sb.append(Character.forDigit(b, 10));
        }
        return sb.toString();
    }
}