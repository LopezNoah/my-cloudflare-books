// src/routes/books/$id.edit.tsx
import type { Route } from './+types/books.$id.edit';
import { Form, Link, redirect } from 'react-router';
import * as schema from "../../database/schema";
import { eq, inArray } from 'drizzle-orm';

export async function loader ({ params, context }: Route.LoaderArgs) {
    const bookId = parseInt(params.id || "0");

    if (isNaN(bookId)) {
        throw new Response("Invalid Book ID", { status: 400 });
    }

    const book = await context.db.query.books.findFirst({
        where: eq(schema.books.id, bookId),
        with: {
            bookAuthor: {
                with: { author: true }
            },
            bookGenre: {
                with: { genre: true }
            }
        }
    });

    if (!book) {
        throw new Response("Book not found", { status: 404 });
    }

    // Fetch all authors and genres for the dropdowns:
    const allAuthors = await context.db.select().from(schema.authors);
    const allGenres = await context.db.select().from(schema.genres);


    return { book, allAuthors, allGenres };
};

export async function action ({ params, context, request}: Route.ActionArgs) {
    const formData = await request.formData();
    const bookId = parseInt(params.id || "0");

    if (isNaN(bookId)) {
      throw new Response("Invalid Book ID", { status: 400 });
    }

    // Extract data from the form.  Use .getAll() for multi-selects.
    const title = formData.get("title")?.toString();
    const pageCount = parseInt(formData.get("pageCount")?.toString() || "0");  // Default to 0 if null/undefined
    // const authorIds = formData.getAll("authors").map(Number);  // Get all selected author IDs, convert to numbers
    // const genreIds = formData.getAll("genres").map(Number);    // Get all selected genre IDs, convert to numbers

    // --- Validation ---
    if (!title || title.trim().length === 0) {
      return { errors: { title: "Title is required" } };
    }
    if (isNaN(pageCount) || pageCount <= 0) {
      return { errors: { pageCount: "Page count must be a positive number" } };
    }
    // if (authorIds.length === 0) {
    //   return { errors: { authors: "At least one author must be selected" } };
    // }
    // if (genreIds.length === 0) {
    //   return { errors: { genres: "At least one genre must be selected" } };
    // }


    // --- Database Update ---
    try {
        await context.db.update(schema.books)
            .set({ title, pageCount })
            .where(eq(schema.books.id, bookId));

          // 2. Update authors (bookAuthor table)
          //  - Delete existing associations
        //   await tx.delete(schema.bookAuthors).where(eq(schema.bookAuthors.bookId, bookId));
        //   //  - Insert new associations
        //     for (const authorId of authorIds) {
        //         await tx.insert(schema.bookAuthors).values({ bookId, authorId });
        //     }
            

        //   // 3. Update genres (bookGenre table) - Similar to authors
        //   await tx.delete(schema.bookGenres).where(eq(schema.bookGenres.bookId, bookId));
        //   for (const genreId of genreIds) {
        //     await tx.insert(schema.bookGenres).values({ bookId, genreId });
        //   }
    } catch (error) {
        console.error("Error updating book:", error);
        return {
            errors: { general: "Failed to update book.  Please try again." },
        };
    }

    return redirect(`/books/${bookId}`); // Redirect back to the book detail page
};

// interface LoaderData {
//     book: Awaited<ReturnType<typeof loader>>['book'];
//     allAuthors: Awaited<ReturnType<typeof loader>>['allAuthors'];
//     allGenres: Awaited<ReturnType<typeof loader>>['allGenres']
// }

export default function EditBookPage({ loaderData }: Route.ComponentProps) {
    const { book, allAuthors, allGenres } = loaderData;
    const currentAuthorIds = book.bookAuthor.map((ba) => ba.authorId);
    const currentGenreIds = book.bookGenre.map((bg) => bg.genreId);

    return (
        <div>
            <h1>Edit Book: {book.title}</h1>

            <Form method="post" className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        defaultValue={book.title}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700">Page Count:</label>
                    <input
                        type="number"
                        id="pageCount"
                        name="pageCount"
                        defaultValue={book.pageCount ?? 0}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        min="1"
                    />
                </div>

                {/* <div>
                    <label htmlFor="authors" className="block text-sm font-medium text-gray-700">Authors:</label>
                    <select
                        id="authors"
                        name="authors"
                        multiple
                        defaultValue={currentAuthorIds}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    >
                        {allAuthors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="genres" className="block text-sm font-medium text-gray-700">Genres:</label>
                    <select
                        id="genres"
                        name="genres"
                        multiple
                        defaultValue={currentGenreIds}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    >
                        {allGenres.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div> */}

                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Save Changes
                </button>
                <Link to={`/books/${book.id}`} className="ml-4 text-blue-500 hover:underline">Cancel</Link>
            </Form>
        </div>
    );
}