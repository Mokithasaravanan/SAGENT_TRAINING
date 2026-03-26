package com.ngo.donation.service;

import com.ngo.donation.dto.DonationDTO;

import java.util.List;

/**
 * Service interface for Donation operations.
 */
public interface DonationService {

    DonationDTO donateMoney(DonationDTO donationDTO);

    DonationDTO donateGoods(DonationDTO donationDTO);

    List<DonationDTO> getDonationHistory(Long donorId);

    List<DonationDTO> getAllDonations();

    List<DonationDTO> getDonationsForNgo(Long ngoId);

    DonationDTO approveDonation(Long donationId);

    DonationDTO rejectDonation(Long donationId);

    DonationDTO approveDonationForNgo(Long donationId, Long ngoId);

    DonationDTO rejectDonationForNgo(Long donationId, Long ngoId);
}
