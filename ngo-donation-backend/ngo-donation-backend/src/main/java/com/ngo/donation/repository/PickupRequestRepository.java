package com.ngo.donation.repository;

import com.ngo.donation.entity.Donation;
import com.ngo.donation.entity.PickupRequest;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for PickupRequest entity.
 */
@Repository
public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {

    List<PickupRequest> findByDonorId(Long donorId);

    @Query("""
            select p from PickupRequest p
            where p.volunteerTask is null
              and p.status not in :pickupStatuses
              and p.donation.status in :donationStatuses
            """)
    List<PickupRequest> findAvailablePickups(
            @Param("pickupStatuses") List<PickupRequest.PickupStatus> pickupStatuses,
            @Param("donationStatuses") List<Donation.DonationStatus> donationStatuses);
}
