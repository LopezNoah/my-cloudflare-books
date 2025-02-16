// src/routes/books/index.tsx
import { Link, Outlet } from "react-router"; //  use `Link`
import type { Route } from "./+types/books"; // Import the generated type
import { BookCard } from "~/components/BookCard";
import { QueryClient, useQuery } from "@tanstack/react-query";
import type {
  Author,
  Book,
  BookAuthor,
  BookGenre,
  Genre,
} from "~/database/schema";

type BookWithRelations = Book & {
  bookAuthor: (BookAuthor & { author: Author })[];
  bookGenre: (BookGenre & { genre: Genre })[];
};

export async function loader({ context }: Route.LoaderArgs) {
  const books: BookWithRelations[] = await context.db.query.books.findMany({
    with: {
      bookAuthor: {
        // Fetch related BookAuthor entries
        with: {
          author: true, // Fetch the Author related to each BookAuthor
        },
      },
      bookGenre: {
        // Fetch related BookGenre entries
        with: {
          genre: true, // Fetch the Genre related to each BookGenre
        },
      },
    },
  });

  return { books };
}

// export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
//   // const queryClient = new QueryClient();
//   const queryClient = getQueryClient();
//   const cachedData = queryClient.getQueryData<BookWithRelations[]>(["books"]);
//   console.log("cached data", cachedData);
//   const data = cachedData ?? (await serverLoader());
//   console.log("new fetched data", data);
//   if (!cachedData) {
//     queryClient.setQueryData(["books"], data);
//   }
//   return data;
// }

// clientLoader.hydrate = true;

export default function BookListPage({ loaderData }: Route.ComponentProps) {
  const { books } = loaderData;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          My Library
        </h1>
        <Link
          to="/books/add"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out"
        >
          Add Book
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      <Outlet />
      {books.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">
          No books in your library yet. Add one!
        </p>
      )}
    </div>
  );
}
