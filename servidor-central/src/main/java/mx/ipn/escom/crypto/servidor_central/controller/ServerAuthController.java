package mx.ipn.escom.crypto.servidor_central.controller;

import mx.ipn.escom.crypto.servidor_central.dto.LoginRequest;
import mx.ipn.escom.crypto.servidor_central.repository.EmpleadoRepository;
import mx.ipn.escom.crypto.servidor_central.entity.Empleado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/server/auth")
public class ServerAuthController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    // Método auxiliar privado para hashear dentro del controlador
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(password.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error de criptografía", e);
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCredentials(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Validar el backdoor del admin
        if ("admin".equals(request.getUsername()) && "admin123".equals(request.getPassword())) {
            response.put("success", true);
            response.put("nombre", "Administrador");
            return ResponseEntity.ok(response);
        }

        // 2. Buscar en PostgreSQL usando el Nombre Completo
        Empleado empleadoDb = empleadoRepository.findByNombreCompleto(request.getUsername());

        // 3. Validar si el empleado existe
        if (empleadoDb != null) {
            
            // Hasheamos 
            String hashedRequestPassword = hashPassword(request.getPassword());
            
            //comparamos ese Hash contra el Hash que está guardado en la BD
            if (empleadoDb.getPassword().equals(hashedRequestPassword)) {
                response.put("success", true);
                response.put("nombre", empleadoDb.getNombreCompleto());
                return ResponseEntity.ok(response);
            }
        }

        // Credenciales incorrectas
        response.put("success", false);
        response.put("message", "Credenciales inválidas.");
        return ResponseEntity.status(401).body(response);
    }
}