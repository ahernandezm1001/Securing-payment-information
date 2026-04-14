package mx.ipn.escom.crypto.servidor_central.service;
import org.bouncycastle.crypto.engines.AESEngine;
import org.bouncycastle.crypto.modes.GCMBlockCipher;
import org.bouncycastle.crypto.modes.GCMModeCipher;
import org.bouncycastle.crypto.params.AEADParameters;
import org.bouncycastle.crypto.params.KeyParameter;
import org.springframework.stereotype.Service;
import java.util.Base64;

@Service
public class DecryptionService {
    private static final int NONCE_BYTES = 12; // 96 bits
    private static final int MAC_BIT_SIZE = 128;
    public String decrypt(String encryptedBase64, byte[] aesKey) throws Exception {
        byte[] ivAndCipherText = Base64.getDecoder().decode(encryptedBase64);

        // 1. Extraer el IV (los primeros 12 bytes)
        byte[] iv = new byte[NONCE_BYTES];
        System.arraycopy(ivAndCipherText, 0, iv, 0, NONCE_BYTES);

        // 2. Extraer el texto cifrado (el resto de los bytes)
        int cipherTextLength = ivAndCipherText.length - NONCE_BYTES;
        byte[] cipherText = new byte[cipherTextLength];
        System.arraycopy(ivAndCipherText, NONCE_BYTES, cipherText, 0, cipherTextLength);

        // 3. Configurar AES-GCM para descifrar
        GCMModeCipher cipher = GCMBlockCipher.newInstance(AESEngine.newInstance());
        AEADParameters parameters = new AEADParameters(new KeyParameter(aesKey), MAC_BIT_SIZE, iv);
        cipher.init(false, parameters); // false = modo descifrado

        // 4. Procesar y descifrar los datos
        byte[] plainText = new byte[cipher.getOutputSize(cipherText.length)];
        int actualLength = cipher.processBytes(cipherText, 0, cipherText.length, plainText, 0);
        actualLength += cipher.doFinal(plainText, actualLength);

        return new String(plainText, 0, actualLength);
    }
}