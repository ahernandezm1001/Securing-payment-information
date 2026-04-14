package mx.ipn.escom.crypto.terminal_empleado.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.ipn.escom.crypto.terminal_empleado.dto.EncryptedPayloadDto;
import mx.ipn.escom.crypto.terminal_empleado.dto.TicketDto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SecurePaymentClientService {

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private HandshakeClientService handshakeClientService;

    // Spring Boot provee una instancia configurada de ObjectMapper automáticamente
    @Autowired
    private ObjectMapper objectMapper;

    public void sendSecureTicket(TicketDto ticket) throws Exception {
        // 1. Validar que la llave AES de la sesión esté disponible
        byte[] aesKey = handshakeClientService.getSessionAesKey();
        if (aesKey == null) {
            throw new IllegalStateException("No hay llave de sesión. Ejecuta el Handshake primero.");
        }

        // 2. Transformar el objeto TicketDto a cadena JSON
        String jsonPayload = objectMapper.writeValueAsString(ticket);

        // 3. Cifrar la cadena JSON usando AES-GCM
        String encryptedBase64 = encryptionService.encrypt(jsonPayload, aesKey);

        // 4. Empaquetar en el DTO envoltorio
        EncryptedPayloadDto requestDto = new EncryptedPayloadDto();
        requestDto.setDeviceId("terminal-001");
        requestDto.setEncryptedData(encryptedBase64);

        // 5. Enviar por red al servidor central
        RestTemplate restTemplate = new RestTemplate();
        String serverUrl = "http://localhost:8080/api/tickets/secure-create";
        
        // El servidor responderá con otro string, por ejemplo: "Ticket guardado con éxito"
        String response = restTemplate.postForObject(serverUrl, requestDto, String.class);
        System.out.println("Respuesta del servidor: " + response);
    }
}