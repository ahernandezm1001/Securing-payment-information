package mx.ipn.escom.crypto.terminal_empleado.controller;

import mx.ipn.escom.crypto.terminal_empleado.dto.TicketDto;
import mx.ipn.escom.crypto.terminal_empleado.service.SecurePaymentClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private SecurePaymentClientService securePaymentClientService;

    @PostMapping("/test-send")
    public ResponseEntity<Map<String, Object>> testSendTicket(@RequestBody TicketDto ticketDto) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Llamamos al servicio que se encarga de cifrar y enviar por red al servidor
            securePaymentClientService.sendSecureTicket(ticketDto);
            
            response.put("success", true);
            response.put("message", "Ticket procesado, cifrado y enviado al servidor con éxito");
            response.put("montoTotal", ticketDto.getMontoTotal());
            
            System.out.println("✓ Ticket procesado exitosamente: $" + ticketDto.getMontoTotal());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            
            response.put("success", false);
            response.put("message", "Error al enviar el ticket");
            response.put("error", e.getMessage());
            
            System.err.println("✗ Error al procesar ticket: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
}