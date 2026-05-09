"use client";

import { useEffect, useState } from "react";

type Book = {
  title: string;
  author: string;
  status: string;
  review: string;
  cover: string;
  date: string;
};

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("Quiero leer");
  const [review, setReview] = useState("");
  const [cover, setCover] = useState("");
  const [date, setDate] = useState("");

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [shelf, setShelf] = useState("Todos");
  const [tab, setTab] = useState("biblioteca");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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

  const filteredBooks = [...books]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .filter((book) => shelf === "Todos" || book.status === shelf)
  .filter((book) =>
    `${book.title} ${book.author} ${book.status} ${book.review}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
async function searchBookInfo() {
  if (!title.trim()) return;

  const response = await fetch(
    `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`
  );

  const data = await response.json();
  const book = data.docs?.[0];

  if (!book) return;

  if (book.author_name?.[0]) {
    setAuthor(book.author_name[0]);
  }

  if (book.cover_i) {
    setCover(`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`);
  }
}
  function addBook() {
    if (!title.trim()) return;

    if (editingIndex !== null) {
      const updatedBooks = books.map((book, index) =>
        index === editingIndex
  ? {
  title,
  author,
  status,
  review,
  cover,
  date,
}
          : book
      );

      setBooks(updatedBooks);
      setEditingIndex(null);
    } else {
      setBooks([
        ...books,
        {
  title,
  author,
  status,
  review,
  cover,
  date,
},
      ]);
    }

    setTitle("");
    setAuthor("");
    setStatus("Quiero leer");
    setReview("");
    setCover("");
    setDate("");

    setShowForm(false);
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#1f2933] text-[#382110] p-6">
      <div className="max-w-md mx-auto pb-20">
        <h1 className="text-4xl font-serif font-bold mb-2 text-[#382110]">
          Mi biblioteca
        </h1>
<div className="flex gap-2 mb-6">
  <button
    onClick={() => {
      const data = JSON.stringify(books, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "biblioteca.json";
      a.click();
      URL.revokeObjectURL(url);
    }}
    className="bg-[#382110] text-white border border-[#ddd6cc] px-4 py-3 rounded-2xl text-sm"
  >
    ⬇ Exportar
  </button>

  <label className="bg-[#382110] text-white border border-[#ddd6cc] px-4 py-3 rounded-2xl text-sm">
    ⬆ Importar
    <input
      type="file"
      accept=".json"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          if (typeof text === "string") {
            setBooks(JSON.parse(text));
          }
        };
        reader.readAsText(file);
      }}
      className="hidden"
    />
  </label>
</div>
          <p className="text-[#6b5f55] mb-8 text-lg">
  Tu espacio personal para guardar libros.
</p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-black px-4 py-3 rounded-2xl w-full mb-6"
        >
          + Añadir libro
        </button>

        <input
          className="bg-[#0b1736] text-white placeholder:text-white/50"
          placeholder="Buscar por título, autor, estado o reseña..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
<div className="flex gap-2 overflow-x-auto mb-6">
  {["Todos", "Quiero leer", "Leyendo", "Leído", "Abandonado"].map((item) => (
    <button
      key={item}
      onClick={() => setShelf(item)}
      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
        shelf === item
          ? "bg-white text-black"
          : "bg-white text-[#382110] border border-[#ddd6cc]"
      }`}
    >
      {item}
    </button>
  ))}
</div>
        {showForm && (
  <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 space-y-3">
    <input className="bg-[#0b1736] text-white placeholder:text-white/50" placeholder="Título del libro" value={title} onChange={(e) => setTitle(e.target.value)} />
    <button
  onClick={searchBookInfo}
  className="bg-[#111827] text-[#382110] border border-[#ddd6cc] px-4 py-3 rounded-xl text-sm w-full"
>
  Buscar portada y autor
</button>
    <input className="bg-[#0b1736] text-white placeholder:text-white/50" placeholder="Autor" value={author} onChange={(e) => setAuthor(e.target.value)} />
    <select className="w-full border border-[#ddd6cc] bg-[#111827] text-[#382110] rounded-xl p-3" value={status} onChange={(e) => setStatus(e.target.value)}>
      <option>Quiero leer</option>
      <option>Leyendo</option>
      <option>Leído</option>
      <option>Abandonado</option>
    </select>
    <input className="bg-[#0b1736] text-white placeholder:text-white/50" placeholder="URL de la portada" value={cover} onChange={(e) => setCover(e.target.value)} />
    <input
  type="date"
  className="w-full border border-[#ddd6cc] bg-[#111827] text-[#382110] rounded-xl p-3"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>
    <textarea className="bg-[#0b1736] text-white placeholder:text-white/50" placeholder="Reseña personal" value={review} onChange={(e) => setReview(e.target.value)} />
    <button onClick={addBook} className="bg-black text-[#382110] px-4 py-3 rounded-2xl w-full">
      Guardar libro
    </button>
  </div>
)}

