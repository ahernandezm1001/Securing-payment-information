package mx.ipn.escom;

import java.security.MessageDigest;

public class PasswordHasher {

    // Este es el motor criptográfico que convierte el texto en Hash
    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(password.getBytes("UTF-8"));
            
            // Convertimos los bytes a texto Hexadecimal (muy común en bases de datos)
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error al hashear la contraseña", e);
        }
    }

    // Ejecuta este main para generar tus contraseñas de prueba
    public static void main(String[] args) {
        String miPassword = "1"; // Pon aquí la contraseña que quieras
        
        System.out.println("Contraseña en claro: " + miPassword);
        System.out.println("Copia este Hash y pégalo en tu Base de Datos:");
        System.out.println(hashPassword(miPassword));
        // Ejemplo para secreta123: 
        // 96d9632f363564cc3032521409cf22a852f2032eec099ed5967c0d000ce605a0
    }
}