package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.Patient;
import com.example.patientmonitoring.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public Patient save(Patient patient) {
        return patientRepository.save(patient);
    }

    public List<Patient> getAll() {
        return patientRepository.findAll();
    }

    public Patient getById(int id) {
        return patientRepository.findById(id).orElse(null);
    }

    public void delete(int id) {
        patientRepository.deleteById(id);
    }
}