package com.ngo.donation.controller;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.NgoDTO;
import com.ngo.donation.service.NgoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for NGO endpoints.
 */
@RestController
@RequestMapping("/api/ngos")
@RequiredArgsConstructor
public class NgoController {

    private final NgoService ngoService;

    /**
     * GET /api/ngos
     * Get all NGOs — public access.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NgoDTO>>> getAllNgos(
            @RequestParam(required = false) String location) {

        List<NgoDTO> ngos = (location != null && !location.isBlank())
                ? ngoService.searchNgosByLocation(location)
                : ngoService.getAllNgos();

        return ResponseEntity.ok(ApiResponse.success(ngos));
    }

    /**
     * GET /api/ngos/{id}
     * Get NGO by ID — public access.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NgoDTO>> getNgoById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(ngoService.getNgoById(id)));
    }

    /**
     * POST /api/ngos
     * Create a new NGO — Admin only.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NgoDTO>> createNgo(
            @Valid @RequestBody NgoDTO ngoDTO) {

        NgoDTO created = ngoService.createNgo(ngoDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("NGO created successfully", created));
    }
}
