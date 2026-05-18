package mx.ipn.escom.crypto.terminal_empleado.controller;

import mx.ipn.escom.crypto.terminal_empleado.dto.LoginRequest;
import mx.ipn.escom.crypto.terminal_empleado.service.HandshakeClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    @Autowired
    private HandshakeClientService handshakeService;

    // Se usa para hacer peticiones HTTP al servidor central
    private final RestTemplate restTemplate = new RestTemplate(); 
    
    // Ruta de validación en el Servidor Central
    private final String SERVER_URL = "http://localhost:8080/api/server/auth/validate"; 

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 1. Enviar credenciales al Servidor Central (Puerto 8080)
            ResponseEntity<Map> serverResponse = restTemplate.postForEntity(
                    SERVER_URL, 
                    request, 
                    Map.class
            );

            // 2. Si el servidor responde exitosamente
            if (serverResponse.getStatusCode().is2xxSuccessful()) {
                    String nombreEmpleado = (String) serverResponse.getBody().get("nombre");
                    Object idObj = serverResponse.getBody().get("id");

                    handshakeService.performHandshake(); 
                    System.out.println("✓ Handshake completado y llave AES generada.");
                
                    response.put("success", true);
                    response.put("message", "Login exitoso.");
                    response.put("nombre", nombreEmpleado);
                    // Pasamos también el id del empleado recibido desde el servidor central
                    if (idObj != null) response.put("id", idObj);
                
                    return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            System.err.println("✗ Error de autenticación: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Credenciales inválidas o servidor inalcanzable.");
            return ResponseEntity.status(401).body(response);
        }
        
        return ResponseEntity.internalServerError().build();
    }
}