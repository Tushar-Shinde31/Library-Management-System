// Book class definition - represents a physical book
class Book {
  // Constructor for creating a new Book instance
  constructor(title, author) {
    this.title = title; // Book title
    this.author = author; // Book author
    // Generate a unique ID for the book using slice instead of deprecated substr
    this.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    this.isAvailable = true; // Availability status
    this.borrower = null; // Name of the borrower, null if available
    this.type = "physical"; // Type identifier
  }

  // Method to get basic book details
  getDetails() {
    return `${this.title} by ${this.author}`;
  }

  // Method to borrow the book
  borrow(borrower) {
    // Cannot borrow if already borrowed
    if (!this.isAvailable) return false;

    this.isAvailable = false; // Mark as unavailable
    this.borrower = borrower; // Record the borrower
    return true; // Indicate successful borrowing
  }

  // Method to return the book
  return() {
    // Cannot return if already available
    if (this.isAvailable) return false;

    this.isAvailable = true; // Mark as available
    this.borrower = null; // Clear the borrower
    return true; // Indicate successful return
  }

  // Method to generate HTML representation of the book card
  getHtml() {
    // Determine CSS class based on availability
    const statusClass = this.isAvailable ? "" : "borrowed";

    // Return HTML string for the book card
    return `
      <div class="book-card ${statusClass}" data-id="${this.id}" data-index="${this.id}">
        <h3 class="book-title">${this.title}</h3>
        <div class="book-meta">Author: ${this.author}</div>
        <div class="book-meta">
          Status: ${
            // Display status and borrower if applicable
            this.isAvailable ? "Available" : `Borrowed by ${this.borrower}`
          }
        </div>
        <div class="book-actions">
          ${
            // Conditionally render Borrow or Return button
            this.isAvailable
              ? '<button class="btn btn-borrow">Borrow</button>'
              : '<button class="btn btn-return">Return</button>'
          }
          <button class="btn btn-remove">Remove</button> <!-- Remove button -->
        </div>
      </div>
    `;
  }
}

// EBook class that extends Book - represents an electronic book
class EBook extends Book {
  // Constructor for creating a new EBook instance
  constructor(title, author, fileSize) {
    super(title, author); // Call the parent class constructor
    this.fileSize = fileSize; // File size specific to EBooks
    this.type = "ebook"; // Type identifier
  }

  // Override getDetails to include file size
  getDetails() {
    return `${super.getDetails()} | E-Book (${this.fileSize} MB)`;
  }

  // Override borrow method for e-book behavior (can be borrowed multiple times)
  borrow(borrower) {
    // E-books can be "borrowed" (downloaded) but remain available conceptually
    this.borrower = borrower; // Record the downloader
    // We don't change isAvailable for ebooks as they can be downloaded by multiple users
    return true; // Indicate successful download
  }

  // Override return method for e-books (clears the last downloader)
  return() {
    // Cannot return if not currently "borrowed" (downloaded)
    if (!this.borrower) return false;

    this.borrower = null; // Clear the borrower/downloader
    return true; // Indicate successful return/clearing
  }

  // Override getHtml to generate HTML for an EBook card
  getHtml() {
    // Return HTML string for the EBook card
    return `
      <div class="book-card ebook" data-id="${this.id}" data-index="${this.id}">
        <h3 class="book-title">${this.title}</h3>
        <div class="book-meta">Author: ${this.author}</div>
        <div class="book-meta">File Size: ${this.fileSize} MB</div>
        <div class="book-meta">
          Status: ${
            // Display status based on whether it's downloaded
            !this.borrower ? "Available" : `Downloaded by ${this.borrower}`
          }
        </div>
        <div class="book-actions">
          ${
            // Conditionally render Download or Return button
            !this.borrower
              ? '<button class="btn btn-borrow">Download</button>'
              : '<button class="btn btn-return">Return</button>'
          }
          <button class="btn btn-remove">Remove</button> <!-- Remove button -->
        </div>
      </div>
    `;
  }
}

// Library class to manage the collection of books
// Book and EBook classes remain unchanged...
// [keep your Book and EBook class code here]

// Library class to manage the collection of books
// Library class to manage a collection of books and ebooks
class Library {
  constructor() {
    this.books = [];       // Array to store book instances
    this.loadBooks();      // Load books from local storage

    // If no books exist, populate default books
    if (this.books.length === 0) {
      this.addDefaultBooks();
    }
  }

  // Adds a set of default physical books and ebooks
  addDefaultBooks() {
    const defaultBooks = [ /* ...physical books... */ ];
    const defaultEbooks = [ /* ...ebooks with file sizes... */ ];

    // Merge and add all default items to the library
    [...defaultBooks, ...defaultEbooks].forEach((book) => {
      this.books.push(book);
    });

    this.saveBooks();  // Save updated list to local storage
  }

