package mx.ipn.escom.crypto.servidor_central;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import jakarta.annotation.PostConstruct;
import java.security.Security;

@SpringBootApplication
public class ServidorCentralApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServidorCentralApplication.class, args);
    }
    @PostConstruct
    public void init() {
        // Esto registra a Bouncy Castle en el JCA de Java
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
            System.out.println(" Bouncy Castle Provider registrado correctamente en el Servidor.");
        }
    }
}
