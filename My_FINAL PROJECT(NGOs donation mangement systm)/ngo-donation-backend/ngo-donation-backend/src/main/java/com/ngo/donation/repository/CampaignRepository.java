package com.ngo.donation.repository;

import com.ngo.donation.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Campaign entity.
 */
@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByNgoId(Long ngoId);

    List<Campaign> findByStatus(Campaign.CampaignStatus status);
}
