package mx.ipn.escom.crypto.terminal_empleado.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173") // O el puerto de tu React
public class ProductoController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String SERVER_URL = "http://localhost:8080/api/server/productos";

    @GetMapping
    public ResponseEntity<?> obtenerProductos() {
        try {
            // Le pide la lista de productos al Servidor Central
            ResponseEntity<List> response = restTemplate.getForEntity(SERVER_URL, List.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            System.err.println("✗ Error al obtener catálogo: " + e.getMessage());
            return ResponseEntity.internalServerError().body(List.of()); // Si falla, devuelve lista vacía
        }
    }
}