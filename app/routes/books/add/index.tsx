// src/routes/books.add.tsx
import { Form, Link, redirect } from "react-router";
import * as schema from "~/database/schema";
import type { Route } from "./+types";
import { BookService } from "~/lib/BookService";
import { z } from "zod";

export async function loader({ context }: Route.LoaderArgs) {
  // Fetch all authors and genres for the dropdowns (if you add them later):
  const allAuthors = await context.db.select().from(schema.authors);
  const allGenres = await context.db.select().from(schema.genres);
  return { allAuthors, allGenres };
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const bookService = new BookService(context.db);

  const title = formData.get("title")?.toString();
  const pageCount = parseInt(formData.get("pageCount")?.toString() || "0");
  const genres = formData.getAll("genres") as string[];
  const authors = formData.getAll("authors") as string[];

  try {
    const newBookId = await bookService.createBook({
      title: title || "",
      pageCount,
      genres,
      authors,
    });

    return redirect(`/books/${newBookId}`);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.reduce((acc, issue) => {
        const path = issue.path.join(".");
        acc[path] = issue.message;
        return acc;
      }, {} as Record<string, string>);
      return { errors };
    }
    console.error("Error adding book:", error);
    return {
      errors: { general: "Failed to add book.  Please try again." },
    };
  }
}

export default function AddBookPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        Add New Book
      </h1>
      <Form
        method="post"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full md:w-3/4 lg:w-1/2"
      >
        {actionData?.errors?.general && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{actionData.errors.general}</span>
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-900 dark:text-gray-100"
            required
          />
          {actionData?.errors?.title && (
            <p className="text-red-500 text-xs mt-1">
              {actionData.errors.title}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="pageCount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Page Count:
          </label>
          <input
            type="number"
            id="pageCount"
            name="pageCount"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-900 dark:text-gray-100"
            required
            min="1"
          />
          {actionData?.errors?.pageCount && (
            <p className="text-red-500 text-xs mt-1">
              {actionData.errors.pageCount}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="genres"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Genres (comma-separated):
          </label>
          <input
            type="text"
            id="genres"
            name="genres"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-900 dark:text-gray-100"
          />
          {actionData?.errors?.genres && (
            <p className="text-red-500 text-xs mt-1">
              {actionData.errors.genres}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="authors"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Authors (comma-separated):
          </label>
          <input
            type="text"
            id="authors"
            name="authors"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-900 dark:text-gray-100"
          />
          {actionData?.errors?.authors && (
            <p className="text-red-500 text-xs mt-1">
              {actionData.errors.authors}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out"
          >
            Add Book
          </button>
          <Link to="/books" className="ml-4 text-gray-600 hover:underline">
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
}
