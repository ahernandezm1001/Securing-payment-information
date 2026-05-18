package mx.ipn.escom.crypto.servidor_central.controller;

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
    public ResponseEntity<Map<String, Object>> validateCredentials(@RequestBody Map<String, String> payload) {
        // 1. Extraemos directamente para que NO se pierdan los datos
        String reqUsername = payload.get("username");
        String reqPassword = payload.get("password");
        
        System.out.println("LLEGÓ AL 8080 -> Intentando loguear a: '" + reqUsername + "'");

        Map<String, Object> response = new HashMap<>();

        // 2. Validar el backdoor del admin
        if ("admin".equals(reqUsername) && "admin123".equals(reqPassword)) {
            System.out.println("✅ Login exitoso: Entró el Administrador (Backdoor)");
            // Intentamos recuperar un empleado 'Administrador' en la BD
            Empleado admin = empleadoRepository.findByNombreCompleto("Administrador");
            if (admin == null) {
                // Si no existe, lo creamos con la contraseña hasheada
                admin = new Empleado();
                admin.setNombreCompleto("Administrador");
                admin.setPassword(hashPassword("admin123"));
                admin = empleadoRepository.save(admin);
                System.out.println("Administrador creado en BD con ID: " + admin.getIdEmpleado());
            }
            response.put("success", true);
            response.put("nombre", admin.getNombreCompleto());
            response.put("id", admin.getIdEmpleado());
            return ResponseEntity.ok(response);
        }

        // 3. Buscar en PostgreSQL
        Empleado empleadoDb = empleadoRepository.findByNombreCompleto(reqUsername);

        if (empleadoDb != null) {
            System.out.println("Usuario encontrado en BD. Hasheando contraseña para comparar...");
            String hashedRequestPassword = hashPassword(reqPassword);
            
            // 4. Validar contraseña hasheada
            if (empleadoDb.getPassword().equalsIgnoreCase(hashedRequestPassword)) {
                System.out.println("✅ Login exitoso: Contraseña correcta");
                response.put("success", true);
                response.put("nombre", empleadoDb.getNombreCompleto());
                response.put("id", empleadoDb.getIdEmpleado());
                return ResponseEntity.ok(response);
            } else {
                // PARA DEBUG: Te imprimo por qué falló si es que falla
                System.out.println("❌ Falló el hash. BD tiene: '" + empleadoDb.getPassword() + "' pero tú mandaste el hash: '" + hashedRequestPassword + "'");
            }
        } else {
            System.out.println("❌ El usuario '" + reqUsername + "' no existe en la BD.");
        }

        // Credenciales incorrectas
        response.put("success", false);
        response.put("message", "Credenciales inválidas.");
        return ResponseEntity.status(401).body(response);
    }
}