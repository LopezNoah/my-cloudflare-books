import type { Route } from "./+types/books.$id.edit";
import { redirect, Form, useLocation, data } from "react-router";
// import { BookService, updateBookSchema } from "~/lib/BookService";
// import type { UpdateBookData } from "~/lib/BookService";
import { InputField } from "~/components/InputField";
import { z } from "zod";
import { BookEditForm } from "~/components/BookEditForm";
import { useState } from "react";
import { BookCard } from "~/components/book-card";
import { AuthorService, BookService, GenreService } from "~/database/services";

const updateBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  pageCount: z.number().min(1, "Page count must be at least 1"),
  genres: z.array(
    z.string().min(1, "Each genre must have at least 1 character")
  ),
  authors: z.array(
    z.string().min(1, "Each author must have at least 1 character")
  ),
});

type UpdateBookData = z.infer<typeof updateBookSchema>;

export async function loader({ params, context }: Route.LoaderArgs) {
  const bookId = parseInt(params.id || "0");

  if (isNaN(bookId)) {
    throw data("Invalid Book ID", { status: 400 });
  }

  const bookService = new BookService(context.db);
  const authorService = new AuthorService(context.db);
  const genreService = new GenreService(context.db);

  const book = await bookService.getBookById(bookId);
  const allAuthors = await authorService.getAllAuthors();
  const allGenres = await genreService.getAllGenres();

  //This means we need to use the "add" route
  if (!book) {
    throw data("Book not found", { status: 404 });
  }

  return { book, allAuthors, allGenres };
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const bookId = parseInt(params.id || "0");
  if (isNaN(bookId)) {
    return data("Invalid Book ID", { status: 400 });
  }

  const formData = await request.formData();
  const bookService = new BookService(context.db);

  const title = formData.get("title")?.toString();
  const pageCount = parseInt(formData.get("pageCount")?.toString() || "0");
  const genres = formData.getAll("genres") as string[];
  const authors = formData.getAll("authors") as string[];

  const result = updateBookSchema.safeParse({
    title,
    pageCount,
    genres,
    authors,
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const updateData = result.data;

  try {
    await bookService.updateBook(bookId, updateData);
    return redirect(`/books/${bookId}`);
  } catch (error) {
    console.error("Error updating book:", error);
    return { errors: { general: "An unexpected error occurred." } };
  }
}

export default function BookEditPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { book, allAuthors, allGenres } = loaderData;
  const initialFormData: UpdateBookData = {
    title: book.title,
    pageCount: book.pageCount,
    genres: [], //book.bookGenre.map((g) => g.genre.name),
    authors: [], //book.bookAuthor.map((a) => a.author.name),
  };
  const [editFormData, setEditFormData] =
    useState<UpdateBookData>(initialFormData);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
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
