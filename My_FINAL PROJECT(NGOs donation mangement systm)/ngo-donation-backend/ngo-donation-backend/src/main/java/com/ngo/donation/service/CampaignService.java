package com.ngo.donation.service;

import com.ngo.donation.dto.CampaignDTO;

import java.util.List;

/**
 * Service interface for Campaign operations.
 */
public interface CampaignService {

    List<CampaignDTO> getAllCampaigns();

    CampaignDTO getCampaignById(Long id);

    CampaignDTO createCampaign(CampaignDTO campaignDTO);

    CampaignDTO approveCampaign(Long campaignId);

    CampaignDTO rejectCampaign(Long campaignId);
}
