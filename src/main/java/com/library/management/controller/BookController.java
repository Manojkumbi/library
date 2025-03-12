
// BookController.java
package com.library.management.controller;

import com.library.management.model.Book;
import com.library.management.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
public class BookController {
    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/admin-dash")
    public String index() {
        return "index";
    }
    @GetMapping("/ad")
    public String adminlog() {
        return "admin";
    }
    @GetMapping("/")
    public String login() {
        return "login";
    }
    @GetMapping("/student")
public String studentPortal() {
    return "student"; 
}

    @GetMapping("/api/books")
    @ResponseBody
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/api/books/{id}")
    @ResponseBody
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        Optional<Book> book = bookService.getBookById(id);
        return book.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/books")
    @ResponseBody
    public ResponseEntity<Book> addBook(@RequestBody Book book) {
        Book newBook = bookService.addBook(book);
        return new ResponseEntity<>(newBook, HttpStatus.CREATED);
    }

    @PutMapping("/api/books/{id}")
    @ResponseBody
    public ResponseEntity<Book> updateBook(@PathVariable String id, @RequestBody Book book) {
        Book updatedBook = bookService.updateBook(id, book);
        return updatedBook != null ?
                ResponseEntity.ok(updatedBook) :
                ResponseEntity.notFound().build();
    }

    @DeleteMapping("/api/books/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteBook(@PathVariable String id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/books/search")
    @ResponseBody
    public List<Book> searchBooks(@RequestParam String query) {
        return bookService.searchBooks(query);
    }

    @PutMapping("/api/books/{id}/toggle-availability")
    @ResponseBody
    public ResponseEntity<Book> toggleAvailability(@PathVariable String id) {
        Book updatedBook = bookService.toggleAvailability(id);
        return updatedBook != null ?
                ResponseEntity.ok(updatedBook) :
                ResponseEntity.notFound().build();
    }
}