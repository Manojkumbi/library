// student-script.js
document.addEventListener('DOMContentLoaded', function() {
    // Simulate a logged-in student
	
    const loggedInStudent = {
        id: "123456",
        name: 		localStorage.getItem("username"),
        email: localStorage.getItem("useremail")
    };

    // Set student name
    document.getElementById('studentName').textContent = `Welcome, ${loggedInStudent.name}`;
    
    // Load initial data
    loadBooks();
    loadBorrowedBooks();
    loadBorrowingHistory();
});

// Global variables to track pagination
let currentPage = 1;
const booksPerPage = 8;
let allBooks = [];

// Function to navigate between sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden-section');
        section.classList.remove('active-section');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.remove('hidden-section');
    document.getElementById(sectionId).classList.add('active-section');
    
    // Update navigation
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Function to load books
function loadBooks() {
    fetch('/api/books')
        .then(response => response.json())
        .then(books => {
            allBooks = books;
            updateBookDisplay();
            updatePagination();
        })
        .catch(error => {
            console.error('Error loading books:', error);
            document.getElementById('booksCatalog').innerHTML = '<p class="error-message">Failed to load books. Please try again later.</p>';
        });
}

// Function to update book display based on current page and filters
function updateBookDisplay() {
    const catalog = document.getElementById('booksCatalog');
    catalog.innerHTML = '';
    
    // Apply filters
    let filteredBooks = filterBooks(allBooks);
    
    // Paginate
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToDisplay = filteredBooks.slice(startIndex, endIndex);
    
    if (booksToDisplay.length === 0) {
        catalog.innerHTML = '<p class="empty-message">No books match your search criteria.</p>';
        return;
    }
    
    booksToDisplay.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.setAttribute('data-id', book.id);
        bookCard.onclick = () => showBookDetails(book.id);
        
        bookCard.innerHTML = `
            <div class="book-cover">${book.title.charAt(0)}${book.author.charAt(0)}</div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
                <p>Published: ${book.publishYear}</p>
                <div class="book-status ${book.available ? 'status-available' : 'status-borrowed'}">
                    ${book.available ? 'Available' : 'Borrowed'}
                </div>
            </div>
        `;
        
        catalog.appendChild(bookCard);
    });
    
    updatePagination();
}

// Function to apply filters
function filterBooks(books) {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const availabilityFilter = document.getElementById('availabilityFilter').value;
    
    return books.filter(book => {
        // Search filter
        const matchesSearch = searchQuery === '' || 
            book.title.toLowerCase().includes(searchQuery) || 
            book.author.toLowerCase().includes(searchQuery) ||
            book.isbn.includes(searchQuery);
        
        // Category filter (assuming we'd add a category field to the book model)
        const matchesCategory = categoryFilter === '' || book.category === categoryFilter;
        
        // Availability filter
        const matchesAvailability = availabilityFilter === '' || 
            (availabilityFilter === 'available' && book.available);
        
        return matchesSearch && matchesCategory && matchesAvailability;
    });
}

// Function to update pagination controls
function updatePagination() {
    const filteredBooks = filterBooks(allBooks);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// Function to change page
function changePage(increment) {
    const filteredBooks = filterBooks(allBooks);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    
    const newPage = currentPage + increment;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updateBookDisplay();
    }
}

// Function to search books
function searchBooks() {
    currentPage = 1; // Reset to first page on new search
    updateBookDisplay();
}

// Function to show book details
function showBookDetails(bookId) {
    fetch(`/api/books/${bookId}`)
        .then(response => response.json())
        .then(book => {
            const modal = document.getElementById('bookModal');
            const bookDetails = document.getElementById('bookDetails');
            
            bookDetails.innerHTML = `
                <div class="book-detail-header">
                    <div class="book-image">${book.title.charAt(0)}${book.author.charAt(0)}</div>
                    <div class="book-header-info">
                        <h2>${book.title}</h2>
                        <p>By ${book.author}</p>
                        <p>ISBN: ${book.isbn}</p>
                        <p>Published: ${book.publishYear}</p>
                        <p class="book-status ${book.available ? 'status-available' : 'status-borrowed'}">
                            ${book.available ? 'Available' : 'Currently Borrowed'}
                        </p>
                    </div>
                </div>
                
                <div class="book-description">
                    <p>${getBookDescription(book.title)}</p>
                </div>
                
                <div class="book-meta">
                    <h4>Details</h4>
                    <div class="meta-grid">
                        <div class="meta-item"><span>Language:</span> English</div>
                        <div class="meta-item"><span>Pages:</span> ${Math.floor(Math.random() * 300) + 100}</div>
                        <div class="meta-item"><span>Category:</span> ${getRandomCategory()}</div>
                        <div class="meta-item"><span>Location:</span> Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 100)}</div>
                    </div>
                </div>
                
                <div class="book-actions">
                    <button class="borrow-btn" ${book.available ? '' : 'disabled'} onclick="borrowBook('${book.id}')">
                        ${book.available ? 'Borrow Book' : 'Currently Unavailable'}
                    </button>
                </div>
            `;
            
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading book details:', error);
        });
}

// Function to close modal
function closeModal() {
    document.getElementById('bookModal').style.display = 'none';
}

