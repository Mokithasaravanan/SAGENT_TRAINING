package com.ngo.donation.service.impl;

import com.ngo.donation.dto.PickupRequestDTO;
import com.ngo.donation.entity.Donation;
import com.ngo.donation.entity.PickupRequest;
import com.ngo.donation.entity.User;
import com.ngo.donation.exception.BadRequestException;
import com.ngo.donation.exception.ResourceNotFoundException;
import com.ngo.donation.repository.DonationRepository;
import com.ngo.donation.repository.PickupRequestRepository;
import com.ngo.donation.repository.UserRepository;
import com.ngo.donation.service.PickupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of PickupService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PickupServiceImpl implements PickupService {

    private final PickupRequestRepository pickupRequestRepository;
    private final UserRepository userRepository;
    private final DonationRepository donationRepository;

    @Override
    @Transactional
    public PickupRequestDTO requestPickup(PickupRequestDTO dto) {
        User donor = userRepository.findById(dto.getDonorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", dto.getDonorId()));

        Donation donation = donationRepository.findById(dto.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation", dto.getDonationId()));

        // Ensure the donation belongs to the donor
        if (!donation.getDonor().getId().equals(dto.getDonorId())) {
            throw new BadRequestException("Donation does not belong to the specified donor");
        }

        // Prevent duplicate pickup requests
        if (donation.getPickupRequest() != null) {
            throw new BadRequestException("A pickup request already exists for this donation");
        }

        PickupRequest pickupRequest = PickupRequest.builder()
                .donor(donor)
                .donation(donation)
                .pickupAddress(dto.getPickupAddress())
                .pickupTime(dto.getPickupTime())
                .status(PickupRequest.PickupStatus.SCHEDULED)
                .build();

        PickupRequest saved = pickupRequestRepository.save(pickupRequest);
        log.info("Pickup request created: id={}, donorId={}", saved.getId(), donor.getId());
        return mapToDTO(saved);
    }

    @Override
    public List<PickupRequestDTO> getPickupsByDonor(Long donorId) {
        if (!userRepository.existsById(donorId)) {
            throw new ResourceNotFoundException("User", donorId);
        }
        return pickupRequestRepository.findByDonorId(donorId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private PickupRequestDTO mapToDTO(PickupRequest pr) {
        PickupRequestDTO dto = new PickupRequestDTO();
        dto.setId(pr.getId());
        dto.setDonorId(pr.getDonor().getId());
        dto.setDonorName(pr.getDonor().getName());
        dto.setDonationId(pr.getDonation().getId());
        dto.setPickupAddress(pr.getPickupAddress());
        dto.setPickupTime(pr.getPickupTime());
        dto.setStatus(pr.getStatus());
        dto.setDonationStatus(pr.getDonation().getStatus());
        return dto;
    }
}
