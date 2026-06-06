package com.projects.docubotpro.repository;

import com.projects.docubotpro.model.Document;
import com.projects.docubotpro.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document,Long> {
    List<Document> findByUser(Users user);
    Optional<Document> findByIdAndUser(Long id, Users user);
}
