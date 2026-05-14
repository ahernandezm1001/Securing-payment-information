package mx.ipn.escom.crypto.terminal_empleado.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "http://localhost:5173")
public class ClienteController {

    private final RestTemplate restTemplate = new RestTemplate(); 
    
    // Ruta base del Servidor Central (8080)
    private final String SERVER_URL = "http://localhost:8080/api/server/clientes";

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarCliente(@RequestParam String telefono) {
        try {
            // 1. Al ser una búsqueda, usamos GET y le pegamos el teléfono a la URL
            String urlBusqueda = SERVER_URL + "/buscar?telefono=" + telefono;
            
            ResponseEntity<Map> serverResponse = restTemplate.getForEntity(
                    urlBusqueda, 
                    Map.class
            );

            // 2. Si el servidor central lo encuentra, devolvemos el cliente a React
            return ResponseEntity.status(serverResponse.getStatusCode()).body(serverResponse.getBody());
            
        } catch (Exception e) {
            // 3. Si el servidor central no lo encuentra (lanza 404), RestTemplate dispara un error.
            // Lo atrapamos aquí y le avisamos a React que el cliente no existe.
            return ResponseEntity.status(404).body(Map.of("message", "Cliente no encontrado"));
        }
    }

   @PostMapping("/registrar")
    public ResponseEntity<?> registrarCliente(@RequestBody Map<String, Object> request) {
        // ESTA LÍNEA ES PARA DEBUGEAR
        System.out.println("RECIBIENDO DE REACT: " + request); 

        try {
            String urlRegistro = "http://localhost:8080/api/server/clientes/registrar";
            ResponseEntity<Map> serverResponse = restTemplate.postForEntity(urlRegistro, request, Map.class);
            return ResponseEntity.status(serverResponse.getStatusCode()).body(serverResponse.getBody());
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}