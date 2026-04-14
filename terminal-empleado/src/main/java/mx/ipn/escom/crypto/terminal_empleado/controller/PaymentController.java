package mx.ipn.escom.crypto.terminal_empleado.controller;

import mx.ipn.escom.crypto.terminal_empleado.dto.TicketDto;
import mx.ipn.escom.crypto.terminal_empleado.service.SecurePaymentClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private SecurePaymentClientService securePaymentClientService;

    @PostMapping("/test-send")
    public ResponseEntity<String> testSendTicket(@RequestBody TicketDto ticketDto) {
        try {
            // Llamamos al servicio que se encarga de cifrar y enviar por red al servidor
            securePaymentClientService.sendSecureTicket(ticketDto);
            
            return ResponseEntity.ok("Ticket procesado, cifrado y enviado al servidor con éxito");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al enviar el ticket: " + e.getMessage());
        }
    }
}