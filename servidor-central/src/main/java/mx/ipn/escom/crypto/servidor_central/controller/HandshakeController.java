package mx.ipn.escom.crypto.servidor_central.controller;

import mx.ipn.escom.crypto.servidor_central.service.KeyExchangeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/handshake")
public class HandshakeController {

    @Autowired
    private KeyExchangeService keyExchangeService;

    @PostMapping("/init")
    public ResponseEntity<Map<String, String>> doHandshake(@RequestBody Map<String, String> payload) {
        try {
            String clientPublicKeyBase64 = payload.get("clientPublicKey");
            String deviceId = payload.getOrDefault("deviceId", "default-terminal");

            // 1. Calcular secreto compartido cruzando la llave pública del cliente con la privada del servidor
            byte[] sharedSecret = keyExchangeService.calculateSharedSecret(clientPublicKeyBase64);

            // 2. Derivar la llave AES de 256 bits usando HKDF
            byte[] aesKey = keyExchangeService.deriveAesKey(sharedSecret);

            // 3. Guardar la llave AES para descifrar futuras peticiones de esta terminal
            keyExchangeService.saveClientKey(deviceId, aesKey);
            System.out.println("Handshake exitoso. Llave AES lista para terminal: " + deviceId);

            // 4. Responder enviando la llave pública del servidor
            Map<String, String> response = new HashMap<>();
            response.put("serverPublicKey", keyExchangeService.getServerPublicKeyBase64());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
