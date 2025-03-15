
// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Load books when the page loads
    loadBooks();
    
    // Add event listener for the book form submission
    document.getElementById('bookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveBook();
    });
});

// Function to load all books
function loadBooks() {
    fetch('/api/books')
        .then(response => response.json())
        .then(books => {
            displayBooks(books);
        })
        .catch(error => {
            console.error('Error loading books:', error);
        });
}

// Function to display books in the table
function displayBooks(books) {
    const tableBody = document.getElementById('booksTableBody');
    tableBody.innerHTML = '';
    
    if (books.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center;">No books found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
		<tr>
		    <td>${book.title}</td>
		    <td class="responsive-info">${book.author}</td>
		    <td class="responsive-info">${book.isbn}</td>
		    <td class="responsive-info">${book.publishYear}</td>
		    <td><span class="status-badge status-${book.available ? 'available' : 'borrowed'}">${book.available ? 'Available' : 'Borrowed'}</span></td>
		    <td>
		        <div class="action-buttons">
		            <button class="action-button edit-button" title="Edit book" onclick="editBook('${book.id}')"><i class="fas fa-edit"></i></button>
		            <button class="action-button delete-button" title="Delete book" onclick="deleteBook('${book.id}')"><i class="fas fa-trash"></i></button>
		            <button class="action-button availability-button" title="Toggle availability" onclick="toggleAvailability('${book.id}')"><i class="fas fa-exchange-alt"></i></button>
		        </div>
		    </td>
		</tr>
        `;
        tableBody.appendChild(row);
    });
}

// Function to save a book (new or edit)
function saveBook() {
    const bookId = document.getElementById('bookId').value;
    const book = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value,
        publishYear: parseInt(document.getElementById('publishYear').value)
    };
    
    let url = '/api/books';
    let method = 'POST';
    
    // If we're editing an existing book
    if (bookId) {
        url = `/api/books/${bookId}`;
        method = 'PUT';
        // Get the existing book to preserve 'available' status
        fetch(`/api/books/${bookId}`)
            .then(response => response.json())
            .then(existingBook => {
                book.available = existingBook.available;
                sendBookRequest(url, method, book);
            });
    } else {
        sendBookRequest(url, method, book);
    }
}

// Function to send book save/update request
function sendBookRequest(url, method, book) {
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
    })
    .then(response => response.json())
    .then(savedBook => {
        resetForm();
        loadBooks();
    })
    .catch(error => {
        console.error('Error saving book:', error);
    });
}

// Function to edit a book
function editBook(id) {
    fetch(`/api/books/${id}`)
        .then(response => response.json())
        .then(book => {
            document.getElementById('bookId').value = book.id;
            document.getElementById('title').value = book.title;
            document.getElementById('author').value = book.author;
            document.getElementById('isbn').value = book.isbn;
            document.getElementById('publishYear').value = book.publishYear;
            document.getElementById('formTitle').textContent = 'Edit Book';
        })
        .catch(error => {
            console.error('Error loading book for edit:', error);
        });
}

// Function to delete a book
function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        fetch(`/api/books/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            loadBooks();
        })
        .catch(error => {
            console.error('Error deleting book:', error);
        });
    }
}

// Function to toggle book availability
function toggleAvailability(id) {
    fetch(`/api/books/${id}/toggle-availability`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(() => {
        loadBooks();
    })
    .catch(error => {
        console.error('Error toggling availability:', error);
    });
}

// Function to reset the form
function resetForm() {
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Book';
}

// Function to search books
function searchBooks() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (query === '') {
        loadBooks();
        return;
    }
    
    fetch(`/api/books/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(books => {
            displayBooks(books);
        })
        .catch(error => {
            console.error('Error searching books:', error);
        });
}

// Add JSON file structure example
// books.json (initially empty)
// []