"use client";

import { useEffect, useState } from "react";

type Book = {
  title: string;
  author: string;
  status: string;
  review: string;
};

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("Quiero leer");
  const [review, setReview] = useState("");

  useEffect(() => {
    const savedBooks = localStorage.getItem("books");

    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("books", JSON.stringify(books));
    }
  }, [books, loaded]);

  function addBook() {
    if (!title.trim()) return;

    setBooks([
      ...books,
      {
        title,
        author,
        status,
        review,
      },
    ]);

    setTitle("");
    setAuthor("");
    setStatus("Quiero leer");
    setReview("");
    setShowForm(false);
  }

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-2">Mi Biblioteca</h1>

        <p className="text-gray-600 mb-8">
          Tu espacio personal para guardar libros.
        </p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-3 rounded-2xl w-full mb-6"
        >
          + Añadir libro
        </button>

        {showForm && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 space-y-3">
            <input
              className="w-full border rounded-xl p-3"
              placeholder="Título del libro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3"
              placeholder="Autor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />

            <select
              className="w-full border rounded-xl p-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Quiero leer</option>
              <option>Leyendo</option>
              <option>Leído</option>
              <option>Abandonado</option>
            </select>

            <textarea
              className="w-full border rounded-xl p-3"
              placeholder="Reseña personal"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />

            <button
              onClick={addBook}
              className="bg-black text-white px-4 py-3 rounded-2xl w-full"
            >
              Guardar libro
            </button>
          </div>
        )}

        <div className="space-y-4">
          {books.map((book, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{book.author}</p>

              <h2 className="text-2xl font-semibold mb-2">{book.title}</h2>

              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mb-3">
                {book.status}
              </span>

              <p className="text-gray-700">{book.review}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}