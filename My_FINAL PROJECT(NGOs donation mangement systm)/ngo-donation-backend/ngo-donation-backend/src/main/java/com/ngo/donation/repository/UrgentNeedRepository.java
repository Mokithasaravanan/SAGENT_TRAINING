package com.ngo.donation.repository;

import com.ngo.donation.entity.UrgentNeed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for UrgentNeed entity.
 */
@Repository
public interface UrgentNeedRepository extends JpaRepository<UrgentNeed, Long> {
}
