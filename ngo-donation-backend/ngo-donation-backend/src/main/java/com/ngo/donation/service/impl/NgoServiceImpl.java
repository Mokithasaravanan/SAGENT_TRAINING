package com.ngo.donation.service.impl;

import com.ngo.donation.dto.NgoDTO;
import com.ngo.donation.entity.Ngo;
import com.ngo.donation.exception.ResourceNotFoundException;
import com.ngo.donation.repository.NgoRepository;
import com.ngo.donation.service.NgoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of NgoService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NgoServiceImpl implements NgoService {

    private final NgoRepository ngoRepository;

    @Override
    public List<NgoDTO> getAllNgos() {
        return ngoRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NgoDTO getNgoById(Long id) {
        Ngo ngo = ngoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NGO", id));
        return mapToDTO(ngo);
    }

    @Override
    public List<NgoDTO> searchNgosByLocation(String location) {
        return ngoRepository.findByAddressContainingIgnoreCase(location)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NgoDTO createNgo(NgoDTO ngoDTO) {
        Ngo ngo = Ngo.builder()
                .name(ngoDTO.getName())
                .description(ngoDTO.getDescription())
                .address(ngoDTO.getAddress())
                .contactEmail(ngoDTO.getContactEmail())
                .contactPhone(ngoDTO.getContactPhone())
                .build();
        return mapToDTO(ngoRepository.save(ngo));
    }

    private NgoDTO mapToDTO(Ngo ngo) {
        NgoDTO dto = new NgoDTO();
        dto.setId(ngo.getId());
        dto.setName(ngo.getName());
        dto.setDescription(ngo.getDescription());
        dto.setAddress(ngo.getAddress());
        dto.setContactEmail(ngo.getContactEmail());
        dto.setContactPhone(ngo.getContactPhone());
        return dto;
    }
}
