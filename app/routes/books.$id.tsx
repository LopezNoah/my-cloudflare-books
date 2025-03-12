// import type { Route } from "./+types/books.$id";
// import { Link, redirect, Form, useNavigation, data } from "react-router";
// import {
//   type Book,
//   type BookRead,
//   type ReadingSession,
// } from "~/database/schema";
// import { z } from "zod";
// import { useEffect, useState } from "react";
// import { ReadingSessionModal } from "~/components/ReadingSessionModal";
// import {
//   ReadingSessionService,
//   BookService,
//   BookReadService,
// } from "~/database/services";
// import { getAuth } from "@clerk/react-router/ssr.server";

// function formatDuration(minutes: number): string {
//   const hours = Math.floor(minutes / 60);
//   const remainingMinutes = Math.round(minutes % 60);
//   return `${hours}h ${remainingMinutes}m`;
// }

// function getNextPageStart(readingSessions: ReadingSession[]): number {
//   let nextPageStart: number = 1;
//   if (readingSessions.length > 0) {
//     const maxPageEnd = readingSessions.reduce((maxPage, session) => {
//       return session.pageEnd > maxPage ? session.pageEnd : maxPage;
//     }, 0);
//     nextPageStart = maxPageEnd + 1;
//   }
//   return nextPageStart;
// }

// type LoaderData = {
//   book: Book;
//   bookReadsData: {
//     bookRead: BookRead;
//     nextPageStart: number;
//     readingSessions: ReadingSession[];
//   }[];
// };

// const addReadingSessionSchema = z.object({
//   startTime: z.string().datetime(),
//   duration: z.coerce.number().int().min(1),
//   pageStart: z.coerce.number().int().min(1),
//   pageEnd: z.coerce.number().int().min(1),
//   finishedBook: z.coerce.boolean().optional(),
//   bookReadId: z.number().int(),
// });

// export async function loader(args: Route.LoaderArgs) {
//   const { params, context } = args;
//   const bookId = parseInt(params.id || "0");
//   const { userId } = await getAuth(args);

//   if (isNaN(bookId)) {
//     throw data("Invalid Book ID", { status: 400 });
//   }

//   if (!userId) {
//     throw data("User not authenticated", { status: 401 });
//   }

//   const bookService = new BookService(context.db);
//   const readingSessionService = new ReadingSessionService(context.db);
//   const bookReadService = new BookReadService(context.db);

//   const book = await bookService.getBookById(bookId);

//   if (!book) {
//     throw data("Book not found", { status: 404 });
//   }

//   const bookReads = await bookReadService.getBookReadsByUserId(userId);
//   const bookReadsForBook = bookReads.filter((br) => br.bookId === bookId);

//   const bookReadsData: LoaderData["bookReadsData"] = [];

//   for (const bookRead of bookReadsForBook) {
//     const readingSessions = await readingSessionService.getSessionsForBookRead(
//       bookRead.id
//     );
//     let nextPageStart = getNextPageStart(readingSessions);

//     bookReadsData.push({
//       bookRead,
//       readingSessions,
//       nextPageStart,
//     });
//   }

//   return {
//     book,
//     bookReadsData,
//   } satisfies LoaderData;
// }

// export async function action(args: Route.ActionArgs) {
//   const { params, context, request } = args;
//   const { userId } = await getAuth(args);
//   const bookId = parseInt(params.id || "0");

//   if (!userId) {
//     return { errors: { general: "User not authenticated" } }; // Simpler error return
//   }

//   if (isNaN(bookId)) {
//     return { errors: { general: "Invalid Book ID" } }; // Simpler error return
//   }

//   const formData = await request.formData();
//   const intent = formData.get("intent")?.toString();
//   const bookService = new BookService(context.db);
//   const readingSessionService = new ReadingSessionService(context.db);
//   const bookReadService = new BookReadService(context.db);

//   try {
//     switch (intent) {
//       case "add-reading-session": {
//         // 1. Determine or create the BookRead ID.
//         let bookReadId = parseInt(formData.get("bookReadId")?.toString() || "");
//         let newBookRead = null; // Keep track if we created a new BookRead

