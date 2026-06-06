package com.projects.docubotpro.controller;

import com.projects.docubotpro.dto.DocumentResponse;
import com.projects.docubotpro.service.DocumentService;
import com.projects.docubotpro.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final JwtService jwtService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {

        String email = extractEmail(authHeader);
        DocumentResponse response = documentService.uploadDocument(file, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocuments(
            @RequestHeader("Authorization") String authHeader) {

        String email = extractEmail(authHeader);
        List<DocumentResponse> documents = documentService.getAllDocuments(email);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        String email = extractEmail(authHeader);
        DocumentResponse document = documentService.getDocumentById(id, email);
        return ResponseEntity.ok(document);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDocument(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        String email = extractEmail(authHeader);
        documentService.deleteDocument(id, email);
        return ResponseEntity.ok("Document deleted successfully");
    }

    private String extractEmail(String authHeader) {
        String token = authHeader.substring(7); // remove "Bearer "
        return jwtService.extractEmail(token);
    }
}