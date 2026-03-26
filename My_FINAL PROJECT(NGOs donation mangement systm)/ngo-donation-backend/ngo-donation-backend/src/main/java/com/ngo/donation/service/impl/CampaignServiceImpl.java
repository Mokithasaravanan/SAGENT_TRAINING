package com.ngo.donation.service.impl;

import com.ngo.donation.dto.CampaignDTO;
import com.ngo.donation.entity.Campaign;
import com.ngo.donation.entity.Ngo;
import com.ngo.donation.exception.BadRequestException;
import com.ngo.donation.exception.ResourceNotFoundException;
import com.ngo.donation.repository.CampaignRepository;
import com.ngo.donation.repository.NgoRepository;
import com.ngo.donation.service.CampaignService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of CampaignService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignServiceImpl implements CampaignService {

    private final CampaignRepository campaignRepository;
    private final NgoRepository ngoRepository;

    @Override
    public List<CampaignDTO> getAllCampaigns() {
        return campaignRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CampaignDTO getCampaignById(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));
        return mapToDTO(campaign);
    }

    @Override
    @Transactional
    public CampaignDTO createCampaign(CampaignDTO campaignDTO) {
        Ngo ngo = ngoRepository.findById(campaignDTO.getNgoId())
                .orElseThrow(() -> new ResourceNotFoundException("NGO", campaignDTO.getNgoId()));

        Campaign campaign = Campaign.builder()
                .title(campaignDTO.getTitle())
                .description(campaignDTO.getDescription())
                .donationType(campaignDTO.getDonationType())
                .targetAmount(campaignDTO.getTargetAmount())
                .collectedAmount(BigDecimal.ZERO)
                .startDate(campaignDTO.getStartDate())
                .endDate(campaignDTO.getEndDate())
                .status(Campaign.CampaignStatus.PENDING)
                .ngo(ngo)
                .build();

        return mapToDTO(campaignRepository.save(campaign));
    }

    @Override
    @Transactional
    public CampaignDTO approveCampaign(Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));

        if (campaign.getStatus() != Campaign.CampaignStatus.PENDING) {
            throw new BadRequestException("Only PENDING campaigns can be approved");
        }

        campaign.setStatus(Campaign.CampaignStatus.ACTIVE);
        log.info("Campaign {} approved", campaignId);
        return mapToDTO(campaignRepository.save(campaign));
    }

    @Override
    @Transactional
    public CampaignDTO rejectCampaign(Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));

        if (campaign.getStatus() != Campaign.CampaignStatus.PENDING) {
            throw new BadRequestException("Only PENDING campaigns can be rejected");
        }

        campaign.setStatus(Campaign.CampaignStatus.REJECTED);
        log.info("Campaign {} rejected", campaignId);
        return mapToDTO(campaignRepository.save(campaign));
    }

    private CampaignDTO mapToDTO(Campaign campaign) {
        CampaignDTO dto = new CampaignDTO();
        dto.setId(campaign.getId());
        dto.setTitle(campaign.getTitle());
        dto.setDescription(campaign.getDescription());
        dto.setDonationType(campaign.getDonationType());
        dto.setTargetAmount(campaign.getTargetAmount());
        dto.setCollectedAmount(campaign.getCollectedAmount());
        dto.setStartDate(campaign.getStartDate());
        dto.setEndDate(campaign.getEndDate());
        dto.setStatus(campaign.getStatus());
        dto.setNgoId(campaign.getNgo().getId());
        dto.setNgoName(campaign.getNgo().getName());
        return dto;
    }
}
