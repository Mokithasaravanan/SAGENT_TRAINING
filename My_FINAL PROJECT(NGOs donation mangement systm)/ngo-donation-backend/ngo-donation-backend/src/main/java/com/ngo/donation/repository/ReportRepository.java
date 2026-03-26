package com.ngo.donation.repository;

import com.ngo.donation.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Report entity.
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
}
