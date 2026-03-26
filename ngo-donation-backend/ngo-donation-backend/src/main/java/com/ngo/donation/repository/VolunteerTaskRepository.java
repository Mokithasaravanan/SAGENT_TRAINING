package com.ngo.donation.repository;

import com.ngo.donation.entity.VolunteerTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for VolunteerTask entity.
 */
@Repository
public interface VolunteerTaskRepository extends JpaRepository<VolunteerTask, Long> {

    List<VolunteerTask> findByVolunteerId(Long volunteerId);

    Optional<VolunteerTask> findByPickupRequestId(Long pickupRequestId);
}
