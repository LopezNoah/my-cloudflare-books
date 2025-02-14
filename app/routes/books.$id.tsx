// src/routes/books/$id.tsx
import type { Route } from './+types/books.$id';
import { Link, Outlet } from 'react-router';
import * as schema from "../../database/schema";
import { desc, eq } from 'drizzle-orm';


// Utility function (keep this)
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export async function loader ({ params, context }: Route.LoaderArgs) {
    const bookId = parseInt(params.id || "0");

    if (isNaN(bookId)) {
         throw new Response("Invalid Book ID", { status: 400 });
    }

    const book = await context.db.query.books.findFirst({
        where: eq(schema.books.id, bookId),
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


    if (!book) {
        throw new Response("Book not found", {status: 404});
    }

   const readingSessions = await context.db
    .select()
    .from(schema.readingSessions)
    .where(eq(schema.readingSessions.bookId, bookId))
    .orderBy(desc(schema.readingSessions.startTime));



    let nextPageStart = 1;
    if (readingSessions.length > 0) {
        // Find the maximum pageEnd.  Use .reduce() because it's client-side now.
        const maxPageEnd = readingSessions.reduce((maxPage, session) => {
            return session.pageEnd !== null && session.pageEnd !== undefined && session.pageEnd > maxPage
                ? session.pageEnd
                : maxPage;
        }, 0); // Initialize with 0

        nextPageStart = maxPageEnd + 1;
    }


     return { book, readingSessions, nextPageStart }; // Return all data
};

// interface LoaderData {
//   book: BookType & {
//     authors: { author: { name: string; id: number } }[];
//     genres: { genre: { name: string; id: number } }[];
//     readingSessions: ReadingSession[];
//   };
//   readingSessions: ReadingSession[];
//   nextPageStart: number;
// }


export default function BookDetailPage({ loaderData }: Route.ComponentProps) {
    const { book, readingSessions, nextPageStart } = loaderData;

    // Calculate percentages and format data (keep this)
     const totalPagesRead = readingSessions.reduce((acc, session) => {
        return acc + (session.pageEnd ? (session.pageEnd - (session.pageStart || 0)) : 0);  //handle null and undefined
    }, 0);
    const percentageRead = book.pageCount ? (totalPagesRead / book.pageCount) * 100 : 0;
    const totalDuration = readingSessions.reduce((acc, session) => acc + session.duration, 0);

    return (
      <div>
        <h1>{book.title}</h1>
        <p>
          <strong>Authors:</strong>{" "}
            {book.bookAuthor.map((ba) => ba.author.name).join(", ")}
        </p>
        <p>
            <strong>Genres: </strong>
              {book.bookGenre.map(bg => bg.genre.name).join(", ")}
        </p>

        <h2>Pages Read</h2>
        <p>
          {totalPagesRead} / {book.pageCount}
        </p>
        <p>{percentageRead.toFixed(1)}%</p>

        <h2>Read Time</h2>
        <p>{formatDuration(totalDuration)}</p>

        <h2>Reading Sessions ({readingSessions.length})</h2>
        {readingSessions.length === 0 ? (
          <p>No reading sessions recorded yet.</p>
        ) : (
           <ul>
            {readingSessions.map((session) => (
              <li key={session.id}>
                <Link to={`/reading-sessions/${session.id}/edit`}>
                  <a>
                    Start: {session.startTime.toLocaleString()}, Duration:{" "}
                    {formatDuration(session.duration)}, Pages:{" "}
                    {session.pageStart}-{session.pageEnd}, Finished:{" "}
                    {session.finishedBook ? "Yes" : "No"}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link to={`/reading-sessions/add?bookId=${book.id}&nextPage=${nextPageStart}`}>
          <a>Add Reading Session</a>
        </Link>

        <h2>Ratings (0)</h2>
        <p>No extra ratings added yet. Add extra information, notes, or reviews.</p>

        <Link to={`/books/${book.id}/edit`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Edit Book
        </Link>
        <Outlet/>
         <Link to={`/books`}>Back to all books</Link>
      </div>
    );
}