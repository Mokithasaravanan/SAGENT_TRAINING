package com.ngo.donation.service.impl;

import com.ngo.donation.dto.AuthRequest;
import com.ngo.donation.dto.AuthResponse;
import com.ngo.donation.dto.RegisterRequest;
import com.ngo.donation.dto.UserDTO;
import com.ngo.donation.entity.User;
import com.ngo.donation.exception.BadRequestException;
import com.ngo.donation.repository.UserRepository;
import com.ngo.donation.security.JwtUtil;
import com.ngo.donation.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Implementation of AuthService for registration and login.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public UserDTO register(RegisterRequest request) {
        log.debug("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(request.getRole())
                .build();

        User saved = userRepository.save(user);
        log.info("User registered successfully with id: {}", saved.getId());
        return mapToDTO(saved);
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        log.debug("Login attempt for email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        String token = jwtUtil.generateToken(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        log.info("User logged in successfully: {}", request.getEmail());
        Long ngoId = user.getNgo() != null ? user.getNgo().getId() : null;
        return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getId(), ngoId);
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
