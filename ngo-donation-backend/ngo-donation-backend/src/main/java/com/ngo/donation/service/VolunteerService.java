package com.ngo.donation.service;

import com.ngo.donation.dto.PickupRequestDTO;
import com.ngo.donation.dto.VolunteerTaskDTO;
import com.ngo.donation.entity.VolunteerTask;

import java.util.List;

/**
 * Service interface for Volunteer Task operations.
 */
public interface VolunteerService {

    List<VolunteerTaskDTO> getTasksByVolunteer(Long volunteerId);

    VolunteerTaskDTO updateTaskStatus(Long taskId, VolunteerTask.TaskStatus status);

    List<PickupRequestDTO> getAvailablePickups();

    VolunteerTaskDTO claimPickupTask(Long pickupRequestId, Long volunteerId);
}
