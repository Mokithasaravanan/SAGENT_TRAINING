package com.example.librarymanagement.controller;

import com.example.librarymanagement.entity.Fine;
import com.example.librarymanagement.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    @Autowired
    private FineService fineService;

    @GetMapping
    public List<Fine> getAllFines() {
        return fineService.getAllFines();
    }

    @PostMapping
    public Fine addFine(@RequestBody Fine fine) {
        return fineService.addFine(fine);
    }

    @PutMapping("/{id}/pay")
    public Fine payFine(@PathVariable int id) {
        return fineService.payFine(id);
    }
}