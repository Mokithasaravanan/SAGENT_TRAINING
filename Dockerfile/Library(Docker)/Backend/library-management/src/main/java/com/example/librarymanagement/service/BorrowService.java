package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Borrow;
import com.example.librarymanagement.repository.BorrowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class BorrowService {

    @Autowired
    private BorrowRepository borrowRepository;

    public Borrow borrowBook(Borrow borrow) {
        borrow.setStatus("Issued");
        return borrowRepository.save(borrow);
    }

    public List<Borrow> getAllBorrows() {
        return borrowRepository.findAll();
    }

    public Borrow getBorrowById(int id) {
        return borrowRepository.findById(id).orElse(null);
    }

    public Borrow returnBook(Borrow borrow) {
        borrow.setReturnDate(LocalDate.now());
        borrow.setStatus("Returned");
        return borrowRepository.save(borrow);
    }
}