package mx.ipn.escom.crypto.servidor_central.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "reportes_firmados")
@Data
public class ReporteFirmado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte")
    private Long idReporte;

    @Column(name = "id_empleado", nullable = false)
    private Long idEmpleado;

    @Column(name = "periodo", nullable = false, length = 50)
    private String periodo;

    @Column(name = "total_ventas")
    private Integer totalVentas;

    @Column(name = "monto_total")
    private Double montoTotal;

    @Column(name = "cadena_original", columnDefinition = "TEXT", nullable = false)
    private String cadenaOriginal;

    @Column(name = "firma_digital", columnDefinition = "TEXT", nullable = false)
    private String firmaDigital;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}