package mx.ipn.escom.crypto.servidor_central.repository;
import mx.ipn.escom.crypto.servidor_central.entity.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
<<<<<<< Updated upstream
	Empleado findByNombreCompleto(String nombreCompleto);
}
=======
    
    Empleado findByNombreCompleto(String nombreCompleto);
    
}
>>>>>>> Stashed changes
