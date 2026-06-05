package com.projects.docubotpro.repository;

import com.projects.docubotpro.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document,Long> {
}
