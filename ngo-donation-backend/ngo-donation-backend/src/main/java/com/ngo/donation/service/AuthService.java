package com.ngo.donation.service;

import com.ngo.donation.dto.AuthRequest;
import com.ngo.donation.dto.AuthResponse;
import com.ngo.donation.dto.RegisterRequest;
import com.ngo.donation.dto.UserDTO;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    UserDTO register(RegisterRequest request);

    AuthResponse login(AuthRequest request);
}
