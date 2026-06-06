package com.projects.docubotpro.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;        // what the user asked

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;          // what the bot replied

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Many chat messages belong to one document
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    // Many chat messages belong to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}