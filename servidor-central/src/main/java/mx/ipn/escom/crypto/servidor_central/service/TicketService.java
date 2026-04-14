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

        // 2. Validar y obtener Cliente y Empleado (COMENTADO PARA PRUEBAS)
        /* Cliente cliente = clienteRepository.findById(ticketDto.getIdCliente())
                 .orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + ticketDto.getIdCliente()));
         Empleado empleado = empleadoRepository.findById(ticketDto.getIdEmpleado())
                 .orElseThrow(() -> new RuntimeException("Empleado no encontrado con ID: " + ticketDto.getIdEmpleado())); */

        // 3. Crear el Ticket (Maestro) pero SIN GUARDARLO AÚN
        Ticket ticket = new Ticket();
        // ticket.setCliente(cliente);
        // ticket.setEmpleado(empleado);
        ticket.setNoTarjetaPago(encryptedCard); // Guardamos la versión cifrada
        ticket.setMontoTotal(ticketDto.getMontoTotal());
        
        // Ticket ticketGuardado = ticketRepository.save(ticket);

        // 4. Procesar y guardar los Detalles (COMENTADO PARA PRUEBAS)
        /* if (ticketDto.getDetalles() != null && !ticketDto.getDetalles().isEmpty()) {
            List<DetalleTicket> detallesAGuardar = new ArrayList<>();
            for (DetalleTicketDto dtoDetalle : ticketDto.getDetalles()) {
                Producto producto = productoRepository.findById(dtoDetalle.getIdProducto())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + dtoDetalle.getIdProducto()));

                DetalleTicket detalle = new DetalleTicket();
                detalle.setTicket(ticket); // Asociar al ticket en memoria
                detalle.setProducto(producto);
                detalle.setCantidad(dtoDetalle.getCantidad());
                detalle.setPrecioUnitario(dtoDetalle.getPrecioUnitario());
                detallesAGuardar.add(detalle);
            }
            // detalleTicketRepository.saveAll(detallesAGuardar);
        } */

        // Logs para comprobar visualmente que la info llegó y se procesó correctamente
        System.out.println("========== PRUEBA DE RECEPCIÓN SEGURA ==========");
        System.out.println("Monto total recibido en claro: " + ticketDto.getMontoTotal());
        System.out.println("Tarjeta original recibida: " + ticketDto.getNoTarjetaPago());
        System.out.println("Tarjeta tras aplicarle FPE: " + encryptedCard);
        System.out.println("Cantidad de productos (detalles): " + (ticketDto.getDetalles() != null ? ticketDto.getDetalles().size() : 0));
        System.out.println("================================================");

        return ticket; // Retornamos el ticket solo en memoria para que el controller pueda responder
    }
}