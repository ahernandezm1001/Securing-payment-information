package mx.ipn.escom.crypto.servidor_central.service;
import org.springframework.stereotype.Service;
import javax.crypto.KeyAgreement;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.crypto.digests.SHA256Digest;
import org.bouncycastle.crypto.generators.HKDFBytesGenerator;
import org.bouncycastle.crypto.params.HKDFParameters;
import java.security.*;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class KeyExchangeService {
    private PrivateKey privateKey;
    private PublicKey publicKey;

    // Almacena las llaves AES en memoria usando el ID de la terminal como identificador
    private final Map<String, byte[]> clientAesKeys = new ConcurrentHashMap<>();

    // Registramos Bouncy Castle como proveedor de seguridad
    static {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    public KeyExchangeService() throws Exception {
        // Usamos la curva secp256r1 (NIST P-256)
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC", "BC");
        ECGenParameterSpec ecSpec = new ECGenParameterSpec("secp256r1");
        kpg.initialize(ecSpec, new SecureRandom());
        KeyPair kp = kpg.generateKeyPair();
        this.privateKey = kp.getPrivate();
        this.publicKey = kp.getPublic();
    }

    // El servidor entrega su llave pública en Base64 para el cliente
    public String getServerPublicKeyBase64() {
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }

    // Calcula el secreto compartido usando la llave pública que envíe el cliente
    public byte[] calculateSharedSecret(String clientPublicKeyBase64) throws Exception {
        byte[] clientKeyBytes = Base64.getDecoder().decode(clientPublicKeyBase64);
        KeyFactory kf = KeyFactory.getInstance("EC", "BC");
        PublicKey clientPubKey = kf.generatePublic(new X509EncodedKeySpec(clientKeyBytes));
        KeyAgreement ka = KeyAgreement.getInstance("ECDH", "BC");
        ka.init(privateKey);
        ka.doPhase(clientPubKey, true);
        return ka.generateSecret();
    }

    // Deriva una llave AES de 256 bits a partir del secreto compartido usando HKDF de Bouncy Castle
    public byte[] deriveAesKey(byte[] sharedSecret) {
        HKDFBytesGenerator hkdf = new HKDFBytesGenerator(new SHA256Digest());
        // Inicializamos HKDF sin sal (opcional) y con un "info" de contexto
        hkdf.init(new HKDFParameters(sharedSecret, null, "aes-gcm-key".getBytes()));
        byte[] aesKey = new byte[32]; // 32 bytes = 256 bits para AES-256
        hkdf.generateBytes(aesKey, 0, aesKey.length);
        return aesKey;
    }

    public void saveClientKey(String deviceId, byte[] key) {
        clientAesKeys.put(deviceId, key);
    }

    public byte[] getClientKey(String deviceId) {
        return clientAesKeys.get(deviceId);
    }
}

