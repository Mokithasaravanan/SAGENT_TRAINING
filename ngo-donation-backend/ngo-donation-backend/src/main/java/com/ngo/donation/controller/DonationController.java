package com.ngo.donation.controller;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.DonationDTO;
import com.ngo.donation.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Donation endpoints.
 */
@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    /**
     * POST /api/donations/money
     * Make a monetary donation.
     */
    @PostMapping("/money")
    public ResponseEntity<ApiResponse<DonationDTO>> donateMoney(
            @Valid @RequestBody DonationDTO donationDTO) {
        DonationDTO result = donationService.donateMoney(donationDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Money donation successful", result));
    }

    /**
     * POST /api/donations/goods
     * Donate goods (clothes, food, grocery).
     */
    @PostMapping("/goods")
    public ResponseEntity<ApiResponse<DonationDTO>> donateGoods(
            @Valid @RequestBody DonationDTO donationDTO) {
        DonationDTO result = donationService.donateGoods(donationDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goods donation submitted", result));
    }

    /**
     * GET /api/donations/history/{donorId}
     * View donation history for a donor.
     */
    @GetMapping("/history/{donorId}")
    public ResponseEntity<ApiResponse<List<DonationDTO>>> getDonationHistory(
            @PathVariable Long donorId) {
        List<DonationDTO> history = donationService.getDonationHistory(donorId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
