import { data, Link, Outlet } from "react-router"; //  use `Link`
import type { Route } from "./+types/books"; // Import the generated type
import { BookCard } from "~/components/book-card";
import {
  authors,
  bookAuthors,
  bookGenres,
  bookReads,
  books,
  genres,
} from "~/database/schema";
import { getAuth } from "@clerk/react-router/ssr.server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const genreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Zod schema for a single Author
const authorSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const bookWithRelationsSchema = z.object({
  id: z.number(),
  title: z.string(),
  isbn: z.string().nullable(),
  pageCount: z.number(),
  genres: z.array(genreSchema), // Array of Genre objects
  authors: z.array(authorSchema), // Array of Author objects
  readCount: z.number(), // Count of BookReads
});

const bookWithRelationsArraySchema = z.array(bookWithRelationsSchema);

type BookWithRelations = z.infer<typeof bookWithRelationsArraySchema>;

export async function loader(args: Route.LoaderArgs) {
  const { context } = args;
  const { userId } = await getAuth(args);

  if (!userId) {
    throw data("Must log in", { status: 401 });
  }

  const booksResult: BookWithRelations = await context.db
    .select({
      id: books.id,
      title: books.title,
      isbn: books.isbn,
      pageCount: books.pageCount,
      genres: sql<
        { id: number; name: string }[]
      >`json_group_array(json_object('id', ${genres.id}, 'name', ${genres.name}))`, // Aggregate genres
      authors: sql<
        { id: number; name: string }[]
      >`json_group_array(json_object('id', ${authors.id}, 'name', ${authors.name}))`, // Aggregate authors
      readCount: sql`count(${bookReads.id})`.mapWith(Number), // Count bookReads, explicitly mapping to a Number
    })
    .from(books)
    .where(eq(books.userId, userId))
    .leftJoin(bookGenres, eq(books.id, bookGenres.bookId))
    .leftJoin(genres, eq(bookGenres.genreId, genres.id))
    .leftJoin(bookAuthors, eq(books.id, bookAuthors.bookId))
    .leftJoin(authors, eq(bookAuthors.authorId, authors.id))
    .leftJoin(bookReads, eq(books.id, bookReads.bookId)) //left join for read count
    .groupBy(books.id); // Group by book ID to aggregate correctly

  const transformedBooks = booksResult.map((row) => ({
    id: row.id,
    title: row.title,
    isbn: row.isbn,
    pageCount: row.pageCount,
    genres: JSON.parse(row.genres.toString()),
    authors: JSON.parse(row.authors.toString()),
    readCount: row.readCount,
  }));

  const validatedBooks =
    bookWithRelationsArraySchema.safeParse(transformedBooks);

  if (!validatedBooks.success) {
    throw new Error(validatedBooks.error.message);
  }

  return { books: validatedBooks.data };
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
