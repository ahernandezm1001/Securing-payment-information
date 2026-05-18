/*
package mx.ipn.escom.crypto.servidor_central.controller;

import mx.ipn.escom.crypto.servidor_central.entity.Empleado;
import mx.ipn.escom.crypto.servidor_central.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");
        Empleado empleado = empleadoRepository.findByNombreCompleto(username);
        if (empleado != null && empleado.getPassword().equals(password)) {
            return ResponseEntity.ok("Login correcto");
        } else {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }
    }
}
*/