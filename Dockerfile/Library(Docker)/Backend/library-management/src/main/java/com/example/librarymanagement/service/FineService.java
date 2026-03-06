package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Fine;
import com.example.librarymanagement.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }

    public Fine addFine(Fine fine) {
        fine.setFineDate(LocalDate.now());
        fine.setStatus("Unpaid");
        return fineRepository.save(fine);
    }

    public Fine payFine(int id) {
        Fine fine = fineRepository.findById(id).orElseThrow();
        fine.setStatus("Paid");
        return fineRepository.save(fine);
    }
}