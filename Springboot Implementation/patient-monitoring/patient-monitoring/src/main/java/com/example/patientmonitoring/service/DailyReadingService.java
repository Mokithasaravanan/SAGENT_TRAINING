package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.DailyReading;
import com.example.patientmonitoring.repository.DailyReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class DailyReadingService {

    @Autowired
    private DailyReadingRepository dailyReadingRepository;

    public DailyReading save(DailyReading dailyReading) {
        return dailyReadingRepository.save(dailyReading);
    }

    public List<DailyReading> getAll() {
        return dailyReadingRepository.findAll();
    }

    public DailyReading getById(int id) {
        return dailyReadingRepository.findById(id).orElse(null);
    }

    public void delete(int id) {
        dailyReadingRepository.deleteById(id);
    }
}