{selectedBook && (
  <div
  className="fixed inset-0 bg-black/40 z-50 flex items-end"
  onClick={() => setSelectedBook(null)}
>
    <div
  className="bg-white w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
  onClick={(e) => e.stopPropagation()}
>
      
      <button
        onClick={() => setSelectedBook(null)}
        className="mb-6 text-sm text-gray-500"
      >
        Cerrar
      </button>

      {selectedBook.cover && (
        <img
          src={selectedBook.cover}
          alt={selectedBook.title}
          className="w-40 h-56 object-contain rounded-2xl mb-4 mx-auto bg-[#222]"
        />
      )}

      <p className="text-gray-500 mb-2">
        {selectedBook.author}
      </p>

      <h2 className="text-4xl font-black tracking-tight mb-4">
        {selectedBook.title}
      </h2>

      <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mb-6">
        {selectedBook.status}
      </span>

      <p className="text-gray-700 leading-7">
        {selectedBook.review}
      </p>
    </div>
  </div>
)}
<div className="bg-white rounded-3xl p-4 border border-[#ddd6cc] mb-6">
  <div className="flex justify-between text-center">
    <div>
      <p className="text-xs text-[#6b5f55]">Total</p>
      <p className="text-xl font-bold text-[#382110]">
        {books.length}
      </p>
    </div>

    <div>
      <p className="text-xs text-[#6b5f55]">Leídos</p>
      <p className="text-xl font-bold text-[#382110]">
        {books.filter((b) => b.status === "Leído").length}
      </p>
    </div>

    <div>
      <p className="text-xs text-[#6b5f55]">Por leer</p>
      <p className="text-xl font-bold text-[#382110]">
        {books.filter((b) => b.status === "Quiero leer").length}
      </p>
    </div>
  </div>
</div>
        {tab === "biblioteca" && (
  <div className="space-y-4">
          {filteredBooks.map((book, index) => (
            <div
  key={index}
  onClick={() => setSelectedBook(book)}
  className="bg-[#1b1b1b] rounded-3xl p-4 shadow-md border border-neutral-200 overflow-hidden transition-all hover:scale-[1.01] cursor-pointer"
>
              {book.cover && (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-64 object-cover rounded-2xl mb-4"
                />
              )}

              <p className="text-sm text-gray-400 mb-1">{book.author}</p>

              <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
                {book.title}
              </h2>

              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mb-3">
                {book.status}
              </span>

              <p className="text-[#4b5563]">{book.review}</p>
{book.date && (
  <p className="text-sm text-gray-400 mt-3">
    Leído el {book.date}
  </p>
)}
              <button
                onClick={() => {
                  setTitle(book.title);
                  setAuthor(book.author);
                  setStatus(book.status);
                  setReview(book.review);
                  setCover(book.cover);

                  setEditingIndex(index);
                  setShowForm(true);
                }}
                className="mt-4 mr-4 text-blue-500 text-sm"
              >
                Editar
              </button>

              <button
                onClick={(e) => {
  e.stopPropagation();
                  const updatedBooks = books.filter((_, i) => i !== index);
                  setBooks(updatedBooks);
                }}
                className="mt-4 text-red-500 text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
</div>
<div className="fixed bottom-3 left-1/2 -translate-x-1/2 bg-white border border-[#ddd6cc] rounded-full px-3 py-2 flex gap-3 shadow-md text-sm">  <button
    onClick={() => setTab("biblioteca")}
    className={tab === "biblioteca" ? "text-[#382110]" : "text-gray-500"}
  >
    Biblioteca
  </button>

  <button
    onClick={() => setTab("estadisticas")}
    className={tab === "estadisticas" ? "text-[#382110]" : "text-gray-500"}
  >
    Estadísticas
  </button>
</div>
</main>
  );
  }