//         if (isNaN(bookReadId)) {
//           const userBookReads = await bookReadService.getBookReadsByUserId(
//             userId
//           );
//           const activeBookRead = userBookReads.find(
//             (br) =>
//               br.bookId === bookId && br.finishedAt === null && !br.abandoned
//           );
//           bookReadId = activeBookRead?.id || 0;

//           if (!bookReadId) {
//             // Start reading the book if there's no active BookRead
//             const startedAt = new Date().toISOString();
//             newBookRead = await bookReadService.startReadingBook(
//               userId,
//               bookId,
//               startedAt
//             );
//             bookReadId = newBookRead.id;
//           }
//         }
//         if (!bookReadId) {
//           return {
//             errors: { general: "Could not determine or create a book read ID" },
//           };
//         }

//         // 2. Prepare the data for parsing.  Make sure ALL form fields are retrieved.
//         const rawData = {
//           startTime: formData.get("startTime")?.toString(),
//           duration: formData.get("duration")?.toString(),
//           pageStart: formData.get("pageStart")?.toString(),
//           pageEnd: formData.get("pageEnd")?.toString(),
//           finishedBook: formData.get("finishedBook")?.toString(),
//           bookReadId, // Use the determined bookReadId
//         };
//         console.log(rawData);

//         // 3. Use safeParse.
//         const result = addReadingSessionSchema.safeParse(rawData);

//         // 4. Handle the result of safeParse.
//         if (!result.success) {
//           // Convert Zod errors to a more usable format (key: message).
//           const errors = result.error.message;
//           return data({ errors }); // Return the errors to the form.
//         }

//         // 5. If successful, create the session.
//         await readingSessionService.createReadingSession(result.data);

//         // 6. Redirect.  Use consistent redirect for both new and existing BookReads.
//         return redirect(`/books/${bookId}`);
//       }

//       case "start-reading": {
//         const startedAt = new Date().toISOString();
//         await bookReadService.startReadingBook(userId, bookId, startedAt);
//         return redirect(`/books/${bookId}`);
//       }

//       default:
//         return { errors: { general: "Invalid action intent" } };
//     }
//   } catch (error: any) {
//     // Catch-all for unexpected errors (database errors, etc.)
//     console.error("Unexpected error in book action:", error); // Log the error!
//     return {
//       errors: { general: "An unexpected error occurred.  Please try again." },
//     };
//   }
// }

// function BookDetailHeader({ book }: { book: Book }) {
//   return (
//     <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
//           {book.title}
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400 mt-2">
//           <strong>Authors:</strong>
//           {/* {book.bookAuthor.map((ba) => ba.author.name).join(", ") ||
//             "No author(s) added"} */}
//         </p>
//         <p className="text-gray-600 dark:text-gray-400 mt-1">
//           <strong>Genres:</strong>{" "}
//           {/* {book.bookGenre.map((bg) => bg.genre.name).join(", ") ||
//             "No genres added"} */}
//         </p>
//       </div>
//       <div className="mt-4 md:mt-0">
//         <Link
//           to={`/books/${book.id}/edit`}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out mr-2"
//         >
//           Edit Book
//         </Link>
//       </div>
//     </div>
//   );
// }

// function BookReadPanel({
//   bookRead,
//   readingSessions,
//   nextPageStart,
//   onOpenAddSessionModal,
// }: {
//   bookRead: BookRead;
//   readingSessions: ReadingSession[];
//   nextPageStart: number;
//   onOpenAddSessionModal: (bookReadId: number) => void;
// }) {
//   const totalPagesRead = readingSessions.reduce((maxPageEnd, session) => {
//     return session.pageEnd ? Math.max(maxPageEnd, session.pageEnd) : maxPageEnd;
//   }, 0);

//   const totalDuration = readingSessions.reduce(
//     (acc, session) => acc + session.duration,
//     0
//   );

