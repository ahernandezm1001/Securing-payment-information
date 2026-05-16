package mx.ipn.escom.crypto.servidor_central.controller;

import mx.ipn.escom.crypto.servidor_central.entity.Producto;
import mx.ipn.escom.crypto.servidor_central.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/server/productos")
public class ProductoServerController {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> obtenerTodosLosProductos() {
        try {
            // 1. Buscamos todos los productos reales en la base de datos
            List<Producto> productosDB = productoRepository.findAll();
            
            // 2. Creamos la lista que le vamos a mandar a React
            List<Map<String, Object>> productosReact = new ArrayList<>();

            for (Producto p : productosDB) {
                Map<String, Object> map = new HashMap<>();
                
                // 3. Traducimos las variables para que React las entienda sin modificar el frontend
                map.put("id", p.getIdProducto());
                map.put("name", p.getDescripcion()); 
                map.put("price", p.getPrecio());
                
                // no tenemos tallas en la base, podriamos agregar o dejar en unica
                map.put("size", "Única");            
                
                // Mandamos el stock 
                map.put("stock", p.getStock());      

                productosReact.add(map);
            }

            return ResponseEntity.ok(productosReact);
            
        } catch (Exception e) {
            System.err.println("✗ Error al consultar el catálogo de productos: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}