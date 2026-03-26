package com.ngo.donation.controller;

import com.ngo.donation.dto.ApiResponse;
import com.ngo.donation.dto.CampaignDTO;
import com.ngo.donation.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Campaign endpoints.
 */
@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    /**
     * GET /api/campaigns
     * Get all campaigns — public access.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CampaignDTO>>> getAllCampaigns() {
        return ResponseEntity.ok(ApiResponse.success(campaignService.getAllCampaigns()));
    }

    /**
     * GET /api/campaigns/{id}
     * Get campaign by ID — public access.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CampaignDTO>> getCampaignById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.getCampaignById(id)));
    }

    /**
     * POST /api/campaigns
     * Create a new campaign — authenticated users.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CampaignDTO>> createCampaign(
            @Valid @RequestBody CampaignDTO campaignDTO) {
        CampaignDTO created = campaignService.createCampaign(campaignDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Campaign created and pending approval", created));
    }
}