// Click outside modal to close
window.onclick = function(event) {
    const modal = document.getElementById('bookModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Function to borrow a book
function borrowBook(bookId) {
    fetch(`/api/books/${bookId}/toggle-availability`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(book => {
        closeModal();
        loadBooks();
        loadBorrowedBooks();
        
        // Add to borrowing history (simulated)
        addToBorrowingHistory(book);
        
        alert(`Successfully borrowed: ${book.title}`);
    })
    .catch(error => {
        console.error('Error borrowing book:', error);
        alert('Failed to borrow book. Please try again.');
    });
}

// Function to load borrowed books
function loadBorrowedBooks() {
    fetch('/api/books')
        .then(response => response.json())
        .then(books => {
            const borrowedBooks = books.filter(book => !book.available);
            const container = document.getElementById('borrowedBooks');
            
            if (borrowedBooks.length === 0) {
                container.innerHTML = '<p class="empty-message">You have no borrowed books.</p>';
                return;
            }
            
            container.innerHTML = '';
            borrowedBooks.forEach(book => {
                const borrowedItem = document.createElement('div');
                borrowedItem.className = 'borrowed-item';
                
                // Set a random due date for demonstration
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) + 7); // 7-21 days
                
                borrowedItem.innerHTML = `
                    <div class="borrowed-info">
                        <h3>${book.title}</h3>
                        <p>Author: ${book.author}</p>
                        <p>ISBN: ${book.isbn}</p>
                        <p>Due Date: ${dueDate.toLocaleDateString()}</p>
                    </div>
                    <div class="borrowed-actions">
                        <button onclick="returnBook('${book.id}')">Return Book</button>
                    </div>
                `;
                
                container.appendChild(borrowedItem);
            });
        })
        .catch(error => {
            console.error('Error loading borrowed books:', error);
            document.getElementById('borrowedBooks').innerHTML = 
                '<p class="error-message">Failed to load borrowed books. Please try again later.</p>';
        });
}

// Function to return a bookfunction returnBook(bookId) 
function returnBook(bookId) {
    // Get current timestamp for return date
    const returnDate = new Date().toISOString();
    
    // Update localStorage first
    let borrowingHistory = JSON.parse(localStorage.getItem('borrowingHistory') || '[]');
    borrowingHistory = borrowingHistory.map(book => {
        if (book.id === bookId && book.returnedDate === null) {
            return { ...book, returnedDate: returnDate };
        }
        return book;
    });
    localStorage.setItem('borrowingHistory', JSON.stringify(borrowingHistory));
    
    // Then proceed with your API call
    fetch(`/api/books/${bookId}/toggle-availability`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(book => {
        // Update book status in allBooks array
        allBooks = allBooks.map(b => b.id === book.id ? { ...b, available: true } : b);

        // Reload book lists to reflect the changes
        loadBooks();
        loadBorrowedBooks();

        alert(`Successfully returned: ${book.title}`);
    })
    .catch(error => {
        console.error('Error returning book:', error);
        alert('Failed to return book. Please try again.');
    });
}

// Function to load borrowing history
// Function to load borrowing history - updated version
function loadBorrowingHistory() {
    const historyContainer = document.getElementById('borrowingHistory');
    
    // Check if we have history in local storage
    const history = JSON.parse(localStorage.getItem('borrowingHistory') || '[]');
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="empty-message">No borrowing history available.</p>';
        return;
    }
    
    historyContainer.innerHTML = '';
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Check if the item is returned properly
        const isReturned = item.returnedDate !== null;
        
        historyItem.innerHTML = `
            <div class="history-info">
                <h3>${item.title}</h3>
                <p>Author: ${item.author}</p>
                <p>Borrowed: ${new Date(item.borrowedDate).toLocaleDateString()}</p>
                <p>Returned: ${isReturned ? new Date(item.returnedDate).toLocaleDateString() : 'Not yet returned'}</p>
                <p class="${isReturned ? 'status-available' : 'status-borrowed'}">
                    ${isReturned ? 'Completed' : 'Active'}
                </p>
            </div>
        `;
        
        historyContainer.appendChild(historyItem);
    });
}

// Helper function to add to borrowing history
// Helper function to add to borrowing history - updated version
function addToBorrowingHistory(book) {
    const history = JSON.parse(localStorage.getItem('borrowingHistory') || '[]');
    
    // Add to history
    history.push({
        id: book.id,
        title: book.title,
        author: book.author,
        borrowedDate: new Date().toISOString(), // Convert to ISO string
        returnedDate: null
    });
    
    localStorage.setItem('borrowingHistory', JSON.stringify(history));
    loadBorrowingHistory();
}

// Helper function to update borrowing history when returning
function updateBorrowingHistory(book) {
    const history = JSON.parse(localStorage.getItem('borrowingHistory') || '[]');
    
    // Find the book in history and mark as returned
    const updatedHistory = history.map(item => {
        if (item.id === book.id && !item.returnedDate) {
            return {
                ...item,
                returnedDate: new Date()
            };
        }
        return item;
    });
    
    localStorage.setItem('borrowingHistory', JSON.stringify(updatedHistory));
    loadBorrowingHistory();
}

// Helper functions for demo content
function getBookDescription(title) {
    const descriptions = [
        "A captivating journey through time and space that explores the fundamental questions of human existence.",
        "An insightful examination of societal structures and personal identity in a rapidly changing world.",
        "A thrilling adventure that takes readers on an unexpected journey filled with twists and turns.",
        "A deeply moving story about love, loss, and the resilience of the human spirit.",
        "A thought-provoking narrative that challenges conventional wisdom and inspires new perspectives."
    ];
    
    // Use a deterministic approach based on title to keep descriptions consistent
    const index = title.length % descriptions.length;
    return descriptions[index];
}

function getRandomCategory() {
    const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology', 'Arts'];
    return categories[Math.floor(Math.random() * categories.length)];
}

// Function for logout
function logout() {
    alert('Logged out successfully');
    window.location.href = '/'; // Redirect to home/login page
}