package com.projects.docubotpro.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtService {

    // Secret key used to sign the token — must be at least 256 bits
    private static final String SECRET_KEY = "docubot-pro-secret-key-must-be-256-bits-long-at-minimum";

    // Token valid for 24 hours
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    // Convert secret string to a cryptographic key
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Generate a JWT token with email as subject
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .compact();
    }

    // Extract email from token
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // Check if token is valid and not expired
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // Parse and return the payload (claims) from token
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}