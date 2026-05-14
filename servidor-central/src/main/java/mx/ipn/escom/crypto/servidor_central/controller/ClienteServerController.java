package mx.ipn.escom.crypto.servidor_central.controller;

import mx.ipn.escom.crypto.servidor_central.entity.Cliente;
import mx.ipn.escom.crypto.servidor_central.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/server/clientes")
public class ClienteServerController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping("/buscar")
    public ResponseEntity<Map<String, Object>> buscarCliente(@RequestParam String telefono) {
        try {
            Optional<Cliente> clienteOpt = clienteRepository.findByTelefono(telefono);
            
            if (clienteOpt.isPresent()) {
                Cliente c = clienteOpt.get();
                Map<String, Object> response = new HashMap<>();
                
                // USAMOS LOS GETTERS DE LOMBOK CORRECTOS
                response.put("id", c.getIdCliente()); 
                response.put("nombre", c.getNombreCompleto()); 
                response.put("telefono", c.getTelefono());
                response.put("numeroTarjeta", c.getNoTarjeta()); 
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<Map<String, Object>> registrarCliente(@RequestBody Map<String, Object> request) {
        try {
            Cliente nuevoCliente = new Cliente();
            
            // USAMOS LOS SETTERS DE LOMBOK CORRECTOS
            nuevoCliente.setNombreCompleto((String) request.get("nombre")); 
            nuevoCliente.setTelefono((String) request.get("numeroTelefono"));
            String tarjetaLimpia = ((String) request.get("numeroTarjeta")).replace(" ", "");
nuevoCliente.setNoTarjeta(tarjetaLimpia);

            Cliente clienteGuardado = clienteRepository.save(nuevoCliente);

            System.out.println("✓ Servidor Central: Cliente '" + clienteGuardado.getNombreCompleto() + "' guardado.");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            
            // USAMOS LOS GETTERS DE LOMBOK CORRECTOS
            response.put("id", clienteGuardado.getIdCliente());
            response.put("nombre", clienteGuardado.getNombreCompleto());
            response.put("telefono", clienteGuardado.getTelefono());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("✗ Error al registrar cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}