package com.ngo.donation.repository;

import com.ngo.donation.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Donation entity.
 */
@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByDonorId(Long donorId);

    List<Donation> findByCampaignId(Long campaignId);

    @Query("""
        select d from Donation d
        left join d.ngo ngo
        left join d.campaign c
        left join c.ngo cngo
        where (ngo.id = :ngoId or cngo.id = :ngoId)
        """)
    List<Donation> findByNgoId(Long ngoId);
}
