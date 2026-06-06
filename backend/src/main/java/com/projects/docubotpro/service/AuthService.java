package com.projects.docubotpro.service;

import com.projects.docubotpro.config.JwtService;
import com.projects.docubotpro.dto.AuthResponse;
import com.projects.docubotpro.dto.LoginRequest;
import com.projects.docubotpro.dto.RegisterRequest;
import com.projects.docubotpro.exception.BadRequestException;
import com.projects.docubotpro.exception.ResourceNotFoundException;
import com.projects.docubotpro.model.Users;
import com.projects.docubotpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {

        // Step 1 — Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        // Step 2 — Hash the password
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Step 3 — Build and save the user
        Users user = Users.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(hashedPassword)
                .build();

        userRepository.save(user);

        // Step 4 — Generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        // Step 5 — Return response
        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        // Step 1 — Find user by email
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Step 2 — Compare passwords
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new  BadRequestException("Invalid password");
        }

        // Step 3 — Generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        // Step 4 — Return response
        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}