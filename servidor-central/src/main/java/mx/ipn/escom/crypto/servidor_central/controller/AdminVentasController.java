package mx.ipn.escom.crypto.servidor_central.controller;

import mx.ipn.escom.crypto.servidor_central.entity.DetalleTicket;
import mx.ipn.escom.crypto.servidor_central.entity.Ticket;
import mx.ipn.escom.crypto.servidor_central.repository.DetalleTicketRepository;
import mx.ipn.escom.crypto.servidor_central.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/server/admin/ventas")
public class AdminVentasController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private DetalleTicketRepository detalleTicketRepository;

    // --- 1. OBTENER LISTA DE CLIENTES CON ESTADÍSTICAS ---
    @GetMapping("/clientes")
    public ResponseEntity<List<Map<String, Object>>> obtenerClientesReales() {
        try {
            List<Ticket> todosLosTickets = ticketRepository.findAll();
            Map<String, Map<String, Object>> estadisticasClientes = new HashMap<>();
            
            for (Ticket t : todosLosTickets) {
                // Usamos los nombres reales de tus entidades
                String tarjeta = t.getNoTarjetaPago();
                
                // Navegamos la relación al Cliente para sacar su nombre
                String nombre = (t.getCliente() != null) ? t.getCliente().getNombreCompleto() : "Desconocido"; 
                
                // Convertimos tu BigDecimal a double para hacer las sumas
                double montoTicket = t.getMontoTotal().doubleValue();

                if (tarjeta != null) {
                    if (!estadisticasClientes.containsKey(tarjeta)) {
                        Map<String, Object> stats = new HashMap<>();
                        stats.put("id", t.getIdTicket());
                        stats.put("nombre", nombre);
                        stats.put("tarjeta", tarjeta);
                        stats.put("frecuencia", 1); 
                        stats.put("totalGastado", montoTicket); 
                        
                        estadisticasClientes.put(tarjeta, stats);
                    } else {
                        Map<String, Object> stats = estadisticasClientes.get(tarjeta);
                        
                        int frecuenciaActual = (int) stats.get("frecuencia");
                        stats.put("frecuencia", frecuenciaActual + 1);
                        
                        double gastoActual = (double) stats.get("totalGastado");
                        stats.put("totalGastado", gastoActual + montoTicket);
                    }
                }
            }
            
            return ResponseEntity.ok(new ArrayList<>(estadisticasClientes.values()));
        } catch (Exception e) {
            System.err.println("❌ Error analizando estadísticas: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- 2. OBTENER EL HISTORIAL REAL BUSCANDO POR EL TOKEN FPE ---
    @GetMapping("/historial/{tarjetaFpe}")
    public ResponseEntity<List<Map<String, Object>>> obtenerHistorialPorTarjeta(@PathVariable String tarjetaFpe) {
        try {
            // Usamos el nuevo método del repositorio
            List<Ticket> ticketsDelCliente = ticketRepository.findByNoTarjetaPago(tarjetaFpe);
            List<Map<String, Object>> historial = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy - HH:mm 'hrs'");

            for (Ticket t : ticketsDelCliente) {
                Map<String, Object> venta = new HashMap<>();
                venta.put("id", t.getIdTicket());
                
                if (t.getFechaVenta() != null) {
                    venta.put("fecha", t.getFechaVenta().format(formatter));
                } else {
                    venta.put("fecha", "Fecha no registrada");
                }
                
                venta.put("total", t.getMontoTotal().doubleValue());

                List<DetalleTicket> detalles = detalleTicketRepository.findByTicket(t);
                List<Map<String, Object>> listaProductos = new ArrayList<>();
                
                for (DetalleTicket d : detalles) {
                    Map<String, Object> productoMap = new HashMap<>();
                    
                    productoMap.put("nombre", d.getCantidad() + "x " + d.getProducto().getDescripcion());
                    
                    // Calculamos el subtotal al vuelo (cantidad * precioUnitario)
                    double subtotal = d.getCantidad() * d.getPrecioUnitario().doubleValue();
                    productoMap.put("precio", subtotal); 
                    
                    listaProductos.add(productoMap);
                }
                
                venta.put("productos", listaProductos);
                historial.add(venta);
            }

            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo historial: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}