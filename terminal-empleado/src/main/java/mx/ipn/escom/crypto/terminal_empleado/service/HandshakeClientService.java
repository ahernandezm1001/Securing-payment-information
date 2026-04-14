package mx.ipn.escom.crypto.terminal_empleado.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class HandshakeClientService {

    @Autowired
    private KeyExchangeService keyExchangeService;

    // Llave AES resultante para esta sesión
    private byte[] sessionAesKey;

    public void performHandshake() throws Exception {
        // 1. Generar par de llaves locales de curva elíptica
        byte[] localPublicKey = keyExchangeService.generateLocalKeyPair();
        String localPublicKeyBase64 = Base64.getEncoder().encodeToString(localPublicKey);

        // 2. Preparar el payload JSON
        Map<String, String> payload = new HashMap<>();
        payload.put("clientPublicKey", localPublicKeyBase64);
        payload.put("deviceId", "terminal-001");

        // 3. Enviar petición POST al servidor central
        RestTemplate restTemplate = new RestTemplate();
        String serverUrl = "http://localhost:8080/api/handshake/init";
        
        @SuppressWarnings("unchecked")
        Map<String, String> response = restTemplate.postForObject(serverUrl, payload, Map.class);

        if (response != null && response.containsKey("serverPublicKey")) {
            // 4. Calcular el secreto y derivar la misma llave AES localmente
            String serverPublicKeyBase64 = response.get("serverPublicKey");
            byte[] sharedSecret = keyExchangeService.calculateSharedSecret(serverPublicKeyBase64);
            this.sessionAesKey = keyExchangeService.deriveAesKey(sharedSecret);
            System.out.println("Handshake completado. Llave AES simétrica obtenida con éxito.");
        } else {
            throw new RuntimeException("Fallo en el Handshake: no se recibió llave del servidor.");
        }
    }

    public byte[] getSessionAesKey() {
        return sessionAesKey;
    }
}