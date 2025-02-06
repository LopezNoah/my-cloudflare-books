import React from 'react';

interface Book {
  id: number;
  title: string;
  authors: string[]; // This should be strings, as per the API
  isbn?: string;
  pageCount?: number;
  genres: { name: string }[]; // This is also correct, matching the API.
}

// interface BookListProps {
//   onDelete: (id: number) => void;
//   // No need to pass genres and authors separately; they are *part* of the Book data.
// }

async function deleteBook(id: number) {
  if (confirm("Are you sure you want to delete this book?")) {
    await fetch(`/api/books/${id}`, { method: 'DELETE' });
    window.location.reload(); // Simple reload for now, consider better state management
  }
}

const BookList: React.FC = () => {
  const [books, setBooks] = React.useState<Book[]>([]);

  React.useEffect(() => {
    const fetchBooks = async () => {
      const response = await fetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data); // The API returns the full book data, including authors and genres.
      } else {
        console.error('Failed to fetch books');
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Authors</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genres</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {books.map((book) => (
            <tr key={book.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.authors.join(', ')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.genres.map(g => g.name).join(', ')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <a href={`/books/edit/${book.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</a>
                <button onClick={() => deleteBook(book.id)} className="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookList;