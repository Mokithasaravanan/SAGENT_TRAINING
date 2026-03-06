package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.Consultation;
import com.example.patientmonitoring.repository.ConsultationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ConsultationService {

    @Autowired
    private ConsultationRepository consultationRepository;

    public Consultation save(Consultation consultation) {
        return consultationRepository.save(consultation);
    }

    public List<Consultation> getAll() {
        return consultationRepository.findAll();
    }

    public Consultation getById(int id) {
        return consultationRepository.findById(id).orElse(null);
    }

    public void delete(int id) {
        consultationRepository.deleteById(id);
    }
}