//   const startedAtDate = new Date(bookRead.startedAt);
//   const finishedAtDate = bookRead.finishedAt
//     ? new Date(bookRead.finishedAt)
//     : null;

//   return (
//     <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 mb-4">
//       <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
//         Reading Session (Started: {startedAtDate.toLocaleDateString()}
//         {finishedAtDate
//           ? `, Finished: ${finishedAtDate.toLocaleDateString()}`
//           : ""}
//         {bookRead.abandoned ? ", Abandoned" : ""})
//       </h3>
//       <p>Total Pages Read: {totalPagesRead}</p>
//       <p>Total Reading Time: {formatDuration(totalDuration)}</p>
//       <button
//         onClick={() => onOpenAddSessionModal(bookRead.id)}
//         className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out mt-2"
//       >
//         Add Reading Session
//       </button>

//       {/* Display existing reading sessions */}
//       {readingSessions.length > 0 ? (
//         <ul className="space-y-2 mt-4">
//           {readingSessions.map((session) => (
//             <li
//               key={session.id}
//               className="bg-gray-200 dark:bg-gray-600 rounded-md p-2"
//             >
//               <Link
//                 to={`/reading-sessions/${session.id}/edit`}
//                 className="text-blue-600 hover:underline"
//               >
//                 <p>
//                   Date: {new Date(session.startTime).toLocaleDateString()},
//                   Pages: {session.pageStart}-{session.pageEnd}, Read Time:{" "}
//                   {formatDuration(session.duration)}
//                 </p>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="text-gray-600 dark:text-gray-400 mt-2">
//           No reading sessions recorded yet.
//         </p>
//       )}
//     </div>
//   );
// }

// function BookDetailProgress({
//   totalPagesRead,
//   book,
//   totalDuration,
// }: {
//   totalPagesRead: number;
//   book: Book;
//   totalDuration: number;
// }) {
//   const percentageRead = book.pageCount
//     ? (totalPagesRead / book.pageCount) * 100
//     : 0;

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
//         Reading Progress
//       </h2>
//       <div className="mb-4">
//         <p className="text-gray-600 dark:text-gray-300">
//           Pages Read: {totalPagesRead} / {book.pageCount}
//         </p>
//         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
//           <div
//             className="bg-blue-600 h-2.5 rounded-full"
//             style={{ width: `${percentageRead.toFixed(1)}%` }}
//           ></div>
//         </div>
//         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//           {percentageRead.toFixed(1)}% complete
//         </p>
//       </div>
//       <div>
//         <p className="text-gray-600 dark:text-gray-300">
//           Total Read Time: {formatDuration(totalDuration)}
//         </p>
//       </div>
//     </div>
//   );
// }

// function BookDetailReadingSessions({
//   readingSessions,
//   onOpenAddSessionModal,
//   bookId,
// }: {
//   readingSessions: ReadingSession[];
//   onOpenAddSessionModal: () => void;
//   bookId: number;
// }) {
//   const sortedSessions = [...readingSessions].sort((a, b) => {
//     // First, compare pageEnd (higher pageEnd is more recent)
//     if (b.pageEnd !== null && a.pageEnd !== null && b.pageEnd !== a.pageEnd) {
//       return b.pageEnd - a.pageEnd;
//     }

//     // If pageEnd is the same, compare startTime (more recent date is later)
//     return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
//   });

//   const mostRecentSession =
//     sortedSessions.length > 0 ? sortedSessions[0] : null;

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
//         <Link to={`/books/${bookId}/reading-sessions`}>Reading Sessions</Link>
//       </h2>
//       {mostRecentSession ? (
//         <ul className="space-y-2">
//           <li
//             key={mostRecentSession.id}
//             className="bg-gray-100 dark:bg-gray-700 rounded-md p-3"
//           >
//             <Link
//               to={`/reading-sessions/${mostRecentSession.id}/edit`}
//               className="text-blue-600 hover:underline"
//             >
//               <p>
//                 Date:{" "}
//                 {new Date(mostRecentSession.startTime).toLocaleDateString()},
//                 Pages: {mostRecentSession.pageStart}-{mostRecentSession.pageEnd}
//                 , Read Time: {formatDuration(mostRecentSession.duration)}
//               </p>
//             </Link>
//           </li>
//         </ul>
//       ) : (
//         <p className="text-gray-600 dark:text-gray-400">
//           No reading sessions recorded yet.
//         </p>
//       )}

