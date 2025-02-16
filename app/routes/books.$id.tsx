import type { Route } from "./+types/books.$id";
import { Link, redirect, Form, useNavigation } from "react-router";
import type { ReadingSession } from "~/database/schema";
import { z } from "zod";
import { InputField } from "~/components/InputField";
import { BookService, addReadingSessionSchema } from "~/lib/BookService";
import type { BookWithRelations } from "~/lib/BookService";
import { useEffect, useState } from "react";
import { ReadingSessionModal } from "~/components/ReadingSessionModal";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}m`;
}

type LoaderData = {
  book: BookWithRelations;
  readingSessions: ReadingSession[];
  nextPageStart: number;
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
  const nextPageStart = await bookService.getNextPageStart(readingSessions);

  return { book, readingSessions, nextPageStart } satisfies LoaderData;
}

export async function action({ params, context, request }: Route.ActionArgs) {
  const bookId = parseInt(params.id || "0");
  if (isNaN(bookId)) {
    throw new Response("Invalid Book ID", { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();
  const bookService = new BookService(context.db);

  try {
    switch (intent) {
      case "add-reading-session": {
        const addSessionData = addReadingSessionSchema.parse({
          startTime: formData.get("startTime"),
          duration: formData.get("duration"),
          pageStart: formData.get("pageStart"),
          pageEnd: formData.get("pageEnd"),
          finishedBook: formData.get("finishedBook"),
          bookId: bookId, // Use the bookId from params
        });

        await bookService.addReadingSession(addSessionData);
        return redirect(`/books/${bookId}`);
      }
      default:
        return { errors: { general: "Invalid action intent" } };
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to a more usable format
      const errors = error.issues.reduce((acc, issue) => {
        const path = issue.path.join("."); // Handle nested paths
        acc[path] = issue.message;
        return acc;
      }, {} as Record<string, string>);
      return { errors };
    }
    return {
      errors: { general: "An unexpected error occurred." },
    };
  }
}

function BookDetailHeader({ book }: { book: BookWithRelations }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {book.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          <strong>Authors:</strong> Authors Coming Soon...
        </p>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          <strong>Genres:</strong>{" "}
          {book.bookGenre.map((bg) => bg.genre.name).join(", ") ||
            "No genres added"}
        </p>
      </div>
      <div className="mt-4 md:mt-0">
        <Link
          to={`/books/${book.id}/edit`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out mr-2"
        >
          Edit Book
        </Link>
      </div>
    </div>
  );
}

function BookDetailProgress({
  totalPagesRead,
  book,
  totalDuration,
}: {
  totalPagesRead: number;
  book: BookWithRelations;
  totalDuration: number;
}) {
  const percentageRead = book.pageCount
    ? (totalPagesRead / book.pageCount) * 100
    : 0;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Reading Progress
      </h2>
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300">
          Pages Read: {totalPagesRead} / {book.pageCount}
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${percentageRead.toFixed(1)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {percentageRead.toFixed(1)}% complete
        </p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-300">
          Total Read Time: {formatDuration(totalDuration)}
        </p>
      </div>
    </div>
  );
}

function BookDetailReadingSessions({
  readingSessions,
  onOpenAddSessionModal,
  bookId,
}: {
  readingSessions: ReadingSession[];
  onOpenAddSessionModal: () => void;
  bookId: number;
}) {
  const sortedSessions = [...readingSessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  const mostRecentSession =
    sortedSessions.length > 0 ? sortedSessions[0] : null;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        <Link to={`/books/${bookId}/reading-sessions`}>Reading Sessions</Link>
      </h2>
      {mostRecentSession ? (
        <ul className="space-y-2">
          <li
            key={mostRecentSession.id}
            className="bg-gray-100 dark:bg-gray-700 rounded-md p-3"
          >
            <Link
              to={`/reading-sessions/${mostRecentSession.id}/edit`}
              className="text-blue-600 hover:underline"
            >
              <p>
                Date:{" "}
                {new Date(mostRecentSession.startTime).toLocaleDateString()},
                Pages: {mostRecentSession.pageEnd}-{mostRecentSession.pageStart}
                , Read Time: {formatDuration(mostRecentSession.duration)}
              </p>
            </Link>
          </li>
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No reading sessions recorded yet.
        </p>
      )}

      <button
        onClick={onOpenAddSessionModal}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out mt-4"
      >
        Add Reading Session
      </button>
    </div>
  );
}

export default function BookDetailPage({
  loaderData,
  actionData,
  params,
}: Route.ComponentProps) {
  const { book, readingSessions, nextPageStart } = loaderData;
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const navigation = useNavigation();

  const totalPagesRead = readingSessions.reduce((acc, session) => {
    return (
      acc + (session.pageEnd ? session.pageEnd - (session.pageStart || 0) : 0)
    );
  }, 0);
  const percentageRead = book.pageCount
    ? (totalPagesRead / book.pageCount) * 100
    : 0;
  const totalDuration = readingSessions.reduce(
    (acc, session) => acc + session.duration,
    0
  );
  const pagesLeft = (book.pageCount ?? 0) - totalPagesRead;
  const pagesPerMinute =
    totalDuration === 0 ? 0 : totalPagesRead / totalDuration;
  const estimatedTimeToFinish =
    pagesPerMinute === 0 ? 0 : pagesLeft / pagesPerMinute;

  const handleOpenAddSessionModal = () => {
    setShowAddSessionModal(true);
  };

  const handleCloseAddSessionModal = () => {
    setShowAddSessionModal(false);
  };

  useEffect(() => {
    // Check if the form was submitted successfully and there are no errors
    if (navigation.state === "idle" && !actionData?.errors) {
      setShowAddSessionModal(false);
    }
  }, [navigation.state, actionData]);

  return (
    <div className="p-4 md:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <BookDetailHeader book={book} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BookDetailProgress
            totalPagesRead={totalPagesRead}
            book={book}
            totalDuration={totalDuration}
          />
          <div>
            <p className="text-gray-600 dark:text-gray-300">
              Estimated Time to Finish: {formatDuration(estimatedTimeToFinish)}
            </p>
          </div>

          <BookDetailReadingSessions
            bookId={book.id}
            readingSessions={readingSessions}
            onOpenAddSessionModal={handleOpenAddSessionModal}
          />
        </div>

        <div className="mt-8">
          <Link to={`/books`} className="text-blue-600 hover:underline">
            Back to all books
          </Link>
        </div>
      </div>

      {showAddSessionModal && (
        <ReadingSessionModal
          onClose={handleCloseAddSessionModal}
          actionData={actionData}
          nextPageStart={nextPageStart}
        />
      )}
    </div>
  );
}
