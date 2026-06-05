package com.projects.docubotpro.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;        // pdf, docx, txt

    @Column(nullable = false)
    private String filePath;        // path where file is saved on disk

    @Column
    private Long fileSize;          // in bytes

    @Column(name = "chunk_count")
    private Integer chunkCount;

    @Column(name = "is_processed")
    private Boolean isProcessed;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Many documents belong to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.isProcessed = false;
    }
}