//       <button
//         onClick={onOpenAddSessionModal}
//         className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out mt-4"
//       >
//         Add Reading Session
//       </button>
//     </div>
//   );
// }

// export default function BookDetailPage({
//   loaderData,
//   actionData,
//   params,
// }: Route.ComponentProps) {
//   const { book, bookReadsData } = loaderData;
//   const [showAddSessionModal, setShowAddSessionModal] = useState(false);
//   const [currentBookReadId, setCurrentBookReadId] = useState<number | null>(
//     null
//   );
//   const navigation = useNavigation();

//   const handleOpenAddSessionModal = (bookReadId: number) => {
//     setCurrentBookReadId(bookReadId);
//     setShowAddSessionModal(true);
//   };

//   const handleCloseAddSessionModal = () => {
//     setCurrentBookReadId(null);
//     setShowAddSessionModal(false);
//   };

//   useEffect(() => {
//     // Check if the form was submitted successfully and there are no errors
//     if (navigation.state === "idle" && !actionData?.errors) {
//       setShowAddSessionModal(false);
//     }
//   }, [navigation.state, actionData]);

//   const getNextPageStartForBookRead = (bookReadId: number): number => {
//     const bookReadData = bookReadsData.find(
//       (data) => data.bookRead.id === bookReadId
//     );
//     return bookReadData ? bookReadData.nextPageStart : 1;
//   };

//   return (
//     <div className="p-4 md:p-8">
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//         <BookDetailHeader book={book} />

//         <Form method="post">
//           <input type="hidden" name="intent" value="start-reading" />
//           <button
//             type="submit"
//             className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out mb-4"
//           >
//             Start Reading
//           </button>
//         </Form>

//         {bookReadsData.length > 0 ? (
//           bookReadsData.map(({ bookRead, readingSessions, nextPageStart }) => (
//             <BookReadPanel
//               key={bookRead.id}
//               bookRead={bookRead}
//               readingSessions={readingSessions}
//               nextPageStart={nextPageStart}
//               onOpenAddSessionModal={handleOpenAddSessionModal}
//             />
//           ))
//         ) : (
//           <p className="text-gray-600 dark:text-gray-400">
//             You haven't started reading this book yet.
//           </p>
//         )}

//         <div className="mt-8">
//           <Link to={`/books`} className="text-blue-600 hover:underline">
//             Back to all books
//           </Link>
//         </div>
//       </div>

//       {showAddSessionModal && currentBookReadId !== null && (
//         <ReadingSessionModal
//           onClose={handleCloseAddSessionModal}
//           actionData={actionData}
//           nextPageStart={getNextPageStartForBookRead(currentBookReadId)}
//           bookReadId={currentBookReadId}
//           action={`/books/${book.id}?index`}
//         />
//       )}
//     </div>
//   );
// }
//
// "use client"

import { useState } from "react";
import {
  BookOpen,
  Star,
  Calendar,
  Clock,
  Edit,
  Trash2,
  ArrowLeft,
  BookMarked,
  Share2,
  Plus,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Route } from "./+types/books.$id";
import { Link, redirect } from "react-router";

// Mock book data
const book = {
  id: 1,
  title: "The Midnight Library",
  author: "Matt Haig",
  cover: "/placeholder.svg?height=400&width=260",
  description:
    "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets?",
  genre: "Fiction, Fantasy, Contemporary",
  publishedDate: "August 13, 2020",
  pages: 304,
  progress: 85,
  rating: 4.5,
  status: "reading",
  startedDate: "February 15, 2025",
  lastReadDate: "March 7, 2025",
  timeSpent: "8h 45m",
  notes: [
    {
      id: 1,
      date: "February 18, 2025",
      page: 42,
      content:
        "The concept of the library as a place between life and death is fascinating. It reminds me of the concept of limbo.",
    },
    {
      id: 2,
      date: "February 25, 2025",
      page: 128,
      content:
        "Nora's journey through different lives is a powerful metaphor for the choices we make and their consequences.",
    },
  ],
};

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const bookId = params.id;
  // const book = await fetchBookById(bookId);
  return { book };
}

