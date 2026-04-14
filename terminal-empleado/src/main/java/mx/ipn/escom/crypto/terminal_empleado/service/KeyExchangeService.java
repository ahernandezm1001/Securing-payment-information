package mx.ipn.escom.crypto.terminal_empleado.service;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Service;
import java.security.*;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import javax.crypto.KeyAgreement;
import org.bouncycastle.crypto.digests.SHA256Digest;
import org.bouncycastle.crypto.generators.HKDFBytesGenerator;
import org.bouncycastle.crypto.params.HKDFParameters;

@Service
public class KeyExchangeService {
    private PrivateKey privateKey;
    private PublicKey publicKey;

    public byte[] generateLocalKeyPair() throws Exception {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC", "BC");
        keyPairGenerator.initialize(new ECGenParameterSpec("secp256r1"));
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        this.privateKey = keyPair.getPrivate();
        this.publicKey = keyPair.getPublic();
        // Devolvemos la llave pública en formato encoded para enviarla al servidor
        return publicKey.getEncoded();
    }
    
    // Calcula el secreto compartido usando la llave pública que envíe el servidor
    public byte[] calculateSharedSecret(String serverPublicKeyBase64) throws Exception {
        byte[] serverKeyBytes = Base64.getDecoder().decode(serverPublicKeyBase64);
        KeyFactory kf = KeyFactory.getInstance("EC", "BC");
        PublicKey serverPubKey = kf.generatePublic(new X509EncodedKeySpec(serverKeyBytes));
        KeyAgreement ka = KeyAgreement.getInstance("ECDH", "BC");
        ka.init(this.privateKey);
        ka.doPhase(serverPubKey, true);
        return ka.generateSecret();
    }

    // Deriva la misma llave AES de 256 bits a partir del secreto compartido usando HKDF
    public byte[] deriveAesKey(byte[] sharedSecret) {
        HKDFBytesGenerator hkdf = new HKDFBytesGenerator(new SHA256Digest());
        hkdf.init(new HKDFParameters(sharedSecret, null, "aes-gcm-key".getBytes()));
        byte[] aesKey = new byte[32]; // 32 bytes = 256 bits para AES-256
        hkdf.generateBytes(aesKey, 0, aesKey.length);
        return aesKey;
    }
}
