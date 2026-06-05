package com.projects.docubotpro.repository;

import com.projects.docubotpro.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage,Long> {

}
