package mx.ipn.escom.crypto.terminal_empleado.controller;

import mx.ipn.escom.crypto.terminal_empleado.dto.LoginRequest;
import mx.ipn.escom.crypto.terminal_empleado.service.HandshakeClientService;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
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

<<<<<<< Updated upstream
    
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
=======
    // Se usa para hacer peticiones HTTP al servidor central
    private final RestTemplate restTemplate = new RestTemplate(); 
    
    // Cambia el puerto si tu servidor corre en uno distinto
    private final String SERVER_URL = "http://localhost:8080/api/server/auth/validate"; 

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 1. Enviar credenciales a la Terminal Servidor
            ResponseEntity<Map> serverResponse = restTemplate.postForEntity(
                    SERVER_URL, 
                    request, 
                    Map.class
            );

            // 2. Si el servidor responde HTTP 200 OK, las credenciales son correctas
            if (serverResponse.getStatusCode().is2xxSuccessful()) {
                String nombreEmpleado = (String) serverResponse.getBody().get("nombre");

                // 3. Disparar el handshake inmediatamente después del éxito
                handshakeService.performHandshake(); // Descomenta esto cuando tu HandshakeService esté listo
                System.out.println("✓ Handshake completado exitosamente");
                
                response.put("success", true);
                response.put("message", "Login exitoso.");
                response.put("username", request.getUsername());
                response.put("nombre", nombreEmpleado);
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            System.err.println("✗ Error de autenticación: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Credenciales inválidas o servidor inalcanzable.");
            return ResponseEntity.status(401).body(response);
>>>>>>> Stashed changes
        }
        
        return ResponseEntity.internalServerError().build();
    }
}