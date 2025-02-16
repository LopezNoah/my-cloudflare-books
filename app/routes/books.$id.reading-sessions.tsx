import type { Route } from "./+types/books.$id.reading-sessions";
import { Link, redirect } from "react-router";
import type { ReadingSession } from "~/database/schema";
import { z } from "zod";
import { BookService } from "~/lib/BookService";
import type { BookWithRelations } from "~/lib/BookService";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

type LoaderData = {
  book: BookWithRelations;
  readingSessions: ReadingSession[];
};

export async function loader({ params, context }: Route.LoaderArgs) {
  const bookId = parseInt(params.id || "0");

  if (isNaN(bookId)) {
    throw new Response("Invalid Book ID", { status: 400 });
  }

  const bookService = new BookService(context.db);
  const book = await bookService.getBookWithRelations(bookId);

  if (!book) {
    throw new Response("Book not found", { status: 404 });
  }

  const readingSessions = await bookService.getReadingSessions(bookId);

  return { book, readingSessions } satisfies LoaderData;
}

function ReadingSessionsList({
  readingSessions,
}: {
  readingSessions: ReadingSession[];
}) {
  return (
    <div>
      {readingSessions.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No reading sessions recorded yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {readingSessions.map((session) => (
            <li
              key={session.id}
              className="bg-gray-100 dark:bg-gray-700 rounded-md p-3"
            >
              <Link
                to={`/reading-sessions/${session.id}/edit`}
                className="text-blue-600 hover:underline"
              >
                <p>
                  Start: {new Date(session.startTime).toLocaleDateString()},
                  Duration: {formatDuration(session.duration)}, Pages:{" "}
                  {session.pageStart}-{session.pageEnd}, Finished:{" "}
                  {session.finishedBook ? "Yes" : "No"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BookReadingSessionsPage({
  loaderData,
}: Route.ComponentProps) {
  const { book, readingSessions } = loaderData;

  const totalPagesRead = readingSessions.reduce((acc, session) => {
    return (
      acc + (session.pageEnd ? session.pageEnd - (session.pageStart || 0) : 0)
    );
  }, 0);

  const totalDuration = readingSessions.reduce(
    (acc, session) => acc + session.duration,
    0
  );

  const numSessions = readingSessions.length;
  const averagePagesPerSession =
    numSessions > 0 ? totalPagesRead / numSessions : 0;
  const averageDurationPerSession =
    numSessions > 0 ? totalDuration / numSessions : 0;
  const averageMinutesPerPage =
    totalPagesRead > 0 ? totalDuration / totalPagesRead : 0;
  const averagePagesPerHour =
    totalDuration > 0 ? (totalPagesRead / totalDuration) * 60 : 0;

  return (
    <div className="p-4 md:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Reading Sessions for {book.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Reading Statistics
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Average Pages per Session: {averagePagesPerSession.toFixed(2)}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Average Read Time per Session:{" "}
              {formatDuration(Math.round(averageDurationPerSession))}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Average Minutes per Page: {averageMinutesPerPage.toFixed(2)}{" "}
              min/page
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Average Pages per Hour: {averagePagesPerHour.toFixed(2)}{" "}
              pages/hour
            </p>
          </div>
        </div>

        <ReadingSessionsList readingSessions={readingSessions} />

        <div className="mt-8">
          <Link
            to={`/books/${book.id}`}
            className="text-blue-600 hover:underline"
          >
            Back to Book Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