  // Adds a new book or ebook to the library
  addBook(book) {
    this.books.push(book);
    this.saveBooks();      // Save updates
    this.displayBooks();   // Refresh UI
  }

  // Removes a book by ID
  removeBook(id) {
    this.books = this.books.filter((book) => book.id !== id);
    this.saveBooks();
    this.displayBooks();
  }

  // Finds a book by its unique ID
  getBookById(id) {
    return this.books.find((book) => book.id === id);
  }

  // Handles borrowing a book
  borrowBook(id, borrower) {
    const book = this.getBookById(id);
    if (book?.borrow(borrower)) {
      this.saveBooks();
      this.displayBooks();
    }
  }

  // Handles returning a book
  returnBook(id) {
    const book = this.getBookById(id);
    if (book?.return()) {
      this.saveBooks();
      this.displayBooks();
    }
  }

  // Saves current book list to browser's local storage
  saveBooks() {
    localStorage.setItem("books", JSON.stringify(this.books));
  }

  // Loads saved books from local storage and rebuilds book objects
  loadBooks() {
    const savedBooks = localStorage.getItem("books");
    if (savedBooks) {
      const bookObjects = JSON.parse(savedBooks);

      // Restore each book to correct class (Book or EBook)
      this.books = bookObjects.map((obj) => {
        if (obj.type === "ebook") {
          const ebook = new EBook(obj.title, obj.author, obj.fileSize);
          Object.assign(ebook, obj);  // Restore properties
          return ebook;
        } else {
          const book = new Book(obj.title, obj.author);
          Object.assign(book, obj);   // Restore properties
          return book;
        }
      });
    }
  }

  // Renders book cards in the UI and sets up event listeners
  displayBooks() {
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";

    // Show placeholder message if no books
    if (this.books.length === 0) {
      bookList.innerHTML = "<p>No books in the library.</p>";
      return;
    }

    // Render each book's HTML markup
    this.books.forEach((book) => {
      bookList.innerHTML += book.getHtml();
    });

    // Setup event listeners for borrow, return, and remove buttons
    document.querySelectorAll(".btn-borrow").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const bookId = e.target.closest(".book-card").dataset.id;
        const borrower = prompt("Enter your name:");
        if (borrower) this.borrowBook(bookId, borrower);
      });
    });

    document.querySelectorAll(".btn-return").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const bookId = e.target.closest(".book-card").dataset.id;
        this.returnBook(bookId);
      });
    });

    document.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const bookId = e.target.closest(".book-card").dataset.id;
        if (confirm("Are you sure you want to remove this book?")) {
          this.removeBook(bookId);
        }
      });
    });

    this.initializeSortable(); // 🔄 Enable drag & drop sorting
  }

  // Makes book cards draggable and reorderable using SortableJS
  initializeSortable() {
    const bookGrid = document.getElementById("book-list");
    if (!bookGrid || bookGrid.children.length === 0) return;

    new Sortable(bookGrid, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      swap: true,
      swapClass: 'sortable-swap-highlight',
      invertSwap: true,
      swapThreshold: 0.5,
      direction: 'auto',
      fallbackOnBody: true,
      onStart: evt => { evt.item.style.zIndex = '1000'; },
      onEnd: evt => {
        evt.item.style.zIndex = '';
        const cards = bookGrid.querySelectorAll('.book-card');

        // Update internal book list order to match drag result
        this.books = Array.from(cards).map(card =>
          this.books.find(b => b.id === card.dataset.id)
        );

        this.saveBooks();

        // Optionally tag new position
        cards.forEach((card, i) => card.dataset.index = i);
      }
    });
  }
}

// DOM initialization after page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const library = new Library();  // Instantiate library manager

  // DOM elements for book creation form
  const bookForm = document.getElementById("book-form");
  const typeSelect = document.getElementById("type");
  const ebookDetails = document.getElementById("ebook-details");
  const toggleFormBtn = document.getElementById("toggle-form");
  const addBookSection = document.querySelector(".add-book-section");

  // Toggle book form visibility
  toggleFormBtn.addEventListener("click", () => {
    const isHidden = addBookSection.style.display === "none";
    addBookSection.style.display = isHidden ? "block" : "none";
    toggleFormBtn.textContent = isHidden ? "Hide Form" : "Add New Book";
  });

  // Show/hide ebook-specific fields
  typeSelect.addEventListener("change", () => {
    ebookDetails.style.display = typeSelect.value === "ebook" ? "block" : "none";
  });

  // Handle form submission to create a new book or ebook
  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();  // Prevent page reload

    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const type = typeSelect.value;

    let book;
    if (type === "ebook") {
      const fileSize = document.getElementById("fileSize").value;
      book = new EBook(title, author, fileSize);
    } else {
      book = new Book(title, author);
    }

    library.addBook(book);  // Add to library

    bookForm.reset();            // Clear form fields
    ebookDetails.style.display = "none";  // Hide ebook section
  });

  library.displayBooks();  // Initial UI render
});
