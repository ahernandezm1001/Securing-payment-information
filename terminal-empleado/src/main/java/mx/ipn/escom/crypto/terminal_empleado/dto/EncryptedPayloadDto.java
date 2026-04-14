package mx.ipn.escom.crypto.terminal_empleado.dto;

public class EncryptedPayloadDto {
    
    private String deviceId;
    private String encryptedData; // Aquí va el IV + JSON cifrado en Base64

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getEncryptedData() {
        return encryptedData;
    }

    public void setEncryptedData(String encryptedData) {
        this.encryptedData = encryptedData;
    }
}