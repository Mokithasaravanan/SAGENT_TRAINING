package com.ngo.donation.service.impl;

import com.ngo.donation.dto.DonationDTO;
import com.ngo.donation.entity.Campaign;
import com.ngo.donation.entity.Donation;
import com.ngo.donation.entity.Ngo;
import com.ngo.donation.entity.PickupRequest;
import com.ngo.donation.entity.User;
import com.ngo.donation.exception.BadRequestException;
import com.ngo.donation.exception.ResourceNotFoundException;
import com.ngo.donation.repository.CampaignRepository;
import com.ngo.donation.repository.DonationRepository;
import com.ngo.donation.repository.NgoRepository;
import com.ngo.donation.repository.PickupRequestRepository;
import com.ngo.donation.repository.UserRepository;
import com.ngo.donation.service.DonationService;
import com.ngo.donation.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of DonationService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final NgoRepository ngoRepository;
    private final PickupRequestRepository pickupRequestRepository;
    private final EmailService emailService;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Override
    @Transactional
    public DonationDTO donateMoney(DonationDTO donationDTO) {
        User donor = getUser(donationDTO.getDonorId());
        Campaign campaign = null;
        Ngo ngo = null;

        if (donationDTO.getCampaignId() != null) {
            campaign = getCampaign(donationDTO.getCampaignId());
            validateCampaignActive(campaign);
            ngo = campaign.getNgo();
        } else if (donationDTO.getNgoId() != null) {
            ngo = getNgo(donationDTO.getNgoId());
        } else {
            throw new BadRequestException("Campaign ID or NGO ID is required");
        }

        if (donationDTO.getAmount() == null || donationDTO.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Donation amount must be greater than zero");
        }

        Donation donation = Donation.builder()
                .donor(donor)
                .campaign(campaign)
                .ngo(ngo)
                .donationType(Campaign.DonationType.MONEY)
                .amount(donationDTO.getAmount())
                .status(Donation.DonationStatus.PENDING)
                .build();

        Donation saved = donationRepository.save(donation);
        boolean adminNotified = notifyAdmin(saved);
        log.info("Money donation saved: donorId={}, amount={}", donor.getId(), donationDTO.getAmount());
        DonationDTO dto = mapToDTO(saved);
        dto.setAdminEmailSent(adminNotified);
        return dto;
    }

    @Override
    @Transactional
    public DonationDTO donateGoods(DonationDTO donationDTO) {
        User donor = getUser(donationDTO.getDonorId());
        Campaign campaign = null;
        Ngo ngo = null;

        if (donationDTO.getCampaignId() != null) {
            campaign = getCampaign(donationDTO.getCampaignId());
            validateCampaignActive(campaign);
            ngo = campaign.getNgo();
        } else if (donationDTO.getNgoId() != null) {
            ngo = getNgo(donationDTO.getNgoId());
        } else {
            throw new BadRequestException("Campaign ID or NGO ID is required");
        }

        if (donationDTO.getItemDescription() == null || donationDTO.getItemDescription().isBlank()) {
            throw new BadRequestException("Item description is required for goods donation");
        }
        if (donationDTO.getPickupAddress() == null || donationDTO.getPickupAddress().isBlank()) {
            throw new BadRequestException("Pickup address is required for goods donation");
        }
        if (donationDTO.getPickupTime() == null) {
            throw new BadRequestException("Pickup time is required for goods donation");
        }
        if (donationDTO.getDonationType() == null) {
            throw new BadRequestException("Donation type is required for goods donation");
        }
        if (campaign == null && donationDTO.getDonationType() == Campaign.DonationType.GROCERY) {
            throw new BadRequestException("Grocery donations are not accepted for direct NGO donations");
        }

        Donation donation = Donation.builder()
                .donor(donor)
                .campaign(campaign)
                .ngo(ngo)
                .donationType(donationDTO.getDonationType())
                .itemDescription(donationDTO.getItemDescription())
                .status(Donation.DonationStatus.PENDING)
                .build();

        Donation saved = donationRepository.save(donation);

        PickupRequest pickupRequest = PickupRequest.builder()
                .donor(donor)
                .donation(saved)
                .pickupAddress(donationDTO.getPickupAddress())
                .pickupTime(donationDTO.getPickupTime())
                .status(PickupRequest.PickupStatus.SCHEDULED)
                .build();
        pickupRequestRepository.save(pickupRequest);
        saved.setPickupRequest(pickupRequest);

        boolean adminNotified = notifyAdmin(saved);
        log.info("Goods donation saved with pickup: donorId={}, type={}", donor.getId(), donationDTO.getDonationType());
        DonationDTO dto = mapToDTO(saved);
        dto.setAdminEmailSent(adminNotified);
        return dto;
    }

    @Override
    public List<DonationDTO> getDonationHistory(Long donorId) {
        if (!userRepository.existsById(donorId)) {
            throw new ResourceNotFoundException("User", donorId);
        }
        return donationRepository.findByDonorId(donorId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DonationDTO> getAllDonations() {
        return donationRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DonationDTO> getDonationsForNgo(Long ngoId) {
        return donationRepository.findByNgoId(ngoId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DonationDTO approveDonation(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", donationId));

        if (donation.getStatus() == Donation.DonationStatus.REJECTED) {
            throw new BadRequestException("Rejected donations cannot be approved");
        }

        if (donation.getStatus() != Donation.DonationStatus.APPROVED) {
            donation.setStatus(Donation.DonationStatus.APPROVED);

            if (donation.getDonationType() == Campaign.DonationType.MONEY
                    && donation.getAmount() != null
                    && donation.getCampaign() != null) {
                Campaign campaign = donation.getCampaign();
                if (campaign.getCollectedAmount() == null) {
                    campaign.setCollectedAmount(BigDecimal.ZERO);
                }
                campaign.setCollectedAmount(
                        campaign.getCollectedAmount().add(donation.getAmount()));
                campaignRepository.save(campaign);
            }
        }

        Donation saved = donationRepository.save(donation);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public DonationDTO rejectDonation(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", donationId));

        if (donation.getStatus() == Donation.DonationStatus.APPROVED
                || donation.getStatus() == Donation.DonationStatus.CONFIRMED) {
            throw new BadRequestException("Approved donations cannot be rejected");
        }

        donation.setStatus(Donation.DonationStatus.REJECTED);

        if (donation.getPickupRequest() != null) {
            PickupRequest pickup = donation.getPickupRequest();
            pickup.setStatus(PickupRequest.PickupStatus.CANCELLED);
            pickupRequestRepository.save(pickup);
        }

        Donation saved = donationRepository.save(donation);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public DonationDTO approveDonationForNgo(Long donationId, Long ngoId) {
        Donation donation = getDonationForNgo(donationId, ngoId);
        return approveDonation(donation.getId());
    }

    @Override
    @Transactional
    public DonationDTO rejectDonationForNgo(Long donationId, Long ngoId) {
        Donation donation = getDonationForNgo(donationId, ngoId);
        return rejectDonation(donation.getId());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private boolean notifyAdmin(Donation donation) {
        if (adminEmail == null || adminEmail.isBlank()) {
            return false;
        }
        String subject = "Donation successful";
        String body = "Donation successful";
        emailService.sendEmail(adminEmail, "Admin", subject, body);
        return true;
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private Campaign getCampaign(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));
    }

    private Ngo getNgo(Long id) {
        return ngoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NGO", id));
    }

    private void validateCampaignActive(Campaign campaign) {
        if (campaign.getStatus() != Campaign.CampaignStatus.ACTIVE) {
            throw new BadRequestException("Donations are only accepted for ACTIVE campaigns");
        }
    }

    private Donation getDonationForNgo(Long donationId, Long ngoId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", donationId));
        Ngo targetNgo = resolveDonationNgo(donation);
        if (targetNgo == null || !targetNgo.getId().equals(ngoId)) {
            throw new BadRequestException("You are not allowed to manage this donation");
        }
        return donation;
    }

    private Ngo resolveDonationNgo(Donation donation) {
        if (donation.getNgo() != null) return donation.getNgo();
        if (donation.getCampaign() != null) return donation.getCampaign().getNgo();
        return null;
    }

    private DonationDTO mapToDTO(Donation donation) {
        DonationDTO dto = new DonationDTO();
        dto.setId(donation.getId());
        dto.setDonorId(donation.getDonor().getId());
        dto.setDonorName(donation.getDonor().getName());
        if (donation.getCampaign() != null) {
            dto.setCampaignId(donation.getCampaign().getId());
            dto.setCampaignTitle(donation.getCampaign().getTitle());
        }
        Ngo ngo = resolveDonationNgo(donation);
        if (ngo != null) {
            dto.setNgoId(ngo.getId());
            dto.setNgoName(ngo.getName());
        }
        dto.setDonationType(donation.getDonationType());
        dto.setAmount(donation.getAmount());
        dto.setItemDescription(donation.getItemDescription());
        dto.setStatus(donation.getStatus());
        dto.setCreatedAt(donation.getCreatedAt());
        if (donation.getPickupRequest() != null) {
            dto.setPickupAddress(donation.getPickupRequest().getPickupAddress());
            dto.setPickupTime(donation.getPickupRequest().getPickupTime());
        }
        return dto;
    }
}
