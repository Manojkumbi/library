
package com.library.management.controller;

import com.library.management.model.Book;
import com.library.management.service.BookService;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/student")
public class StudentController {
    
    private final BookService bookService;
    
    @Autowired
    public StudentController(BookService bookService) {
        this.bookService = bookService;
    }
    
    // For a real application, you would add:
    // - Student login/authentication
    // - Student borrowing records
    // - Due date calculations
    // - Fines for late returns
    // - Reservation system
    
    @PutMapping("/borrow/{bookId}")
    @ResponseBody
    public ResponseEntity<Book> borrowBook(@PathVariable String bookId) {
        // In a real app, you'd also store borrowing record with student ID
        Book updatedBook = bookService.toggleAvailability(bookId);
        return updatedBook != null ?
                ResponseEntity.ok(updatedBook) :
                ResponseEntity.notFound().build();
    }
    
    @PutMapping("/return/{bookId}")
    @ResponseBody
    public ResponseEntity<Book> returnBook(@PathVariable String bookId) {
        // In a real app, you'd also update the borrowing record
        Book updatedBook = bookService.toggleAvailability(bookId);
        return updatedBook != null ?
                ResponseEntity.ok(updatedBook) :
                ResponseEntity.notFound().build();
    }
    
    @GetMapping("/borrowed")
    @ResponseBody
    public ResponseEntity<List<Book>> getBorrowedBooks(@RequestParam(required = false) String studentId) {
        // In a real app, you'd filter by the authenticated student
        // For now, we'll just return all non-available books
        List<Book> books = bookService.getAllBooks()
                .stream()
                .filter(book -> !book.isAvailable())
                .collect(Collectors.toList());
        return ResponseEntity.ok(books);
    }
    
    @GetMapping("/history")
    @ResponseBody
    public ResponseEntity<?> getBorrowingHistory(@RequestParam(required = false) String studentId) {
        // In a real app, you'd fetch from a BorrowingRecord repository
        // For now, return an empty list since we don't have the data model
        return ResponseEntity.ok(Collections.emptyList());
    }
    
    @GetMapping("/reservations")
    @ResponseBody
    public ResponseEntity<?> getReservations(@RequestParam(required = false) String studentId) {
        // For a future enhancement - book reservation system
        return ResponseEntity.ok(Collections.emptyList());
    }
}