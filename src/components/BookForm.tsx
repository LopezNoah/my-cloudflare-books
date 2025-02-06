import React, { useState, useEffect } from 'react';
import type { Book, Genre, Author } from '@prisma/client';

interface BookFormProps {
  initialBook: Book | null;
  genres: Genre[];
}

async function handleAddBook(bookData: Partial<Book>, selectedGenreIds: number[], selectedAuthorIds: number[]) {
  const response = await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...bookData, genreIds: selectedGenreIds, authorIds: selectedAuthorIds }),
  });
  if (response.ok) {
    window.location.href = '/';
  } else {
    alert('Failed to add book');
    console.error('Error adding book:', await response.json());
  }
}

async function handleUpdateBook(bookData: Partial<Book>, selectedGenreIds: number[], selectedAuthorIds: number[]) {
    const response = await fetch(`/api/books/${bookData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookData, genreIds: selectedGenreIds, authorIds: selectedAuthorIds }),
    });
    if (response.ok) {
      window.location.href = '/';
    }
    else {
        alert('Failed to update book');
        console.error('Error updating book', await response.json());
    }
}


const BookForm: React.FC<BookFormProps> = ({ initialBook, genres }) => {
  const [bookData, setBookData] = useState<Partial<Book>>(
    initialBook || {
      id: 0,
      title: '',
      isbn: undefined,
      pageCount: undefined,
    }
  );

  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]); // State for selected author IDs
  const [authors, setAuthors] = useState<Author[]>([]); // State for the list of authors

    // Fetch authors on component mount
    useEffect(() => {
      const fetchAuthors = async () => {
        const response = await fetch('/api/authors');
        if (response.ok) {
          const authorData: Author[] = await response.json();
          setAuthors(authorData);
        } else {
          console.error("Error fetching authors", await response.json());
        }
      };
      fetchAuthors();
    }, []);

  useEffect(() => {
    if (initialBook) {
      setBookData({
        ...initialBook,
        isbn: initialBook.isbn ?? undefined,
        pageCount: initialBook.pageCount ?? undefined,
      });

      const fetchInitialGenres = async () => {
        const response = await fetch(`/api/genres`);
        if (response.ok) {
          const initialGenres: Genre[] = await response.json();
          setSelectedGenreIds(initialGenres.map((g) => g.id));
        } else {
          console.error("Error fetching initial genres", await response.json());
        }
      };
        fetchInitialGenres();

      // Fetch initial authors for editing (similar to genres)
      const fetchInitialAuthors = async () => {
        const response = await fetch(`/api/books/${initialBook.id}`);  // Fetch the *book*, not authors
        if (response.ok) {
          const book: Book = await response.json();

          const response2 = await fetch(`/api/authors`);
          if(response2.ok){
            const authorsList: Author[] = await response2.json();
            // const selectedAuthors = authorsList.filter(author => book.authors.includes(author.name));
            // setSelectedAuthorIds(selectedAuthors.map(a => a.id));
          } else {
            console.error("Failed to fetch list of authors.", await response2.json());
          }
        } else {
          console.error("Error fetching initial book details", await response.json());
        }
      };
      fetchInitialAuthors();
    } else {
      setBookData({
        id: 0,
        title: '',
        isbn: undefined,
        pageCount: undefined,
      })
      setSelectedGenreIds([]);
      setSelectedAuthorIds([]); // Reset author IDs as well
    }
  }, [initialBook]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'pageCount') {
      const parsedPageCount = parseInt(value, 10);
      setBookData({ ...bookData, pageCount: isNaN(parsedPageCount) ? undefined : parsedPageCount });
    } else if (name === "isbn") {
      setBookData({ ...bookData, [name]: value === "" ? undefined : value })
    }
    else {
      setBookData({ ...bookData, [name]: value });
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, (option) => parseInt(option.value, 10));
    setSelectedGenreIds(options);
  };

    const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions, (option) => parseInt(option.value, 10));
        setSelectedAuthorIds(options);
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialBook) {
        handleUpdateBook(bookData, selectedGenreIds, selectedAuthorIds);
    }
    else {
      handleAddBook(bookData, selectedGenreIds, selectedAuthorIds);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" id="title" name="title" value={bookData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN (Optional)</label>
        <input type="text" id="isbn" name="isbn" value={bookData.isbn || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700">Page Count (Optional)</label>
        <input type="number" id="pageCount" name="pageCount" value={bookData.pageCount === undefined || bookData.pageCount === null ? 0 : bookData.pageCount} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="genres" className="block text-sm font-medium text-gray-700">Genres</label>
        <select
          id="genres"
          name="genres"
          multiple
          value={selectedGenreIds.map(String)}
          onChange={handleGenreChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {/* Author Dropdown */}
      <div>
        <label htmlFor="authors" className="block text-sm font-medium text-gray-700">Authors</label>
        <select
          id="authors"
          name="authors"
          multiple
          value={selectedAuthorIds.map(String)}
          onChange={handleAuthorChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          {initialBook ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  );
};

export default BookForm;