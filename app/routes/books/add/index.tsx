// src/routes/books.add.tsx
// import type { Route } from '../+types/books/add';
import type { Route } from '../+types/add';
import { Form, Link, redirect } from 'react-router';
// import * as schema from "../../database/schema";
import * as schema from "../../../../database/schema";

export async function loader({ context }: Route.LoaderArgs) {
    // Fetch all authors and genres for the dropdowns (if you add them later):
    const allAuthors = await context.db.select().from(schema.authors);
    const allGenres = await context.db.select().from(schema.genres);
    return { allAuthors, allGenres };
}

export async function action({ context, request }: Route.ActionArgs) {
    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const pageCount = parseInt(formData.get("pageCount")?.toString() || "0");
    // const authorIds = formData.getAll("authors").map(Number);
    // const genreIds = formData.getAll("genres").map(Number);

    if (!title || title.trim().length === 0) {
        return { errors: { title: "Title is required" } };
    }
    if (isNaN(pageCount) || pageCount <= 0) {
        return { errors: { pageCount: "Page count must be a positive number" } };
    }
    // if (authorIds.length === 0) {
    //     return { errors: { authors: "At least one author must be selected" } };
    // }
    // if (genreIds.length === 0) {
    //     return { errors: { genres: "At least one genre must be selected" } };
    // }

    try {
        const [newBook] = await context.db.insert(schema.books).values({ title, pageCount }).returning({ insertedId: schema.books.id });

        // if(authorIds.length > 0){
        //     for (const authorId of authorIds) {
        //         await context.db.insert(schema.bookAuthors).values({ bookId: newBook.insertedId, authorId });
        //     }
        // }

        //  if(genreIds.length > 0){
        //     for (const genreId of genreIds) {
        //      await context.db.insert(schema.bookGenres).values({ bookId: newBook.insertedId, genreId });
        //     }
        // }


        return redirect(`/books/${newBook.insertedId}`);
    } catch (error) {
        console.error("Error adding book:", error);
        return {
            errors: { general: "Failed to add book.  Please try again." },
        };
    }
}

// interface LoaderData {
//  allAuthors: Awaited<ReturnType<typeof loader>>['allAuthors'];
//  allGenres: Awaited<ReturnType<typeof loader>>['allGenres']
// }

export default function AddBookPage({ loaderData }: Route.ComponentProps) {
    // const { allAuthors, allGenres } = loaderData;

    return (
        <div>
            <h1>Add New Book</h1>

            <Form method="post" className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        min="1"
                    />
                </div>
                {/*
                <div>
                    <label htmlFor="authors" className="block text-sm font-medium text-gray-700">Authors:</label>
                    <select
                        id="authors"
                        name="authors"
                        multiple
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    >
                        {allGenres.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>
                 */}

                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add Book
                </button>
                <Link to="/books" className="ml-4 text-blue-500 hover:underline">Cancel</Link>
            </Form>
        </div>
    );
}