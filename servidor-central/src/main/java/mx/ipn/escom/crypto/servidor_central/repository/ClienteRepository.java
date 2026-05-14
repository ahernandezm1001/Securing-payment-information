package mx.ipn.escom.crypto.servidor_central.repository;

import mx.ipn.escom.crypto.servidor_central.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    // Búsqueda por número de tarjeta (Te servirá más adelante para el Admin)
    Cliente findByNoTarjeta(String noTarjeta);

    // Búsqueda por teléfono (La que usa tu ClienteServerController actual)
    // Usamos Optional para poder verificar fácilmente con .isPresent() si el cliente existe
    Optional<Cliente> findByTelefono(String telefono);
    
}