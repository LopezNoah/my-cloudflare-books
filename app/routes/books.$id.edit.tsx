import type { Route } from "./+types/books.$id.edit";
import { redirect, Form, useLocation } from "react-router";
import { BookService, updateBookSchema } from "~/lib/BookService";
import type { UpdateBookData } from "~/lib/BookService";
import { InputField } from "~/components/InputField";
import { z } from "zod";
import { BookEditForm } from "~/components/BookEditForm";
import { useState } from "react";

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
  return { book };
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const bookId = parseInt(params.id || "0");
  if (isNaN(bookId)) {
    throw new Response("Invalid Book ID", { status: 400 });
  }

  const formData = await request.formData();
  const bookService = new BookService(context.db);

  try {
    const pageCountString = formData.get("pageCount") as string;
    const pageCountNumber = parseInt(pageCountString, 10);
    const genres = formData.getAll("genres") as string[];
    const authors = formData.getAll("authors") as string[];
    const data = updateBookSchema.parse({
      title: formData.get("title"),
      pageCount: pageCountNumber,
      genres: genres,
      authors: authors,
    });
    await bookService.updateBook(bookId, data);
    return redirect(`/books/${bookId}`); // Redirect back to detail page
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.reduce((acc, issue) => {
        const path = issue.path.join(".");
        acc[path] = issue.message;
        return acc;
      }, {} as Record<string, string>);
      return { errors };
    }
    return { errors: { general: "An unexpected error occurred." } };
  }
}

export default function BookEditPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { book } = loaderData;
  const initialFormData: UpdateBookData = {
    title: book.title,
    pageCount: book.pageCount || 0,
    genres: book.bookGenre.map((g) => g.genre.name),
    authors: book.bookAuthor.map((a) => a.author.name),
  };
  const [editFormData, setEditFormData] =
    useState<UpdateBookData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "genres" || name === "authors") {
      // Split the comma-separated string into an array
      const values = value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean); // Remove whitespace and empty strings
      setEditFormData((prev) => ({ ...prev, [name]: values }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: name === "pageCount" ? parseInt(value) : value, // Parse pageCount to number
      }));
    }
  };

  return (
    <BookEditForm
      book={book}
      actionData={actionData}
      handleInputChange={handleInputChange}
      editFormData={editFormData}
    />
  );
}
