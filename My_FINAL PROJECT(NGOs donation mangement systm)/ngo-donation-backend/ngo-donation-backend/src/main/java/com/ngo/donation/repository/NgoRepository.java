package com.ngo.donation.repository;

import com.ngo.donation.entity.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Ngo entity.
 */
@Repository
public interface NgoRepository extends JpaRepository<Ngo, Long> {

    List<Ngo> findByAddressContainingIgnoreCase(String location);
}
