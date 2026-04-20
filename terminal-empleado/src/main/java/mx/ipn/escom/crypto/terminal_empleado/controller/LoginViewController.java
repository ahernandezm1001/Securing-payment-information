package mx.ipn.escom.crypto.terminal_empleado.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.HashMap;
import java.util.Map;

@Controller
public class LoginViewController {

    @GetMapping("/login")
    public String showLoginForm(@RequestParam(value = "error", required = false) String error, Model model) {
        if (error != null) {
            model.addAttribute("error", true);
        }
        return "login";
    }

    @PostMapping("/login")
    public String processLogin(@RequestParam String username, @RequestParam String password, Model model) {
        RestTemplate restTemplate = new RestTemplate();
        String serverUrl = "http://localhost:8080/api/auth/login";
        Map<String, String> payload = new HashMap<>();
        payload.put("username", username);
        payload.put("password", password);
        try {
            var response = restTemplate.postForEntity(serverUrl, payload, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                model.addAttribute("mensaje", "Login exitoso");
                return "login";
            } else {
                model.addAttribute("error", true);
                return "login";
            }
        } catch (Exception e) {
            model.addAttribute("error", true);
            return "login";
        }
    }
}
