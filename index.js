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
class Library {
  constructor() {
    this.books = [];
    this.loadBooks();
    if (this.books.length === 0) {
      this.addDefaultBooks();
    }
  }

  addDefaultBooks() {
    const defaultBooks = [
      new Book("To Kill a Mockingbird", "Harper Lee"),
      new Book("1984", "George Orwell"),
      new Book("The Great Gatsby", "F. Scott Fitzgerald"),
      new Book("Pride and Prejudice", "Jane Austen")
    ];

    const defaultEbooks = [
      new EBook("The Digital Age", "Mark Stevenson", 3.5),
      new EBook("Programming Basics", "John Smith", 8.2),
      new EBook("Artificial Intelligence", "Alan Turing", 5.7)
    ];

    [...defaultBooks, ...defaultEbooks].forEach((book) => {
      this.books.push(book);
    });

    this.saveBooks();
  }

  addBook(book) {
    this.books.push(book);
    this.saveBooks();
    this.displayBooks();
  }

  removeBook(id) {
    this.books = this.books.filter((book) => book.id !== id);
    this.saveBooks();
    this.displayBooks();
  }

  getBookById(id) {
    return this.books.find((book) => book.id === id);
  }

  borrowBook(id, borrower) {
    const book = this.getBookById(id);
    if (book?.borrow(borrower)) {
      this.saveBooks();
      this.displayBooks();
    }
  }

  returnBook(id) {
    const book = this.getBookById(id);
    if (book?.return()) {
      this.saveBooks();
      this.displayBooks();
    }
  }

  saveBooks() {
    localStorage.setItem("books", JSON.stringify(this.books));
  }

  loadBooks() {
    const savedBooks = localStorage.getItem("books");
    if (savedBooks) {
      const bookObjects = JSON.parse(savedBooks);
      this.books = bookObjects.map((obj) => {
        if (obj.type === "ebook") {
          const ebook = new EBook(obj.title, obj.author, obj.fileSize);
          ebook.id = obj.id;
          ebook.isAvailable = obj.isAvailable;
          ebook.borrower = obj.borrower;
          return ebook;
        } else {
          const book = new Book(obj.title, obj.author);
          book.id = obj.id;
          book.isAvailable = obj.isAvailable;
          book.borrower = obj.borrower;
          return book;
        }
      });
    }
  }

  displayBooks() {
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";

    if (this.books.length === 0) {
      bookList.innerHTML = "<p>No books in the library.</p>";
      return;
    }

    this.books.forEach((book) => {
      bookList.innerHTML += book.getHtml();
    });

    document.querySelectorAll(".btn-borrow").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const bookId = e.target.closest(".book-card").dataset.id;
        const borrower = prompt("Enter your name:");
        if (borrower) {
          this.borrowBook(bookId, borrower);
        }
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
        const confirmRemove = confirm("Are you sure you want to remove this book?");
        if (confirmRemove) {
          this.removeBook(bookId);
        }
      });
    });

    this.initializeSortable(); // ✅ Setup DnD
  }

 initializeSortable() {
    const bookGrid = document.getElementById("book-list");
    if (!bookGrid || bookGrid.children.length === 0) return;

    new Sortable(bookGrid, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      swap: true,                  // ✅ Enable swap behavior
      swapClass: 'sortable-swap-highlight', // optional styling
      invertSwap: true,            // use inverted zones
      swapThreshold: 0.5,          // adjust swap sensitivity
      direction: 'auto',           // auto-detect axis per drag :contentReference[oaicite:3]{index=3}
      fallbackOnBody: true,
      onStart: evt => { evt.item.style.zIndex = '1000'; },
      onEnd: evt => {
        evt.item.style.zIndex = '';
        const cards = bookGrid.querySelectorAll('.book-card');
        this.books = Array.from(cards).map(card =>
          this.books.find(b => b.id === card.dataset.id)
        );
        this.saveBooks();
        cards.forEach((card, i) => card.dataset.index = i);
      }
    });
  }
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const library = new Library();

  const bookForm = document.getElementById("book-form");
  const typeSelect = document.getElementById("type");
  const ebookDetails = document.getElementById("ebook-details");
  const toggleFormBtn = document.getElementById("toggle-form");
  const addBookSection = document.querySelector(".add-book-section");

  toggleFormBtn.addEventListener("click", () => {
    if (addBookSection.style.display === "none") {
      addBookSection.style.display = "block";
      toggleFormBtn.textContent = "Hide Form";
    } else {
      addBookSection.style.display = "none";
      toggleFormBtn.textContent = "Add New Book";
    }
  });

  typeSelect.addEventListener("change", () => {
    ebookDetails.style.display = typeSelect.value === "ebook" ? "block" : "none";
  });

  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();

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

    library.addBook(book);

    bookForm.reset();
    ebookDetails.style.display = "none";
  });

  library.displayBooks();
});
