package mx.ipn.escom.crypto.terminal_empleado.service;

import org.bouncycastle.crypto.engines.AESEngine;
import org.bouncycastle.crypto.modes.GCMBlockCipher;
import org.bouncycastle.crypto.modes.GCMModeCipher;
import org.bouncycastle.crypto.params.AEADParameters;
import org.bouncycastle.crypto.params.KeyParameter;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class EncryptionService {

    private static final int NONCE_BYTES = 12; // 96 bits recomendado para GCM
    private static final int MAC_BIT_SIZE = 128; // Autenticación fuerte

    public String encrypt(String plainText, byte[] aesKey) throws Exception {
        // 1. Generar un IV (Nonce) aleatorio para esta operación
        byte[] iv = new byte[NONCE_BYTES];
        new SecureRandom().nextBytes(iv);

        // 2. Configurar AES-GCM usando Bouncy Castle
        GCMModeCipher cipher = GCMBlockCipher.newInstance(AESEngine.newInstance());
        AEADParameters parameters = new AEADParameters(new KeyParameter(aesKey), MAC_BIT_SIZE, iv);
        cipher.init(true, parameters); // true = modo cifrado

        // 3. Procesar los datos a cifrar
        byte[] plainBytes = plainText.getBytes();
        byte[] cipherText = new byte[cipher.getOutputSize(plainBytes.length)];
        int actualLength = cipher.processBytes(plainBytes, 0, plainBytes.length, cipherText, 0);
        actualLength += cipher.doFinal(cipherText, actualLength);

        // 4. Concatenar IV + Texto Cifrado
        byte[] ivAndCipherText = new byte[NONCE_BYTES + actualLength];
        System.arraycopy(iv, 0, ivAndCipherText, 0, NONCE_BYTES);
        System.arraycopy(cipherText, 0, ivAndCipherText, NONCE_BYTES, actualLength);

        // 5. Retornar el resultado en formato Base64 para enviarlo fácilmente por JSON
        return Base64.getEncoder().encodeToString(ivAndCipherText);
    }
}