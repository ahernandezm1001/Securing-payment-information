package mx.ipn.escom.crypto.servidor_central.repository;

import mx.ipn.escom.crypto.servidor_central.entity.ReporteFirmado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReporteFirmadoRepository extends JpaRepository<ReporteFirmado, Long> {
    
    // Busca si este empleado en específico ya tiene un reporte para este periodo
    Optional<ReporteFirmado> findByIdEmpleadoAndPeriodo(Long idEmpleado, String periodo);
}