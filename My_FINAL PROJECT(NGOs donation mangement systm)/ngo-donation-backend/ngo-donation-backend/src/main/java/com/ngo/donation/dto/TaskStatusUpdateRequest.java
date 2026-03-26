package com.ngo.donation.dto;

import com.ngo.donation.entity.VolunteerTask;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for updating volunteer task status.
 */
@Data
public class TaskStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private VolunteerTask.TaskStatus status;
}
