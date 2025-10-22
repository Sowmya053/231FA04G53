const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const FILE_PATH = path.join(__dirname, 'books.json');

// Root route
app.get('/', (req, res) => {
    res.send(' Welcome to the Books API! Use /books to get started.');
});

// Helper function to read books.json
function readBooks() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading books.json:', err);
        return [];
    }
}

// Helper function to write books.json
function writeBooks(books) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(books, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing books.json:', err);
    }
}

// GET /books → return all books
app.get('/books', (req, res) => {
    const books = readBooks();
    res.json(books);
});

// GET /books/available → return only available books
app.get('/books/available', (req, res) => {
    const books = readBooks();
    const availableBooks = books.filter(b => b.available === true);
    res.json(availableBooks);
});

// POST /books → add new book
app.post('/books', (req, res) => {
    const { title, author, available } = req.body;
    if (!title || !author || typeof available !== 'boolean') {
        return res.status(400).json({ error: 'Invalid book data' });
    }

    const books = readBooks();
    const maxId = books.length ? Math.max(...books.map(b => b.id)) : 0;
    const newBook = {
        id: maxId + 1,
        title,
        author,
        available
    };
    books.push(newBook);
    writeBooks(books);
    res.status(201).json(newBook);
});

// PUT /books/:id → update a book
app.put('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) return res.status(400).json({ error: 'Invalid book ID' });

    const books = readBooks();
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) return res.status(404).json({ error: 'Book not found' });

    const { title, author, available } = req.body;
    if (title !== undefined) books[bookIndex].title = title;
    if (author !== undefined) books[bookIndex].author = author;
    if (available !== undefined) books[bookIndex].available = available;

    writeBooks(books);
    res.json(books[bookIndex]);
});

// DELETE /books/:id → delete a book
app.delete('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) return res.status(400).json({ error: 'Invalid book ID' });

    let books = readBooks();
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) return res.status(404).json({ error: 'Book not found' });

    const deletedBook = books.splice(bookIndex, 1)[0];
    writeBooks(books);
    res.json(deletedBook);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

