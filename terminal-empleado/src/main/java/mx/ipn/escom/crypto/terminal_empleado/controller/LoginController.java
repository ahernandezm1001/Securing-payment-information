package mx.ipn.escom.crypto.terminal_empleado.controller;

import mx.ipn.escom.crypto.terminal_empleado.dto.LoginRequest;
import mx.ipn.escom.crypto.terminal_empleado.service.HandshakeClientService;
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
        // 1. Simulación de autenticación (Aquí conectarías con tu DB de empleados)
        if ("admin".equals(request.getUsername()) && "admin123".equals(request.getPassword())) {
            try {
                // 2. Disparar el handshake inmediatamente después del éxito
                // Esto generará la llave AES y la guardará en el Service
                handshakeService.performHandshake();
                
                return ResponseEntity.ok("Login exitoso y canal seguro establecido con el servidor.");
            } catch (Exception e) {
                return ResponseEntity.internalServerError()
                        .body("Login correcto, pero falló el Handshake criptográfico: " + e.getMessage());
            }
        } else {
            return ResponseEntity.status(401).body("Credenciales inválidas.");
        }
    }
}
