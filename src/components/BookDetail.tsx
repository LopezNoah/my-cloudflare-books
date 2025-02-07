// components/BookDetail.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import ReadingSessionModal from './ReadingSessionModal'; // Import the modal
import ReadingSessionsList from './ReadingList'; // Import the list component
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
//   import { CaretSortIcon, PlusCircledIcon } from "@radix-ui/react-icons"
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
  } from "@/components/ui/command"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch"
import type { ReadingSession } from '@prisma/client';
import type { Book } from '@/schemas/books';

// import type { Book } from './BookListPage';  // Import your Book type
// import type { ReadingSession } from './ReadingSessionModal'; //Import ReadingSession

interface BookDetailProps {
    book: Book;
    readingSessions: ReadingSession[];
}

const BookDetail: React.FC<BookDetailProps> = ({ book, readingSessions }) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
     const [isBookOptionsOpen, setIsBookOptionsOpen] = React.useState(false);
     const [borrowed, setBorrowed] = React.useState(false)
     const [lent, setLent] = React.useState(false)


    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Calculate progress (example - you'll need to adjust based on your data)
    const totalPages = book.pageCount || 1; // Default to 1 to avoid division by zero
    const pagesRead = readingSessions.reduce((sum, session) => {
    const start = session.pageStart || 0; //Default to zero
    const end = session.pageEnd || 0; //Default to zero

    //Basic error checking
    if (start > end) {
        return sum
    }
    return sum + (end - start);
     }, 0);
    const progressPercentage = totalPages > 0 ? (pagesRead / totalPages) * 100 : 0;
      // Calculate total reading time in milliseconds
    const totalReadTimeMs = readingSessions.reduce((sum, session) => {
    const duration = session.duration || 0
    return sum + duration;
     }, 0);

     //Convert to hours minutes seconds.
     const hours = Math.floor(totalReadTimeMs / 60);
     const minutes = totalReadTimeMs % 60
     const seconds = 0 //Not specified so default is 0

    return (
        <div className="p-5">
            <div className="flex items-center justify-between mb-5">
                <Button variant = "ghost" size = "icon">
                 Back
                </Button>

                <h1 className="text-2xl font-bold">Library</h1>
                 <Popover open={isBookOptionsOpen} onOpenChange={setIsBookOptionsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                         {/* Book options button (Placeholder Icon 3) */} Settings
                        </Button>
                    </PopoverTrigger>
                     <PopoverContent className="w-[250px] p-0">
                        <div className = "p-2">
                            <p className="text-lg font-bold text-center">Book Options</p>
                        </div>

                        <div className = "flex flex-row justify-center gap-4 p-5">
                                <div className = "grid w-full max-w-sm items-center gap-1.5">
                                    <Label>Book not borrowed</Label>
                                    <Switch
                                        checked={borrowed}
                                        onCheckedChange={setBorrowed}
                                        aria-label = "Toggle borrowed"
                                        />

                                </div>

                                <div className = "grid w-full max-w-sm items-center gap-1.5">
                                       <Label>Book not lent</Label>
                                        <Switch
                                            checked={lent}
                                            onCheckedChange={setLent}
                                            aria-label = "Toggle lent"
                                        />
                                </div>
                         </div>
                         <div className = "flex flex-row justify-center gap-4 p-5">

                                  <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Generate Summary</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                        <DialogTitle>Generate Summary</DialogTitle>
                                        <DialogDescription>
                                            Generate a PDF summary of all the data you added for this book.
                                        </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                        <Button type="submit">Generate</Button> {/* Placeholder */}
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                          <Button variant="outline">See Infographic</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                        <DialogTitle>See Infographic</DialogTitle>
                                        <DialogDescription>
                                             This infographic will show awesome stats about your reading habits
                                        </DialogDescription>
                                        </DialogHeader>

                                    </DialogContent>
                                    </Dialog>
                         </div>

                         <div className = "p-4">
                           <Button variant = "destructive" className = "w-full">Delete Book</Button>
                         </div>
                    </PopoverContent>
                 </Popover>
            </div>

            <div className="flex gap-4 mb-8">
                <div className="w-1/3">
                      {/* Placeholder for book cover */}
                    <div className="aspect-w-2 aspect-h-3 bg-gray-200 rounded-lg" />
                </div>
                <div className="w-2/3">
                    <h2 className="text-xl font-bold">{book.title}</h2>
                     <p className="text-gray-600">
                        {book.authors.map(a => a.author.name).join(', ')}
                    </p>
                    {/* Display genres */}
                   <div className = "flex gap-2 mt-2">
                     {book.genres.map((genre) => (
                        <Badge key={genre.genre.id} variant="secondary">
                        {genre.genre.name}
                        </Badge>
                    ))}
                   </div>
                    <div className = "flex gap-2 mt-4">
                     <Button onClick={openModal} className="mr-2">Continue Reading</Button>
                    <Button variant="outline" size="icon" onClick={openModal}>
                        {/* <PlusCircledIcon className="h-4 w-4" /> */} +
                    </Button>
                     <Button variant="outline" size="icon"> {/* Placeholder Icon 2 */} </Button>

                    </div>

                </div>
            </div>
            <div className = "flex justify-start gap-10">
                 <div className = "flex flex-col items-center">
                 <p className="text-sm text-gray-600">
                 Pages Read
                   </p>
                  <p className="font-bold">{pagesRead} / {book.pageCount}</p>
                  <p className="text-sm text-gray-600">{progressPercentage.toFixed(1)}%</p>

            </div>
            <div className = "flex flex-col items-center">
            <p className = "text-sm text-gray-600">Read Time</p>
             <p className = "font-bold">{hours}h {minutes}m </p>
            </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Reading Sessions ({readingSessions.length})</h3>
             <ReadingSessionsList readingSessions={readingSessions} />


             <h3 className="text-lg font-semibold mt-8 mb-4">Ratings (0)</h3>
            <p>No extra ratings added yet. Add extra information, notes, or reviews.</p>



             <ReadingSessionModal book={book} isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default BookDetail;