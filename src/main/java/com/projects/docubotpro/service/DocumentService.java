package com.projects.docubotpro.service;

import com.projects.docubotpro.dto.DocumentResponse;
import com.projects.docubotpro.model.Document;
import com.projects.docubotpro.model.Users;
import com.projects.docubotpro.repository.DocumentRepository;
import com.projects.docubotpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Upload a file
    public DocumentResponse uploadDocument(MultipartFile file, String email) {

        // Step 1 - Get logged in user
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Step 2 - Validate file type
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);

        if (!isAllowedFileType(fileExtension)) {
            throw new RuntimeException("File type not allowed. Only PDF, DOCX, TXT are accepted");
        }

        // Step 3 - Create uploads folder if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            try {
                Files.createDirectories(uploadPath);
            } catch (IOException e) {
                throw new RuntimeException("Could not create upload folder");
            }
        }

        // Step 4 - Generate unique file name using UUID
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

        // Step 5 - Save file to disk
        Path filePath = uploadPath.resolve(uniqueFileName);
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not save file");
        }

        // Step 6 - Save metadata to DB
        Document document = Document.builder()
                .fileName(originalFileName)
                .fileType(fileExtension)
                .fileSize(file.getSize())
                .filePath(filePath.toString())
                .user(user)
                .build();

        Document saved = documentRepository.save(document);

        // Step 7 - Return response
        return mapToResponse(saved);
    }

    // Get all documents for logged in user
    public List<DocumentResponse> getAllDocuments(String email) {

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return documentRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get single document by id
    public DocumentResponse getDocumentById(Long id, String email) {

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = documentRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        return mapToResponse(document);
    }

    // Delete a document
    public void deleteDocument(Long id, String email) {

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = documentRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Delete file from disk
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file from disk");
        }

        // Delete from DB
        documentRepository.delete(document);
    }

    // ─── Helper Methods ─────────────────────────────────

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new RuntimeException("Invalid file name");
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    private boolean isAllowedFileType(String extension) {
        return extension.equals("pdf") ||
                extension.equals("docx") ||
                extension.equals("txt");
    }

    private DocumentResponse mapToResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .fileName(document.getFileName())
                .fileType(document.getFileType())
                .fileSize(document.getFileSize())
                .isProcessed(document.getIsProcessed())
                .createdAt(document.getCreatedAt())
                .build();
    }


}