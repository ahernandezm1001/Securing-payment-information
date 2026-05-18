package mx.ipn.escom.crypto.servidor_central.repository;

import mx.ipn.escom.crypto.servidor_central.entity.DetalleTicket;
import mx.ipn.escom.crypto.servidor_central.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleTicketRepository extends JpaRepository<DetalleTicket, Long> {
    // Trae todos los productos comprados dentro de un ticket específico
    List<DetalleTicket> findByTicket(mx.ipn.escom.crypto.servidor_central.entity.Ticket ticket);
}