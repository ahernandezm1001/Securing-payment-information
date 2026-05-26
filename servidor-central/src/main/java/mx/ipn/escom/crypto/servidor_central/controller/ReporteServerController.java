package mx.ipn.escom.crypto.servidor_central.controller;

import mx.ipn.escom.crypto.servidor_central.entity.DetalleTicket;
import mx.ipn.escom.crypto.servidor_central.entity.Empleado;
import mx.ipn.escom.crypto.servidor_central.entity.ReporteFirmado;
import mx.ipn.escom.crypto.servidor_central.entity.Ticket;
import mx.ipn.escom.crypto.servidor_central.repository.DetalleTicketRepository;
import mx.ipn.escom.crypto.servidor_central.repository.EmpleadoRepository;
import mx.ipn.escom.crypto.servidor_central.repository.ReporteFirmadoRepository;
import mx.ipn.escom.crypto.servidor_central.repository.TicketRepository;
import mx.ipn.escom.crypto.servidor_central.service.DecryptionService;
import mx.ipn.escom.crypto.servidor_central.service.KeyExchangeService;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.security.KeyFactory;
import java.security.Signature;
import java.util.Base64;
import java.util.Optional;


@RestController
@RequestMapping("/api/server/reportes")
public class ReporteServerController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private DetalleTicketRepository detalleTicketRepository;

    @Autowired
    private ReporteFirmadoRepository reporteFirmadoRepository;

    //Inyectamos los servicios de criptografía y JSON
    @Autowired
    private DecryptionService decryptionService;

    @Autowired
    private KeyExchangeService keyExchangeService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @GetMapping("/ventas")
    public ResponseEntity<List<Map<String, Object>>> obtenerVentasDelMes(
            @RequestParam("anio") int anio,
            @RequestParam("mes") int mes,
            @RequestParam("idEmpleado") Long idEmpleado) { 

        try {
            YearMonth yearMonth = YearMonth.of(anio, mes);
            LocalDateTime inicioMes = yearMonth.atDay(1).atStartOfDay();
            LocalDateTime finMes = yearMonth.atEndOfMonth().atTime(23, 59, 59, 999999);

            List<Ticket> tickets = ticketRepository.findByEmpleado_IdEmpleadoAndFechaVentaBetween(idEmpleado, inicioMes, finMes);

            List<Map<String, Object>> ventasReact = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            for (Ticket t : tickets) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", t.getIdTicket());
                map.put("fecha", t.getFechaVenta().format(formatter)); 
                map.put("monto", t.getMontoTotal());

                List<DetalleTicket> detalles = detalleTicketRepository.findByTicket(t);
                String productosStr = detalles.stream()
                        .map(d -> d.getCantidad() + "x " + d.getProducto().getDescripcion())
                        .collect(Collectors.joining(", "));
                
                map.put("productos", productosStr.isEmpty() ? "Sin detalles" : productosStr);

                ventasReact.add(map);
            }

            return ResponseEntity.ok(ventasReact);

        } catch (Exception e) {
            System.err.println("✗ Error al generar reporte: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/guardar-firmado")
    public ResponseEntity<String> guardarReporteFirmado(@RequestBody Map<String, Object> sobreSeguro) {
        try {
            System.out.println("LLEGÓ AL 8080 -> Recibiendo paquete seguro AES-GCM...");

            // 1. Leemos ÚNICAMENTE las etiquetas públicas de afuera del sobre
            String deviceId = (String) sobreSeguro.get("deviceId");
            String payloadEncriptado = (String) sobreSeguro.get("payloadEncriptado");
            

            // 2. Buscamos la llave AES usando el deviceId en tu KeyExchangeService
            byte[] llaveAes = keyExchangeService.getClientKey(deviceId);
            if (llaveAes == null) {
                System.err.println("❌ No se encontró llave AES para el dispositivo: " + deviceId);
                return ResponseEntity.status(401).body("Error de seguridad: Sesión no válida.");
            }

            // 3. ¡LA MAGIA! Desencriptamos el contenido
            String jsonDesencriptado = decryptionService.decrypt(payloadEncriptado, llaveAes);
            System.out.println("¡Paquete desencriptado con éxito!");

            // 4. Convertimos el JSON de texto a un Map para poder usar los datos
            Map<String, Object> payload = objectMapper.readValue(jsonDesencriptado, new TypeReference<Map<String, Object>>(){});

            // 5. Ahora sí, extraemos los datos que venían ocultos y seguros
            Number idEmpleadoNum = (Number) payload.get("idEmpleado");
            Long idEmpleado = idEmpleadoNum.longValue();
            Number totalVentas = (Number) payload.get("totalVentas");
            Number montoTotal = (Number) payload.get("montoTotal");
            String periodo = (String) payload.get("periodo");
            String cadenaOriginal = (String) payload.get("cadenaOriginal");
            String firmaDigital = (String) payload.get("firmaDigital");
            String detallesVentas = (String) payload.get("detallesVentas");

            var reporteExistente = reporteFirmadoRepository.findByIdEmpleadoAndPeriodo(idEmpleado, periodo);
            ReporteFirmado reporteAGuardar;

            if (reporteExistente.isPresent()) {
                System.out.println("Reporte de " + periodo + " ya existe. Actualizando datos y nueva firma...");
                reporteAGuardar = reporteExistente.get(); 
            } else {
                System.out.println("Creando nuevo registro de reporte para " + periodo + "...");
                reporteAGuardar = new ReporteFirmado(); 
                reporteAGuardar.setIdEmpleado(idEmpleado);
                reporteAGuardar.setPeriodo(periodo);
            }

            reporteAGuardar.setTotalVentas(totalVentas.intValue());
            reporteAGuardar.setMontoTotal(montoTotal.doubleValue());
            reporteAGuardar.setCadenaOriginal(cadenaOriginal);
            reporteAGuardar.setFirmaDigital(firmaDigital);
            reporteAGuardar.setFechaCreacion(LocalDateTime.now()); 
            reporteAGuardar.setDetallesVentas(detallesVentas);

            reporteFirmadoRepository.save(reporteAGuardar);

            System.out.println("Reporte ECDSA procesado y guardado exitosamente en la BD.");
            
            return ResponseEntity.ok("El reporte firmado de " + periodo + " se ha guardado de forma segura en el sistema.");

        } catch (Exception e) {
            System.err.println("Error procesando el reporte seguro: " + e.getMessage());
            e.printStackTrace(); // Para ver exactamente en qué línea falló si hay otro error
            return ResponseEntity.badRequest().body("Ocurrió un error al intentar guardar el reporte cifrado.");
        }
        
    }
    @GetMapping("/todos")
    public ResponseEntity<List<Map<String, Object>>> obtenerTodosLosReportes() {
        try {
            System.out.println("LLEGÓ AL 8080 -> Solicitando lista global de reportes...");
            List<ReporteFirmado> reportes = reporteFirmadoRepository.findAll();
            List<Map<String, Object>> respuesta = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (ReporteFirmado r : reportes) {
                Map<String, Object> map = new HashMap<>();
                map.put("idReporte", r.getIdReporte());
                map.put("periodo", r.getPeriodo());
                map.put("totalVentas", r.getTotalVentas());
                map.put("montoTotal", r.getMontoTotal());
                map.put("detallesVentas", r.getDetallesVentas());
                
                // Formateamos la fecha si existe
                if (r.getFechaCreacion() != null) {
                    map.put("fechaSubida", r.getFechaCreacion().format(formatter));
                } else {
                    map.put("fechaSubida", "Desconocida");
                }

                // Buscamos el nombre del empleado
                var empleadoOpt = empleadoRepository.findById(r.getIdEmpleado());
                map.put("nombreEmpleado", empleadoOpt.isPresent() ? empleadoOpt.get().getNombreCompleto() : "Empleado Eliminado/Desconocido");

                // Mandamos la firma y cadena para la futura validación
                map.put("cadenaOriginal", r.getCadenaOriginal());
                map.put("firmaDigital", r.getFirmaDigital());

                respuesta.add(map);
            }

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            System.err.println("❌ Error obteniendo la lista de reportes: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    @PostMapping("/verificar/{idReporte}")
    public ResponseEntity<Map<String, Object>> verificarFirma(@PathVariable Long idReporte) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("LLEGÓ AL 8080 -> Verificando matemáticamente el reporte #" + idReporte);

            // 1. Buscamos el reporte
            var reporteOpt = reporteFirmadoRepository.findById(idReporte);
            if (!reporteOpt.isPresent()) {
                response.put("valido", false);
                response.put("message", "El reporte no existe en la base de datos.");
                return ResponseEntity.badRequest().body(response);
            }
            ReporteFirmado reporte = reporteOpt.get();

            // 2. Buscamos al empleado para obtener su LLAVE PÚBLICA
            var empleadoOpt = empleadoRepository.findById(reporte.getIdEmpleado());
            if (!empleadoOpt.isPresent()) {
                response.put("valido", false);
                response.put("message", "El empleado asociado no existe o fue eliminado.");
                return ResponseEntity.badRequest().body(response);
            }
            Empleado empleado = empleadoOpt.get();

            // 3. Verificación ECDSA con Bouncy Castle
            byte[] publicBytes = Base64.getDecoder().decode(empleado.getLlavePublica());
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("ECDSA", "BC");
            PublicKey publicKey = keyFactory.generatePublic(keySpec);

            Signature signature = Signature.getInstance("SHA256withECDSA", "BC");
            signature.initVerify(publicKey);
            
            // Le pasamos la cadena original que está en la BD
            signature.update(reporte.getCadenaOriginal().getBytes("UTF-8"));
            
            // Verificamos contra la firma digital
            byte[] signatureBytes = Base64.getDecoder().decode(reporte.getFirmaDigital());
            boolean isValido = signature.verify(signatureBytes);

            if (isValido) {
                System.out.println(" VERIFICACIÓN EXITOSA: La firma coincide.");
                response.put("valido", true);
                response.put("message", "VERIFICACIÓN EXITOSA: La firma es auténtica, el empleado es el autor real y el documento no ha sido alterado.");
            } else {
                System.out.println(" ALERTA: La firma no coincide con el documento.");
                response.put("valido", false);
                response.put("message", "ALERTA CRÍTICA: La firma es inválida. El documento pudo haber sido alterado o no pertenece a este empleado.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("valido", false);
            response.put("message", "Error técnico al procesar la criptografía: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}