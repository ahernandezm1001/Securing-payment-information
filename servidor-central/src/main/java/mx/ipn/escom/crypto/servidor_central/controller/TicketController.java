package mx.ipn.escom.crypto.servidor_central.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.ipn.escom.crypto.servidor_central.entity.Cliente;
import mx.ipn.escom.crypto.servidor_central.entity.Empleado;
import mx.ipn.escom.crypto.servidor_central.entity.Ticket;
import mx.ipn.escom.crypto.servidor_central.repository.TicketRepository;
import mx.ipn.escom.crypto.servidor_central.service.DecryptionService;
import mx.ipn.escom.crypto.servidor_central.service.KeyExchangeService;
import mx.ipn.escom.crypto.servidor_central.service.TicketService;
import mx.ipn.escom.crypto.servidor_central.dto.EncryptedPayloadDto;
import mx.ipn.escom.crypto.servidor_central.dto.TicketDto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private KeyExchangeService keyExchangeService;

    @Autowired
    private DecryptionService decryptionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TicketService ticketService;

    @PostMapping("/secure-create")
    public ResponseEntity<String> createSecureTicket(@RequestBody EncryptedPayloadDto payload) {
        try {
            // 1. Obtener la llave AES correspondiente a la terminal que envía la petición
            byte[] aesKey = keyExchangeService.getClientKey(payload.getDeviceId());
            if (aesKey == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Llave de sesión no encontrada. Ejecute Handshake primero.");
            }

            // 2. Descifrar el payload (AES-GCM) para obtener la cadena JSON en claro
            String jsonTicket = decryptionService.decrypt(payload.getEncryptedData(), aesKey);

            // 3. Convertir la cadena JSON devuelta a un objeto TicketDto
            TicketDto ticketDto = objectMapper.readValue(jsonTicket, TicketDto.class);

            // 4. Delegar al servicio transaccional el cifrado (FPE) y guardado maestro-detalle
            Ticket ticketGuardado = ticketService.crearTicket(ticketDto);

            return ResponseEntity.ok("Ticket procesado exitosamente. Tarjeta protegida con FPE: " + ticketGuardado.getNoTarjetaPago());
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al procesar y guardar el ticket.");
        }
    }
}