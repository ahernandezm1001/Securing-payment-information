package mx.ipn.escom.crypto.servidor_central.controller;

import mx.ipn.escom.crypto.servidor_central.entity.Empleado;
import mx.ipn.escom.crypto.servidor_central.repository.EmpleadoRepository;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.*;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/server/empleados")
public class EmpleadoServerController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    // Registramos Bouncy Castle
    static {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    // Tu método exacto de hasheo SHA-256
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

    @PostMapping("/crear")
    public ResponseEntity<Map<String, Object>> crearEmpleado(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String nombreCompleto = request.get("nombreCompleto");
            String passwordPlana = request.get("password");

            // 1. Verificamos que no exista
            if (empleadoRepository.findByNombreCompleto(nombreCompleto) != null) {
                response.put("success", false);
                response.put("message", "El empleado ya existe.");
                return ResponseEntity.badRequest().body(response);
            }

            // 2. Generamos el par de llaves ECDSA (secp256r1)
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("ECDSA", "BC");
            ECGenParameterSpec ecSpec = new ECGenParameterSpec("secp256r1");
            keyGen.initialize(ecSpec, new SecureRandom());
            KeyPair keyPair = keyGen.generateKeyPair();

            String publicKeyBase64 = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
            // Esta es la que se va a descargar en la USB:
            String privateKeyBase64 = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());

            // 3. Creamos el empleado y guardamos la llave PÚBLICA y el hash
            Empleado nuevoEmpleado = new Empleado();
            nuevoEmpleado.setNombreCompleto(nombreCompleto);
            nuevoEmpleado.setPassword(hashPassword(passwordPlana));
            nuevoEmpleado.setLlavePublica(publicKeyBase64);
            
            empleadoRepository.save(nuevoEmpleado);

            // 4. Respondemos a React entregando la llave PRIVADA por única vez
            response.put("success", true);
            response.put("message", "Empleado creado exitosamente.");
            response.put("llavePrivada", privateKeyBase64); // 👈 React la descargará
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error interno al crear el empleado.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}