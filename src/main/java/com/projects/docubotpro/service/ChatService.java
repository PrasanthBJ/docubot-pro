package com.projects.docubotpro.service;

import com.projects.docubotpro.dto.ChatRequest;
import com.projects.docubotpro.dto.ChatResponse;
import com.projects.docubotpro.exception.ResourceNotFoundException;
import com.projects.docubotpro.model.ChatMessage;
import com.projects.docubotpro.model.Document;
import com.projects.docubotpro.model.Users;
import com.projects.docubotpro.repository.ChatMessageRepository;
import com.projects.docubotpro.repository.DocumentRepository;
import com.projects.docubotpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public ChatResponse askQuestion(ChatRequest request, String email) {

        // Step 1 - Get logged-in user
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Step 2 - Find document and verify it belongs to this user
        Document document = documentRepository.findByIdAndUser(request.getDocumentId(), user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        // Step 3 - Save question with dummy answer for now
        ChatMessage chatMessage = ChatMessage.builder()
                .question(request.getQuestion())
                .answer("AI answer coming soon...")  // placeholder until RAG phase
                .document(document)
                .user(user)
                .build();

        ChatMessage saved = chatMessageRepository.save(chatMessage);

        // Step 4 - Return response
        return mapToResponse(saved);
    }

    public List<ChatResponse> getChatHistory(Long documentId, String email) {

        // Step 1 - Get logged-in user
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Step 2 - Find document and verify ownership
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        // Step 3 - Get all messages for this document
        return chatMessageRepository.findByDocument(document)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ─── Helper ─────────────────────────────────────────
    private ChatResponse mapToResponse(ChatMessage chatMessage) {
        return ChatResponse.builder()
                .id(chatMessage.getId())
                .question(chatMessage.getQuestion())
                .answer(chatMessage.getAnswer())
                .documentId(chatMessage.getDocument().getId())
                .createdAt(chatMessage.getCreatedAt())
                .build();
    }
}