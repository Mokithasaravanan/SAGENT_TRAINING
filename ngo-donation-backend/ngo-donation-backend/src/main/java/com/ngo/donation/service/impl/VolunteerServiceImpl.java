package com.ngo.donation.service.impl;

import com.ngo.donation.dto.PickupRequestDTO;
import com.ngo.donation.dto.VolunteerTaskDTO;
import com.ngo.donation.entity.Donation;
import com.ngo.donation.entity.PickupRequest;
import com.ngo.donation.entity.VolunteerTask;
import com.ngo.donation.exception.BadRequestException;
import com.ngo.donation.exception.ResourceNotFoundException;
import com.ngo.donation.repository.PickupRequestRepository;
import com.ngo.donation.repository.UserRepository;
import com.ngo.donation.repository.VolunteerTaskRepository;
import com.ngo.donation.service.VolunteerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of VolunteerService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VolunteerServiceImpl implements VolunteerService {

    private final VolunteerTaskRepository volunteerTaskRepository;
    private final UserRepository userRepository;
    private final PickupRequestRepository pickupRequestRepository;

    @Override
    public List<VolunteerTaskDTO> getTasksByVolunteer(Long volunteerId) {
        if (!userRepository.existsById(volunteerId)) {
            throw new ResourceNotFoundException("User", volunteerId);
        }
        return volunteerTaskRepository.findByVolunteerId(volunteerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PickupRequestDTO> getAvailablePickups() {
        List<PickupRequest> pickups = pickupRequestRepository.findAll();
        List<Long> assignedPickupIds = volunteerTaskRepository.findAll()
                .stream()
                .map(t -> t.getPickupRequest().getId())
                .toList();

        return pickups.stream()
                .filter(p -> p.getStatus() != PickupRequest.PickupStatus.CANCELLED
                        && p.getStatus() != PickupRequest.PickupStatus.COMPLETED)
                .filter(p -> p.getDonation() != null
                        && (p.getDonation().getStatus() == Donation.DonationStatus.APPROVED
                        || p.getDonation().getStatus() == Donation.DonationStatus.CONFIRMED))
                .filter(p -> !assignedPickupIds.contains(p.getId()))
                .map(this::mapPickupToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VolunteerTaskDTO claimPickupTask(Long pickupRequestId, Long volunteerId) {
        if (!userRepository.existsById(volunteerId)) {
            throw new ResourceNotFoundException("User", volunteerId);
        }

        PickupRequest pickupRequest = pickupRequestRepository.findById(pickupRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("PickupRequest", pickupRequestId));

        Donation donation = pickupRequest.getDonation();
        if (donation == null
                || (donation.getStatus() != Donation.DonationStatus.APPROVED
                && donation.getStatus() != Donation.DonationStatus.CONFIRMED)) {
            throw new BadRequestException("Donation is not approved yet");
        }

        if (volunteerTaskRepository.findByPickupRequestId(pickupRequestId).isPresent()) {
            throw new BadRequestException("Pickup already assigned");
        }

        VolunteerTask task = VolunteerTask.builder()
                .volunteer(userRepository.findById(volunteerId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", volunteerId)))
                .pickupRequest(pickupRequest)
                .status(VolunteerTask.TaskStatus.ASSIGNED)
                .build();

        VolunteerTask saved = volunteerTaskRepository.save(task);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public VolunteerTaskDTO updateTaskStatus(Long taskId, VolunteerTask.TaskStatus status) {
        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("VolunteerTask", taskId));

        task.setStatus(status);
        VolunteerTask saved = volunteerTaskRepository.save(task);
        log.info("Task {} status updated to {}", taskId, status);
        return mapToDTO(saved);
    }

    private VolunteerTaskDTO mapToDTO(VolunteerTask task) {
        VolunteerTaskDTO dto = new VolunteerTaskDTO();
        dto.setId(task.getId());
        dto.setVolunteerId(task.getVolunteer().getId());
        dto.setVolunteerName(task.getVolunteer().getName());
        dto.setPickupRequestId(task.getPickupRequest().getId());
        dto.setPickupAddress(task.getPickupRequest().getPickupAddress());
        dto.setPickupTime(task.getPickupRequest().getPickupTime());
        Donation donation = task.getPickupRequest().getDonation();
        if (donation != null) {
            dto.setDonationId(donation.getId());
            dto.setDonorName(donation.getDonor().getName());
            dto.setDonationType(donation.getDonationType());
            dto.setAmount(donation.getAmount());
            dto.setItemDescription(donation.getItemDescription());
            dto.setCampaignTitle(donation.getCampaign() != null
                    ? donation.getCampaign().getTitle()
                    : null);
            dto.setDonationStatus(donation.getStatus());
        }
        dto.setStatus(task.getStatus());
        return dto;
    }

    private PickupRequestDTO mapPickupToDTO(PickupRequest pr) {
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
