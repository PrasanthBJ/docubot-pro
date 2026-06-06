package com.projects.docubotpro.service;

import com.projects.docubotpro.model.Document;
import com.projects.docubotpro.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RagService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final DocumentRepository documentRepository;

    public void processDocument(Document document) {
        try {
            Tika tika = new Tika();
            String text = tika.parseToString(
                    new java.io.File(document.getFilePath())
            );

            List<String> chunks = splitIntoChunks(text, 500);

            List<org.springframework.ai.document.Document> aiDocs = chunks.stream()
                    .map(chunk -> {
                        org.springframework.ai.document.Document aiDoc =
                                new org.springframework.ai.document.Document(chunk);
                        aiDoc.getMetadata().put("documentId", document.getId().toString());
                        aiDoc.getMetadata().put("fileName", document.getFileName());
                        return aiDoc;
                    })
                    .toList();

            vectorStore.add(aiDocs);

            document.setIsProcessed(true);
            document.setChunkCount(chunks.size());
            documentRepository.save(document);

        } catch (Exception e) {
            throw new RuntimeException("Failed to process document: " + e.getMessage());
        }
    }

    public String generateAnswer(String question, Long documentId) {

        List<org.springframework.ai.document.Document> relevantDocs =
                vectorStore.similaritySearch(
                        SearchRequest.builder()
                                .query(question)
                                .topK(4)
                                .filterExpression("documentId == '" + documentId + "'")
                                .build()
                );

        String context = relevantDocs.stream()
                .map(org.springframework.ai.document.Document::getText)
                .reduce("", (a, b) -> a + "\n\n" + b);

        return chatClient.prompt()
                .user(u -> u.text("""
                You are a helpful assistant that answers questions based on the document context below.
                
                Context:
                {context}
                
                Question: {question}
                
                Answer based only on the context. If not found, say "I couldn't find this in the document."
                """)
                        .param("context", context)
                        .param("question", question)
                )
                .call()
                .content();
    }

    private List<String> splitIntoChunks(String text, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + chunkSize, text.length());
            if (end < text.length()) {
                int lastPeriod = text.lastIndexOf('.', end);
                if (lastPeriod > start) {
                    end = lastPeriod + 1;
                }
            }
            chunks.add(text.substring(start, end).trim());
            start = end;
        }
        return chunks;
    }
}