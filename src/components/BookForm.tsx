import React, { useState, useEffect } from 'react';

interface Book {
  id?: number;
  title: string;
  authors: string[];
  isbn?: string;
  pageCount?: number;
//   genreIds?: number[];
}

interface BookFormProps {
  initialBook: Book | null;
  onSubmit: (book: Book) => void;
  genres: { id: number, name: string }[];
}

const BookForm: React.FC<BookFormProps> = ({ initialBook, onSubmit, genres }) => {
  const [bookData, setBookData] = useState<Book>(
    initialBook || { title: '', authors: [], genreIds: [] }
  );
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>(initialBook?.genreIds || []);

  useEffect(() => {
    if (initialBook) {
      setBookData(initialBook);
      setSelectedGenreIds(initialBook.genreIds || []);
    }
  }, [initialBook]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'authors') {
      setBookData({ ...bookData, authors: value.split(',').map(a => a.trim()) }); // Split authors by comma
    } else if (name === 'pageCount') {
      setBookData({ ...bookData, pageCount: value === '' ? undefined : parseInt(value, 10) });
    } else {
      setBookData({ ...bookData, [name]: value });
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
    setSelectedGenreIds(selectedOptions);
    setBookData({ ...bookData, genreIds: selectedOptions });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...bookData, genreIds: selectedGenreIds });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" id="title" name="title" value={bookData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="authors" className="block text-sm font-medium text-gray-700">Authors (comma separated)</label>
        <input type="text" id="authors" name="authors" value={bookData.authors.join(', ')} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN (Optional)</label>
        <input type="text" id="isbn" name="isbn" value={bookData.isbn || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700">Page Count (Optional)</label>
        <input type="number" id="pageCount" name="pageCount" value={bookData.pageCount || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      {/* <div>
        <label htmlFor="genres" className="block text-sm font-medium text-gray-700">Genres</label>
        <select
          id="genres"
          name="genres"
          multiple
          value={selectedGenreIds}
          onChange={handleGenreChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>
      </div> */}
      <div>
        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          {initialBook ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  );
};

export default BookForm;