package mx.ipn.escom.crypto.terminal_empleado.controller;

import mx.ipn.escom.crypto.terminal_empleado.dto.ReporteFirmaDto;
import mx.ipn.escom.crypto.terminal_empleado.service.FirmaDigitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "http://localhost:5173")
public class ReporteTerminalController {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // Rutas hacia el Servidor Central (8080)
    private final String SERVER_URL_VENTAS = "http://localhost:8080/api/server/reportes/ventas";
    private final String SERVER_URL_FIRMA = "http://localhost:8080/api/server/reportes/guardar-firmado";

    @Autowired
    private FirmaDigitalService firmaDigitalService;

    // --- 1. MÉTODO PARA OBTENER LAS VENTAS (Llena la tabla de React) ---
    @GetMapping("/ventas")
    public ResponseEntity<?> obtenerVentas(
            @RequestParam("anio") int anio, 
            @RequestParam("mes") int mes,
            @RequestParam("idEmpleado") Long idEmpleado) {
        try {
            // Reenviamos la petición al Servidor Central
            String urlConParametros = SERVER_URL_VENTAS + "?anio=" + anio + "&mes=" + mes + "&idEmpleado=" + idEmpleado;
            ResponseEntity<List> response = restTemplate.getForEntity(urlConParametros, List.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            System.err.println("Error conectando al Servidor Central: " + e.getMessage());
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    // --- 2. MÉTODO PARA FIRMAR Y ENVIAR EL REPORTE  ---
    @PostMapping("/firmar")
    public ResponseEntity<?> firmarYEnviarReporte(@RequestBody ReporteFirmaDto dto) {
        try {
            // 1. Armamos la Cadena Original (Lo que se va a firmar)
            String cadenaOriginal = firmaDigitalService.generarCadenaOriginal(
                    dto.getIdEmpleado(), 
                    dto.getPeriodo(), 
                    dto.getTotalVentas(), 
                    dto.getMontoTotal()
            );

            System.out.println("Cifrando cadena original: " + cadenaOriginal);

            // 2. Generamos la firma usando la llave privada del empleado
            String firmaDigital = firmaDigitalService.firmarECDSA(cadenaOriginal, dto.getLlavePrivada());

            System.out.println("¡Firma ECDSA generada exitosamente!");

            // 3. Preparamos el paquete seguro para el Servidor Central (8080)
            Map<String, Object> payloadParaServidorCentral = new HashMap<>();
            payloadParaServidorCentral.put("idEmpleado", dto.getIdEmpleado());
            payloadParaServidorCentral.put("periodo", dto.getPeriodo());
            payloadParaServidorCentral.put("totalVentas", dto.getTotalVentas());
            payloadParaServidorCentral.put("montoTotal", dto.getMontoTotal());
            payloadParaServidorCentral.put("cadenaOriginal", cadenaOriginal);
            payloadParaServidorCentral.put("firmaDigital", firmaDigital);

            // 4. Lo enviamos por la red al Servidor Central
            ResponseEntity<String> response = restTemplate.postForEntity(
                    SERVER_URL_FIRMA, 
                    payloadParaServidorCentral, 
                    String.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al generar la firma digital: Verifica que el archivo .key sea válido.");
        }
    }
}