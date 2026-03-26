package com.ngo.donation.controller;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.AuthRequest;
import com.ngo.donation.dto.AuthResponse;
import com.ngo.donation.dto.RegisterRequest;
import com.ngo.donation.dto.UserDTO;
import com.ngo.donation.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication endpoints: register and login.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Register a new user (DONOR or VOLUNTEER).
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> register(
            @Valid @RequestBody RegisterRequest request) {

        UserDTO user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", user));
    }

    /**
     * POST /api/auth/login
     * Authenticate and receive a JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody AuthRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
