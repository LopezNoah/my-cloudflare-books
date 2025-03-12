import { Link } from "react-router";
import * as schema from "~/database/schema";
// import { InferSelectModel } from "drizzle-orm";
import type {
  Book,
  BookAuthor,
  Author,
  BookGenre,
  Genre,
} from "~/database/schema";

type BookWithRelations = {
  id: number;
  title: string;
  isbn: string | null;
  pageCount: number;
  genres: {
    id: number;
    name: string;
  }[];
  authors: {
    id: number;
    name: string;
  }[];
  readCount: number;
};

interface BookCardProps {
  book: BookWithRelations;
}

export function BookCard({ book }: BookCardProps) {
  console.log(book);
  return (
    <Link to={`/books/${book.id}`} className="block relative">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 ease-in-out group">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition duration-200">
            {book.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {book?.authors?.map((ba) => ba.name).join(", ")}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            {book.genres.map((bg) => bg.name).join(", ")}
          </p>
          {/* You can add a placeholder for the cover image here */}
          {/* <div className="mt-4 h-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>  Placeholder for cover */}
        </div>
        <div className="absolute bottom-2 right-2 text-sm text-gray-500 dark:text-gray-400">
          {book.pageCount} pages
        </div>
      </div>
    </Link>
  );
}
