/* 
package mx.ipn.escom.crypto.terminal_empleado.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // Ruta hacia el Servidor Central (Puerto 8080)
    private final String SERVER_REPORT_URL = "http://localhost:8080/api/server/reportes/recibir";

    @PostMapping("/generar")
    public ResponseEntity<Map<String, Object>> generarReporte(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Nota: Aquí es donde generaruamos la firma digital (RSA) de los datos antes de enviarlos
            // request.put("firma", firmaGenerada);

            // Mandar petición POST directa al Servidor Central
            ResponseEntity<Map> serverResponse = restTemplate.postForEntity(
                    SERVER_REPORT_URL, 
                    request, 
                    Map.class
            );

            if (serverResponse.getStatusCode().is2xxSuccessful()) {
                response.put("success", true);
                response.put("message", "Reporte firmado y enviado al servidor central con éxito.");
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            System.err.println("✗ Error al enviar el reporte: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Fallo al enviar el reporte al servidor central.");
            return ResponseEntity.status(500).body(response);
        }
        
        return ResponseEntity.internalServerError().build();
    }
}*/