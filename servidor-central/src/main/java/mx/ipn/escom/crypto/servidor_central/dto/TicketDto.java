package mx.ipn.escom.crypto.servidor_central.dto;

import java.math.BigDecimal;
import java.util.List;

public class TicketDto {
    
    private Long idCliente;
    private Long idEmpleado;
    private String noTarjetaPago;
    private BigDecimal montoTotal;
    private List<DetalleTicketDto> detalles;
    private String tarjetaFpe;
    private String nombreCliente;

    // Getters y Setters
    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public Long getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Long idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getNoTarjetaPago() {
        return noTarjetaPago;
    }

    public void setNoTarjetaPago(String noTarjetaPago) {
        this.noTarjetaPago = noTarjetaPago;
    }

    public BigDecimal getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(BigDecimal montoTotal) {
        this.montoTotal = montoTotal;
    }

    public List<DetalleTicketDto> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleTicketDto> detalles) {
        this.detalles = detalles;
    }
    public String getTarjetaFpe() { 
        return tarjetaFpe; 
    }
    
    public String getNombreCliente() { 
        return nombreCliente; 
    }
}