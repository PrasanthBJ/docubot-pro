package com.projects.docubotpro.controller;

import com.projects.docubotpro.config.JwtService;
import com.projects.docubotpro.dto.ChatRequest;
import com.projects.docubotpro.dto.ChatResponse;
import com.projects.docubotpro.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final JwtService jwtService;

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askQuestion(
            @RequestBody ChatRequest request,
            @RequestHeader("Authorization") String authHeader) {

        String email = extractEmail(authHeader);
        ChatResponse response = chatService.askQuestion(request, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{documentId}")
    public ResponseEntity<List<ChatResponse>> getChatHistory(
            @PathVariable Long documentId,
            @RequestHeader("Authorization") String authHeader) {

        String email = extractEmail(authHeader);
        List<ChatResponse> history = chatService.getChatHistory(documentId, email);
        return ResponseEntity.ok(history);
    }

    // ─── Helper ─────────────────────────────────────────
    private String extractEmail(String authHeader) {
        String token = authHeader.substring(7);
        return jwtService.extractEmail(token);
    }
}