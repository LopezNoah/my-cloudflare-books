import { BookOpen, Search, Filter, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router";
import type { Route } from "./+types/library";
import { getAuth } from "@clerk/react-router/ssr.server";
import * as schema from "~/database/schema";
import { and, eq } from "drizzle-orm";

// Mock data for books
const books = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "/placeholder.svg?height=240&width=160",
    progress: 85,
    rating: 4.5,
    type: "Novel",
    status: "reading",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "/placeholder.svg?height=240&width=160",
    progress: 100,
    rating: 5,
    type: "Non-Fiction",
    status: "completed",
  },
  {
    id: 3,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    cover: "/placeholder.svg?height=240&width=160",
    progress: 42,
    rating: 4,
    type: "Finance",
    status: "reading",
  },
  {
    id: 4,
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "/placeholder.svg?height=240&width=160",
    progress: 100,
    rating: 4.8,
    type: "Sci-Fi",
    status: "completed",
  },
  {
    id: 5,
    title: "The House in the Cerulean Sea",
    author: "TJ Klune",
    cover: "/placeholder.svg?height=240&width=160",
    progress: 0,
    rating: 0,
    type: "Fantasy",
    status: "to-read",
  },
  {
    id: 6,
    title: "Educated",
    author: "Tara Westover",
    cover: "/placeholder.svg?height=240&width=160",
    progress: 0,
    rating: 0,
    type: "Memoir",
    status: "to-read",
  },
  {
    id: 7,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    cover: "/placeholder.svg?height=240&width=160",
    progress: 100,
    rating: 4.2,
    type: "Thriller",
    status: "completed",
  },
  {
    id: 8,
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    cover: "/placeholder.svg?height=240&width=160",
    progress: 65,
    rating: 4.3,
    type: "Literary Fiction",
    status: "reading",
  },
];

export async function loader(args: Route.LoaderArgs) {
  // Fetch data from your data source here
  // For example, if you're using a database:
  // const data = await db.books.findMany();
  // return data;
  const { request, context } = args;
  const { userId } = await getAuth(args);
  const db = context.db;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const allBooks = await db
    .select()
    .from(schema.books)
    .where(eq(schema.books.userId, userId))
    .all();
  const enrichedBooks = await Promise.all(
    allBooks.map(async (book) => {
      const latestRead = await db.query.bookReads.findFirst({
        where: and(
          eq(schema.bookReads.bookId, book.id),
          eq(schema.bookReads.userId, userId)
        ),
        orderBy: (bookReads, { desc }) => desc(bookReads.startedAt),
      });
      let status: "reading" | "completed" | "to-read" = "to-read";
      let progress = 0;

      if (latestRead) {
        if (latestRead.finishedAt) {
          status = "completed";
          progress = 100; // Book is completed
        } else {
          // No finish date means we are either reading or have abandoned the book
          if (latestRead.abandoned) {
            status = "to-read";
          } else {
            status = "reading";
            const sessions: schema.ReadingSession[] = await db
              .select()
              .from(schema.readingSessions)
              .where(eq(schema.readingSessions.bookReadId, latestRead.id))
              .all();

            let totalPagesRead = 0;
            for (const session of sessions) {
              totalPagesRead += session.pageEnd - session.pageStart + 1;
            }
            progress = book.pageCount
              ? Math.floor((totalPagesRead / book.pageCount) * 100)
              : 0;
          }
        }
      }

      //Fetch Author -- Simplified, this gets only the *first* author
      const firstAuthor = await db.query.bookAuthors.findFirst({
        with: {
          author: true,
        },
        where: eq(schema.bookAuthors.bookId, book.id),
      });

      //Placeholder Image Logic
      let coverImage = `/placeholder.svg?height=240&width=160`;
      if (book.isbn) {
        coverImage = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=false`;
      }

      return {
        id: book.id,
        title: book.title,
        author: firstAuthor?.author.name || "Unknown Author", // Handle cases where author is missing
        cover: undefined,
        progress,
        status,
        pageCount: book.pageCount,
      };
    })
  );
  return enrichedBooks; // Return the loaded and processed data.
}

export default function LibraryPage({ loaderData }: Route.ComponentProps) {
  const books = loaderData;
  return (
    <div className="relative z-10">
      <div className="container mx-auto px-4 py-8 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-lg shadow-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Library</h1>
          <p className="text-muted-foreground">
            Browse and manage your reading collection
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, author, or genre..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" asChild>
              <Link to="/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Books</TabsTrigger>
            <TabsTrigger value="reading">Currently Reading</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="to-read">To Read</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="reading" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books
                .filter((book) => book.status === "reading")
                .map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
            </div>
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books
                .filter((book) => book.status === "completed")
                .map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
            </div>
          </TabsContent>
          <TabsContent value="to-read" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books
                .filter((book) => book.status === "to-read")
                .map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookCard({ book }: { book: any }) {
  return (
    <Link to={`/books/${book.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] w-full overflow-hidden">
            <img
              src={book.cover || "/placeholder.svg"}
              alt={`Cover of ${book.title}`}
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
              <Badge
                variant="outline"
                className={`
                  ${
                    book.status === "reading"
                      ? "border-emerald-400 text-emerald-400"
                      : ""
                  }
                  ${
                    book.status === "completed"
                      ? "border-blue-400 text-blue-400"
                      : ""
                  }
                  ${
                    book.status === "to-read"
                      ? "border-amber-400 text-amber-400"
                      : ""
                  }
                `}
              >
                {book.status === "reading" ? "Currently Reading" : ""}
                {book.status === "completed" ? "Completed" : ""}
                {book.status === "to-read" ? "To Read" : ""}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold line-clamp-1">{book.title}</h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary">{book.type}</Badge>
              {book.rating > 0 && (
                <div className="flex items-center">
                  <span className="text-xs font-medium">{book.rating}</span>
                  <svg
                    className="ml-1 h-4 w-4 fill-yellow-400 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              )}
            </div>
            {book.progress > 0 && book.progress < 100 && (
              <div className="mt-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {/* <BookOpen className="h-3.5 w-3.5" /> */}
                    <span>{book.progress}%</span>
                  </div>
                </div>
                <Progress value={book.progress} className="h-1.5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
