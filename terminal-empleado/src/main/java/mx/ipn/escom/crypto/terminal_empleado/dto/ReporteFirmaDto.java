package mx.ipn.escom.crypto.terminal_empleado.dto;

public class ReporteFirmaDto {
    private Long idEmpleado;
    private String periodo; // Ej: "Mayo 2026"
    private Integer totalVentas; // Cuántos tickets se vendieron
    private Double montoTotal;
    private String llavePrivada; // El texto en Base64 del archivo .key
    private String detallesVentas;

    public Long getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Long idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getPeriodo() {
        return periodo;
    }

    public void setPeriodo(String periodo) {
        this.periodo = periodo;
    }

    public Integer getTotalVentas() {
        return totalVentas;
    }

    public void setTotalVentas(Integer totalVentas) {
        this.totalVentas = totalVentas;
    }

    public Double getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(Double montoTotal) {
        this.montoTotal = montoTotal;
    }

    public String getLlavePrivada() {
        return llavePrivada;
    }

    public void setLlavePrivada(String llavePrivada) {
        this.llavePrivada = llavePrivada;
    }
    public String getDetallesVentas() { return detallesVentas; }
    public void setDetallesVentas(String detallesVentas) { this.detallesVentas = detallesVentas; }
}