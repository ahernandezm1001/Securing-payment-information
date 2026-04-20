package mx.ipn.escom.crypto.terminal_empleado.controller;

import mx.ipn.escom.crypto.terminal_empleado.dto.LoginRequest;
import mx.ipn.escom.crypto.terminal_empleado.service.HandshakeClientService;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    @Autowired
    private HandshakeClientService handshakeService;

    
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        // 1. Enviar usuario y contraseña al servidor central
        RestTemplate restTemplate = new RestTemplate();
        String serverUrl = "http://localhost:8080/api/auth/login";
        Map<String, String> payload = new HashMap<>();
        payload.put("username", request.getUsername());
        payload.put("password", request.getPassword());
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(serverUrl, payload, String.class);
            System.out.println("Empezo el login" );
            if (response.getStatusCode().is2xxSuccessful()) {
                // Login correcto, ahora sí handshake
                handshakeService.performHandshake();
                return ResponseEntity.ok("Login exitoso y canal seguro establecido con el servidor.");
            } else {
                System.out.println("No fue posible iniciar sesión" );
                return ResponseEntity.status(401).body("Credenciales inválidas.");
                
            }
        } catch (Exception e) {
            System.out.println("Error en el servidor" );
            return ResponseEntity.status(500).body("Error al conectar con el servidor central: " + e.getMessage());
        }
    }
}
