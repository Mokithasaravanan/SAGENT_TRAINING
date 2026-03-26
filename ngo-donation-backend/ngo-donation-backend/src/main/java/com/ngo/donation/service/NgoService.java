package com.ngo.donation.service;

import com.ngo.donation.dto.NgoDTO;

import java.util.List;

/**
 * Service interface for NGO operations.
 */
public interface NgoService {

    List<NgoDTO> getAllNgos();

    NgoDTO getNgoById(Long id);

    List<NgoDTO> searchNgosByLocation(String location);

    NgoDTO createNgo(NgoDTO ngoDTO);
}
