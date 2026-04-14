package mx.ipn.escom.crypto.servidor_central.repository;

import mx.ipn.escom.crypto.servidor_central.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}