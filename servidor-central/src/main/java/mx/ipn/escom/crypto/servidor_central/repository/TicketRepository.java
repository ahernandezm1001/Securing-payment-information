package mx.ipn.escom.crypto.servidor_central.repository;

import mx.ipn.escom.crypto.servidor_central.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    // Spring Boot arma la consulta: SELECT * FROM tickets WHERE empleado_id = ? AND fecha BETWEEN ? AND ?
    List<Ticket> findByEmpleado_IdEmpleadoAndFechaVentaBetween(Long idEmpleado, LocalDateTime inicio, LocalDateTime fin);

    List<Ticket> findByNoTarjetaPago(String noTarjetaPago);
}