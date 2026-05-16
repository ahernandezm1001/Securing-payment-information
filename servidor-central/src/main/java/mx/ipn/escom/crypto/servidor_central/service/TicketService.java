package mx.ipn.escom.crypto.servidor_central.service;

import mx.ipn.escom.crypto.servidor_central.dto.DetalleTicketDto;
import mx.ipn.escom.crypto.servidor_central.dto.TicketDto;
import mx.ipn.escom.crypto.servidor_central.entity.*;
import mx.ipn.escom.crypto.servidor_central.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private DetalleTicketRepository detalleTicketRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private FpeService fpeService;

    
    @Transactional
    public Ticket crearTicket(TicketDto ticketDto) {
        
        // 1. Cifrar la tarjeta con FPE
        String encryptedCard = fpeService.encrypt(ticketDto.getNoTarjetaPago());

        // 2. Validar Cliente y Empleado 
        Cliente cliente = clienteRepository.findById(ticketDto.getIdCliente())
                 .orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + ticketDto.getIdCliente()));
        
        Empleado empleado = empleadoRepository.findById(ticketDto.getIdEmpleado())
                 .orElseThrow(() -> new RuntimeException("Empleado no encontrado con ID: " + ticketDto.getIdEmpleado()));

        // 3. Crear y GUARDAR el Ticket en la BD
        Ticket ticket = new Ticket();
        ticket.setCliente(cliente);
        ticket.setEmpleado(empleado);
        ticket.setNoTarjetaPago(encryptedCard); // Guardamos la versión cifrada
        ticket.setMontoTotal(ticketDto.getMontoTotal());
        
        // Ahora sí lo guardamos en PostgreSQL para que genere su ID real
        Ticket ticketGuardado = ticketRepository.save(ticket);

        // 4. Procesar Detalles y RESTAR INVENTARIO
        if (ticketDto.getDetalles() != null && !ticketDto.getDetalles().isEmpty()) {
            List<DetalleTicket> detallesAGuardar = new ArrayList<>();
            
            for (DetalleTicketDto dtoDetalle : ticketDto.getDetalles()) {
                Producto producto = productoRepository.findById(dtoDetalle.getIdProducto())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + dtoDetalle.getIdProducto()));

               
                if (producto.getStock() < dtoDetalle.getCantidad()) {
                    // Si no hay stock, esto interrumpe todo y borra el ticket que acabamos de crear arriba
                    throw new RuntimeException("Stock insuficiente para: " + producto.getDescripcion());
                }
                
                
                producto.setStock(producto.getStock() - dtoDetalle.getCantidad());
                
                // Actualizamos el producto en la BD
                productoRepository.save(producto);
                
                // Preparamos el detalle de la nota de venta
                DetalleTicket detalle = new DetalleTicket();
                detalle.setTicket(ticketGuardado); // Lo asociamos al ticket real de la BD
                detalle.setProducto(producto);
                detalle.setCantidad(dtoDetalle.getCantidad());
                detalle.setPrecioUnitario(dtoDetalle.getPrecioUnitario());
                
                detallesAGuardar.add(detalle);
            }
            
            // Guardamos todos los productos comprados de un solo golpe
            detalleTicketRepository.saveAll(detallesAGuardar);
        }

        // Logs para comprobar visualmente que todo fue un éxito
        System.out.println("========== VENTA REGISTRADA CON ÉXITO ==========");
        System.out.println("Monto total cobrado: $" + ticketDto.getMontoTotal());
        System.out.println("Tarjeta protegida con FPE: " + encryptedCard);
        System.out.println("================================================");

        return ticketGuardado; 
    }
}