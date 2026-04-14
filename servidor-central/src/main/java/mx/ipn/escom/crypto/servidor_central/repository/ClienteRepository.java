package mx.ipn.escom.crypto.servidor_central.repository;
import mx.ipn.escom.crypto.servidor_central.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Repositorio para Clientes
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Cliente findByNoTarjeta(String noTarjeta);
}