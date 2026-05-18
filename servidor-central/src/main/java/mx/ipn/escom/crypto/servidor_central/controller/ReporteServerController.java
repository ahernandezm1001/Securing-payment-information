package mx.ipn.escom.crypto.servidor_central.controller;

import mx.ipn.escom.crypto.servidor_central.entity.DetalleTicket;
import mx.ipn.escom.crypto.servidor_central.entity.Ticket;
import mx.ipn.escom.crypto.servidor_central.repository.DetalleTicketRepository;
import mx.ipn.escom.crypto.servidor_central.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/server/reportes")
public class ReporteServerController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private DetalleTicketRepository detalleTicketRepository;

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
}