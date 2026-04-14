package mx.ipn.escom.crypto.servidor_central.repository;
import mx.ipn.escom.crypto.servidor_central.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {}
