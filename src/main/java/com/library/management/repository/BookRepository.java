
// BookRepository.java
package com.library.management.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.management.model.Book;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class BookRepository {
    private static final String JSON_FILE_PATH = "src/main/resources/static/books.json";
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Read all books from JSON file
    public List<Book> findAll() {
        try {
            File file = new File(JSON_FILE_PATH);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(file, new TypeReference<List<Book>>() {});
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // Find a book by ID
    public Optional<Book> findById(String id) {
        return findAll().stream()
                .filter(book -> book.getId().equals(id))
                .findFirst();
    }

    // Save a new book or update an existing one
    public Book save(Book book) {
        List<Book> books = findAll();
        Optional<Book> existingBook = books.stream()
                .filter(b -> b.getId().equals(book.getId()))
                .findFirst();

        if (existingBook.isPresent()) {
            books.remove(existingBook.get());
        }
        books.add(book);
        saveAll(books);
        return book;
    }

    // Delete a book by ID
    public void deleteById(String id) {
        List<Book> books = findAll();
        books = books.stream()
                .filter(book -> !book.getId().equals(id))
                .collect(Collectors.toList());
        saveAll(books);
    }

    // Save all books to JSON file
    private void saveAll(List<Book> books) {
        try {
            File file = new File(JSON_FILE_PATH);
            file.getParentFile().mkdirs();
            objectMapper.writeValue(file, books);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Search books by title or author
    public List<Book> search(String query) {
        return findAll().stream()
                .filter(book -> 
                    book.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                    book.getAuthor().toLowerCase().contains(query.toLowerCase()) ||
                    book.getIsbn().contains(query))
                .collect(Collectors.toList());
    }
}