export default function BookDetailPage({ loaderData }: Route.ComponentProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [note, setNote] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const book = loaderData.book;

  const handleAddNote = () => {
    // In a real app, this would add the note to the database
    alert("Note added!");
    setNote("");
    setCurrentPage("");
  };

  const handleDelete = () => {
    // In a real app, this would delete the book from the database
    setShowDeleteDialog(false);
    redirect("/library");
  };

  return (
    <div className="relative z-10">
      <div className="container mx-auto px-4 py-8 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-lg shadow-xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to="/library">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Library
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="sticky top-8">
              <div className="relative mx-auto aspect-[2/3] max-w-[260px] overflow-hidden rounded-lg shadow-md">
                <img
                  src={book.cover || "/placeholder.svg"}
                  alt={`Cover of ${book.title}`}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-center gap-2">
                  <Button variant="outline" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <Button className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Update Progress
                </Button>

                <Button variant="secondary" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{book.title}</h1>
                  <p className="text-xl text-muted-foreground">{book.author}</p>
                </div>
                <Badge
                  className={`
                  ${
                    book.status === "reading"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : ""
                  }
                  ${
                    book.status === "completed"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : ""
                  }
                  ${
                    book.status === "to-read"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : ""
                  }
                `}
                >
                  {book.status === "reading" ? "Currently Reading" : ""}
                  {book.status === "completed" ? "Completed" : ""}
                  {book.status === "to-read" ? "To Read" : ""}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {book.genre.split(", ").map((genre, index) => (
                  <Badge key={index} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {book.progress}% complete (
                    {Math.round((book.pages * book.progress) / 100)} of{" "}
                    {book.pages} pages)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= book.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : star <= Math.ceil(book.rating) && star > book.rating
                          ? "fill-yellow-400/50 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium">
                    {book.rating}
                  </span>
                </div>
              </div>
              <Progress value={book.progress} className="h-2" />
            </div>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="stats">Reading Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Description</h3>
                    <p className="text-muted-foreground">{book.description}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Publication Date
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{book.publishedDate}</span>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Pages</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4 text-primary" />
                        <span>{book.pages}</span>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Started Reading
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{book.startedDate}</span>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Last Read</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{book.lastReadDate}</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-4 text-lg font-medium">Add a Note</h3>
                    <div className="mb-4">
                      <Label htmlFor="current-page">Current Page</Label>
                      <Input
                        id="current-page"
                        type="number"
                        placeholder="Page number"
                        className="mt-1"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="note">Your Note</Label>
                      <Textarea
                        id="note"
                        placeholder="Write your thoughts, quotes, or reflections..."
                        className="mt-1 min-h-[100px]"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddNote}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-medium">Your Notes</h3>
                    {book.notes.length > 0 ? (
                      <div className="space-y-4">
                        {book.notes.map((note) => (
                          <Card key={note.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">
                                  {note.date}
                                </CardTitle>
                                <Badge variant="outline">
                                  Page {note.page}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                {note.content}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">
                          No notes yet
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Add your first note to start tracking your thoughts
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-6">
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Time Spent Reading
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-2xl font-bold">
                            {book.timeSpent}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Reading Sessions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-2xl font-bold">12</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Average Pages per Session
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-2xl font-bold">21</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Reading Speed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <BookMarked className="h-4 w-4 text-primary" />
                          <span className="text-2xl font-bold">32 pg/hr</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Reading Activity</CardTitle>
                      <CardDescription>
                        Your reading sessions over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] w-full rounded-lg bg-muted p-4 text-center flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Reading activity chart would appear here
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove from Library</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove &quot;{book.title}&quot; from
                your library? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
