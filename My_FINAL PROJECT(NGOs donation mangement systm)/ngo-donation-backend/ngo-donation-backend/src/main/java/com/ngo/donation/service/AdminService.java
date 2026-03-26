package com.ngo.donation.service;

import com.ngo.donation.dto.UrgentNeedDTO;
import com.ngo.donation.dto.UserDTO;
import com.ngo.donation.dto.VolunteerTaskDTO;
import com.ngo.donation.entity.Report;

import java.util.List;

public interface AdminService {

    List<UserDTO> getAllDonors();

    List<UserDTO> getAllVolunteers();

    UrgentNeedDTO createUrgentNeed(UrgentNeedDTO urgentNeedDTO);

    List<UrgentNeedDTO> getAllUrgentNeeds();

    Report generateReport(String reportType);

    List<Report> getAllReports();

    VolunteerTaskDTO assignVolunteerTask(Long volunteerId, Long pickupRequestId);
}
