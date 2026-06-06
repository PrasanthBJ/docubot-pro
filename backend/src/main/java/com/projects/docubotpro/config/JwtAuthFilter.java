package com.projects.docubotpro.config;

import com.projects.docubotpro.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Step 1 - Read Authorization header
        String authHeader = request.getHeader("Authorization");

        // Step 2 - If no token, skip filter and continue
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 3 - Extract token (remove "Bearer " prefix)
        String token = authHeader.substring(7);

        // Step 4 - Extract email from token
        String email = jwtService.extractEmail(token);

        // Step 5 - If email found and user not already authenticated
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Step 6 - Validate token
            if (jwtService.isTokenValid(token)) {

                // Step 7 - Load user from DB
                userRepository.findByEmail(email).ifPresent(existingUser -> {

                    // Step 8 - Build UserDetails object for Spring Security
                    UserDetails userDetails = User.builder()
                            .username(existingUser.getEmail())
                            .password(existingUser.getPassword())
                            .authorities(Collections.emptyList())
                            .build();

                    // Step 9 - Set authentication in Security Context
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                });
            }
        }

        // Step 10 - Continue the request
        filterChain.doFilter(request, response);
    }
}