package mx.ipn.escom.crypto.terminal_empleado.service;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Security;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

@Service
public class FirmaDigitalService {

    // Bloque estático: Registra BouncyCastle una sola vez cuando arranca el servicio
    static {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    // Método que construye la cadena exacta que vamos a "congelar"
    public String generarCadenaOriginal(Long idEmpleado, String periodo, Integer totalVentas, Double montoTotal) {
        // Ej: EMPLEADO:1|PERIODO:Mayo 2026|TOTAL_VENTAS:3|MONTO:2600.00
        return String.format("EMPLEADO:%d|PERIODO:%s|TOTAL_VENTAS:%d|MONTO:%.2f", 
                idEmpleado, periodo, totalVentas, montoTotal);
    }

    // Método que aplica la firma matemática
    public String firmarECDSA(String cadenaOriginal, String llavePrivadaBase64) throws Exception {
        // 1. Limpiamos la llave (por si el block de notas le metió espacios o saltos de línea)
        String llaveLimpia = llavePrivadaBase64.replaceAll("\\s+", "");

        // 2. Reconstruimos la llave privada desde el texto Base64
        byte[] keyBytes = Base64.getDecoder().decode(llaveLimpia);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        
        // 3. ¡Usamos BouncyCastle ("BC") explícitamente para la Curva Elíptica!
        KeyFactory kf = KeyFactory.getInstance("EC", "BC");
        PrivateKey privateKey = kf.generatePrivate(spec);

        // 4. Configuramos el algoritmo de firma obligando a usar BouncyCastle
        Signature ecdsaSign = Signature.getInstance("SHA256withECDSA", "BC");
        ecdsaSign.initSign(privateKey);
        
        // 5. Le pasamos nuestra cadena original
        ecdsaSign.update(cadenaOriginal.getBytes(StandardCharsets.UTF_8));

        // 6. ¡Firmamos! Y convertimos a Base64
        byte[] firmaBytes = ecdsaSign.sign();
        return Base64.getEncoder().encodeToString(firmaBytes);
    }
}