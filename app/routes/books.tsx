// src/routes/books/index.tsx
import React from 'react';
import { Link, Outlet } from 'react-router'; //  use `Link`
import type { Route } from './+types/books'; // Import the generated type
import * as schema from "../../database/schema";
// import { generateLoader } from "@react-router/dev/server";


export async function loader ({ params, context }: Route.LoaderArgs) {
    const books = await context.db.query.books.findMany({
        with: {
            bookAuthor: { // Fetch related BookAuthor entries
                with: {
                    author: true // Fetch the Author related to each BookAuthor
                }
            },
            bookGenre: { // Fetch related BookGenre entries
                with: {
                    genre: true // Fetch the Genre related to each BookGenre
                }
            },
        },
    });
  return { books };
};

export default function BookListPage({ loaderData }: Route.ComponentProps) {
  const { books } = loaderData;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Library</h1>
        <div className="flex space-x-2">
          <Link to="/books/add" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Add Book
          </Link>
        </div>
      </div>
      <h2 className="font-bold mb-4">All Books</h2>
      <Outlet />
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <Link to={`/books/${book.id}`}>
              <a>{book.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}