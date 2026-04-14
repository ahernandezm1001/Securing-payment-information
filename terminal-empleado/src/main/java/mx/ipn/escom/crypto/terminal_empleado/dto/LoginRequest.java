package mx.ipn.escom.crypto.terminal_empleado.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
    private String deviceId; // Ejemplo: "terminal-001"
}