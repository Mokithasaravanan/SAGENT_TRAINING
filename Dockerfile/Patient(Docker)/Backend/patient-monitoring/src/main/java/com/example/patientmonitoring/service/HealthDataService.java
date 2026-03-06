package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.HealthData;
import com.example.patientmonitoring.repository.HealthDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class HealthDataService {

    @Autowired
    private HealthDataRepository healthDataRepository;

    public HealthData save(HealthData healthData) {
        return healthDataRepository.save(healthData);
    }

    public List<HealthData> getAll() {
        return healthDataRepository.findAll();
    }

    public HealthData getById(int id) {
        return healthDataRepository.findById(id).orElse(null);
    }

    public void delete(int id) {
        healthDataRepository.deleteById(id);
    }
}