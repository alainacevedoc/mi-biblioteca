"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Book = {
  id: string;
  title: string;
  author: string;
  status: string;
  review: string;
  cover: string;
  date: string;
  created_at?: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("Quiero leer");
  const [review, setReview] = useState("");
  const [cover, setCover] = useState("");
  const [date, setDate] = useState("");

  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [section, setSection] = useState("Todos");
  const [sortBy, setSortBy] = useState("fechaLectura");

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBooks(data);
    }
  }

  async function searchBookInfo() {
    if (!title.trim()) return;

    const response = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(
        title
      )}&limit=1`
    );

    const data = await response.json();

    const book = data.docs?.[0];

    if (!book) return;

    if (book.author_name?.[0]) {
      setAuthor(book.author_name[0]);
    }

    if (book.cover_i) {
      setCover(
        `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      );
    }
  }

  async function addBook() {
    if (!title.trim()) return;

    const { error } = await supabase.from("books").insert([
      {
        title,
        author,
        status,
        review,
        cover,
        date,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    setAuthor("");
    setStatus("Quiero leer");
    setReview("");
    setCover("");
    setDate("");

    setShowForm(false);

    fetchBooks();
  }

  async function deleteBook(id: string) {
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchBooks();
    }
  }

  const filteredBooks = [...books]
    .filter((book) =>
      section === "Todos" ? true : book.status === section
    )
    .filter((book) =>
      `${book.title} ${book.author} ${book.review}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "fechaLectura") {
        return (
          new Date(b.date || "").getTime() -
          new Date(a.date || "").getTime()
        );
      }

      return (
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
      );
    });

  return (
    <main className="min-h-screen bg-[#f4f1ea] p-6 text-[#382110]">
      <div className="max-w-md mx-auto pb-24">

        <h1 className="text-4xl font-bold mb-2">
          Mi biblioteca
        </h1>

        <p className="mb-8 text-[#6b5f55]">
          Tu espacio personal para guardar libros
        </p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-[#382110] text-white rounded-2xl p-4 mb-6"
        >
          + Añadir libro
        </button>

        {showForm && (
          <div className="bg-white p-4 rounded-3xl mb-6 space-y-3">

            <input
              className="w-full border p-3 rounded-xl"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <button
              onClick={searchBookInfo}
              className="bg-black text-white rounded-xl p-3 w-full"
            >
              Buscar portada y autor
            </button>

            <input
              className="w-full border p-3 rounded-xl"
              placeholder="Autor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />

            <select
              className="w-full border p-3 rounded-xl"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Quiero leer</option>
              <option>Leyendo</option>
              <option>Leído</option>
              <option>Abandonado</option>
            </select>

            <input
              className="w-full border p-3 rounded-xl"
              placeholder="URL portada"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
            />

            <input
              type="date"
              className="w-full border p-3 rounded-xl"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <textarea
              className="w-full border p-3 rounded-xl"
              placeholder="Reseña"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />

            <button
              onClick={addBook}
              className="bg-[#382110] text-white rounded-2xl p-4 w-full"
            >
              Guardar libro
            </button>
          </div>
        )}

        <input
          className="w-full border p-3 rounded-2xl mb-6"
          placeholder="Buscar libros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 overflow-x-auto mb-6">

          {[
            "Todos",
            "Quiero leer",
            "Leyendo",
            "Leído",
            "Abandonado",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setSection(item)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                section === item
                  ? "bg-[#382110] text-white"
                  : "bg-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <select
          className="w-full border p-3 rounded-2xl mb-6"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="fechaLectura">
            Ordenar por fecha de lectura
          </option>

          <option value="fechaAñadido">
            Ordenar por fecha añadido
          </option>
        </select>

        <div className="space-y-4">

          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className="bg-[#1b1b1b] rounded-3xl p-4 cursor-pointer"
            >

              {book.cover && (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-40 h-60 object-contain mx-auto mb-4"
                />
              )}

              <p className="text-gray-400 text-sm">
                {book.author}
              </p>

              <h2 className="text-2xl text-white font-bold mb-2">
                {book.title}
              </h2>

              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                {book.status}
              </span>

              {book.date && (
                <p className="text-gray-400 text-sm mt-3">
                  {book.date}
                </p>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBook(book.id);
                }}
                className="text-red-400 mt-4 text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >

            {selectedBook.cover && (
              <img
                src={selectedBook.cover}
                alt={selectedBook.title}
                className="w-48 h-72 object-contain mx-auto mb-6"
              />
            )}

            <p className="text-gray-500 mb-2">
              {selectedBook.author}
            </p>

            <h2 className="text-4xl font-bold mb-4">
              {selectedBook.title}
            </h2>

            <p className="leading-7">
              {selectedBook.review}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
