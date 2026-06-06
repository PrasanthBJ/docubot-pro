package com.projects.docubotpro.repository;

import com.projects.docubotpro.model.ChatMessage;
import com.projects.docubotpro.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage,Long> {
    List<ChatMessage> findByDocument(Document document);

}
