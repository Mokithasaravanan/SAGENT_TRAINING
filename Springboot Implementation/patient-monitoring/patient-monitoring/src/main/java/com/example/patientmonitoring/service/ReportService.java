package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.Report;
import com.example.patientmonitoring.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public Report save(Report report) {
        return reportRepository.save(report);
    }

    public List<Report> getAll() {
        return reportRepository.findAll();
    }

    public Report getById(int id) {
        return reportRepository.findById(id).orElse(null);
    }

    public void delete(int id) {
        reportRepository.deleteById(id);
    }
}