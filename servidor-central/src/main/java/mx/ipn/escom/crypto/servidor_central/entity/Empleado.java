package mx.ipn.escom.crypto.servidor_central.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "empleados")
@Data
public class Empleado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long idEmpleado;

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    // Relación inversa para ver qué tickets ha generado este empleado
    @OneToMany(mappedBy = "empleado")
    private List<Ticket> tickets;
}
