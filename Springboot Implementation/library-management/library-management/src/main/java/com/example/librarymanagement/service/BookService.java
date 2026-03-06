package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Book;
import com.example.librarymanagement.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public Book addBook(Book book) {
        return bookRepository.save(book);
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public String deleteBook(int id) {
        bookRepository.deleteById(id);
        return "Book deleted successfully";
    }

    public Book updateBook(int id, Book updatedBook) {
        Optional<Book> optional = bookRepository.findById(id);
        if (optional.isEmpty()) return null;
        Book book = optional.get();
        book.setName(updatedBook.getName());
        book.setAuthor(updatedBook.getAuthor());
        return bookRepository.save(book);
    }
}