// AppointmentService.java
package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.Appointment;
import com.example.patientmonitoring.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional   // ← ADD THIS
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Appointment save(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    public Appointment getById(int id) {
        return appointmentRepository.findById(id).orElse(null);
    }

    public void delete(int id) {
        appointmentRepository.deleteById(id);
    }
}