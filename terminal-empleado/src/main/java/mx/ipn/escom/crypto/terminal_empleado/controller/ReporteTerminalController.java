package mx.ipn.escom.crypto.terminal_empleado.controller;

import mx.ipn.escom.crypto.terminal_empleado.dto.EncryptedPayloadDto;
import mx.ipn.escom.crypto.terminal_empleado.dto.ReporteFirmaDto;
import mx.ipn.escom.crypto.terminal_empleado.service.EncryptionService;
import mx.ipn.escom.crypto.terminal_empleado.service.FirmaDigitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import mx.ipn.escom.crypto.terminal_empleado.service.HandshakeClientService;

import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final String SERVER_URL_TODOS = "http://localhost:8080/api/server/reportes/todos";
    private final String SERVER_URL_VERIFICAR = "http://localhost:8080/api/server/reportes/verificar/";
    
    @Autowired
    private FirmaDigitalService firmaDigitalService;

    @Autowired 
    private EncryptionService encryptionService;

    @Autowired 
    private ObjectMapper objectMapper;

    @Autowired
    private HandshakeClientService handshakeService;

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
                    dto.getIdEmpleado(), dto.getPeriodo(), dto.getTotalVentas(), dto.getMontoTotal(), dto.getDetallesVentas()
            );

            System.out.println("Cifrando cadena original: " + cadenaOriginal);

            // 2. Generamos la firma usando la llave privada del empleado
            String firmaDigital = firmaDigitalService.firmarECDSA(cadenaOriginal, dto.getLlavePrivada());

            System.out.println("¡Firma ECDSA generada exitosamente!");

            // 2. Obtenemos la llave AES 
            byte[] llaveAesEfimera = handshakeService.getSessionAesKey();
            
            // Validación de seguridad: Si no hay llave, los sacamos
            if (llaveAesEfimera == null) {
                return ResponseEntity.status(401).body("Error de seguridad: No hay sesión AES activa. Por favor, vuelva a iniciar sesión.");
            }

            // 3. Preparamos el paquete seguro para el Servidor Central (8080)
            Map<String, Object> payloadParaServidorCentral = new HashMap<>();
            payloadParaServidorCentral.put("idEmpleado", dto.getIdEmpleado());
            payloadParaServidorCentral.put("periodo", dto.getPeriodo());
            payloadParaServidorCentral.put("totalVentas", dto.getTotalVentas());
            payloadParaServidorCentral.put("montoTotal", dto.getMontoTotal());
            payloadParaServidorCentral.put("cadenaOriginal", cadenaOriginal);
            payloadParaServidorCentral.put("firmaDigital", firmaDigital);
            payloadParaServidorCentral.put("detallesVentas", dto.getDetallesVentas());
            // 4. Convertimos a JSON y ENCRIPTAMOS con AES-GCM
            String jsonPlano = objectMapper.writeValueAsString(payloadParaServidorCentral);
            String payloadEncriptadoBase64 = encryptionService.encrypt(jsonPlano, llaveAesEfimera);

            // 5. Armamos el sobre que viaja por la red (ID público, Datos privados)
            Map<String, Object> paqueteSeguro = new HashMap<>();
            paqueteSeguro.put("idEmpleado", payloadParaServidorCentral.get("idEmpleado")); // Este ID es público, no es sensible
            paqueteSeguro.put("deviceId", "terminal-001");
            paqueteSeguro.put("payloadEncriptado", payloadEncriptadoBase64);

            // 6. Enviamos el sobre cifrado al Servidor Central (8080)
            ResponseEntity<String> response = restTemplate.postForEntity(
                    SERVER_URL_FIRMA,
                    paqueteSeguro, 
                    String.class
            );
            
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al generar la firma digital: Verifica que el archivo .key sea válido.");
        }
    }
    // --- 3. MÉTODO PARA EL ADMIN: VER TODOS LOS REPORTES ---
    @GetMapping("/todos")
    public ResponseEntity<?> obtenerTodosLosReportes() {
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(SERVER_URL_TODOS, List.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            System.err.println("Error conectando al Servidor Central para reportes: " + e.getMessage());
            return ResponseEntity.internalServerError().body(List.of());
        }
    }
    @PostMapping("/verificar/{idReporte}")
    public ResponseEntity<?> verificarFirma(@PathVariable Long idReporte) {
        try {
            String urlConId = SERVER_URL_VERIFICAR + idReporte;
            // Hacemos el POST al 8080
            ResponseEntity<Map> response = restTemplate.postForEntity(urlConId, null, Map.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            System.err.println("Error conectando al Servidor Central para verificar: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("valido", false, "message", "No se pudo conectar con el servidor central."));
        }
    }
}