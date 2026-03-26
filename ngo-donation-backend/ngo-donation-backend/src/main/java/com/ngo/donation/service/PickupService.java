package com.ngo.donation.service;

import com.ngo.donation.dto.PickupRequestDTO;

import java.util.List;

/**
 * Service interface for Pickup Request operations.
 */
public interface PickupService {

    PickupRequestDTO requestPickup(PickupRequestDTO pickupRequestDTO);

    List<PickupRequestDTO> getPickupsByDonor(Long donorId);
}
