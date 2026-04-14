package mx.ipn.escom.crypto.servidor_central.repository;

import mx.ipn.escom.crypto.servidor_central.entity.DetalleTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleTicketRepository extends JpaRepository<DetalleTicket, Long> {
}