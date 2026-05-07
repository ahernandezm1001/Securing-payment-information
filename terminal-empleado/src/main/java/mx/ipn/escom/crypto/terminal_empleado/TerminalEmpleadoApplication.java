package mx.ipn.escom.crypto.terminal_empleado;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration; // <-- 1. NUEVO IMPORT
import jakarta.annotation.PostConstruct;
import java.security.Security;


@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class}) 
public class TerminalEmpleadoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TerminalEmpleadoApplication.class, args);
    }

    @PostConstruct
    public void init() {
        // Esto registra a Bouncy Castle en el JCA de Java
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
            System.out.println(" Bouncy Castle Provider registrado correctamente en la Terminal Empleado.");
        }
    }
}