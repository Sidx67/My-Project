package com.example.demo;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.nio.file.*;
import java.io.IOException;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class ProductController {

    private List<Product> products = new ArrayList<>(
        List.of(
            new Product(1, "Laptop", 80000, null),
            new Product(2, "Phone", 50000, null)
        )
    );
    private int nextId = 3;
    private final Path uploadDir = Paths.get("uploads");

    public ProductController() throws IOException {
        Files.createDirectories(uploadDir); // ensure upload folder exists
    }

    // Login
    @PostMapping("/login")
    public boolean login(@RequestBody Map<String, String> user) {
        String username = user.get("username");
        String password = user.get("password");
        return "admin".equals(username) && "admin@1234".equals(password);
    }

    // Get all products
    @GetMapping("/products")
    public List<Product> getProducts() {
        return products;
    }

    // Add new product
@PostMapping(value = "/products", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
public void addProduct(
        @RequestParam("name") String name,
        @RequestParam("price") double price,
        @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

    String imageUrl = null;
    if (image != null && !image.isEmpty()) {
        String imageName = UUID.randomUUID() + "_" + image.getOriginalFilename();
        Path path = uploadDir.resolve(imageName);
        Files.write(path, image.getBytes());
        imageUrl = "/uploads/" + imageName;
    }

    Product p = new Product(nextId++, name, price, imageUrl);
    products.add(p);
}

// Update product
@PutMapping(value = "/products/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
public void updateProduct(
        @PathVariable int id,
        @RequestParam("name") String name,
        @RequestParam("price") double price,
        @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

    for (Product p : products) {
        if (p.getId() == id) {
            p.setName(name);
            p.setPrice(price);
            if (image != null && !image.isEmpty()) {
                String imageName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                Path path = uploadDir.resolve(imageName);
                Files.write(path, image.getBytes());
                p.setImageUrl("/uploads/" + imageName);
            }
            break;
        }
    }
}


    // Delete product
    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable int id) {
        products.removeIf(p -> p.getId() == id);
    }

    // Serve uploaded images
    @GetMapping("/uploads/{filename:.+}")
    public Resource getImage(@PathVariable String filename) throws IOException {
        Path file = uploadDir.resolve(filename);
        return new UrlResource(file.toUri());
    }
}
