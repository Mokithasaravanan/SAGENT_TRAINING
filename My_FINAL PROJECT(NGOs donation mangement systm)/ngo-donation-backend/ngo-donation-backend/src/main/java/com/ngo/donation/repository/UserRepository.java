package com.ngo.donation.repository;

import com.ngo.donation.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    boolean existsByRoleAndNgoId(User.Role role, Long ngoId);

    List<User> findByRoleAndNgoId(User.Role role, Long ngoId);
}
