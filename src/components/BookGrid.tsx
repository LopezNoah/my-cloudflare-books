// BookGrid.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import type { Book } from '@/schemas/books';
// import { PlusCircledIcon, Link2Icon } from "@radix-ui/react-icons"; // Import Link2Icon
// import type { Book } from './BookListPage'; // Import the Book type
// No longer need ReadingSessionModal
// import ReadingSessionModal from './ReadingSessionModal'; // Import ReadingSession

interface BookGridProps {
    books: Book[];
    // openReadingSessionModal: (book: Book) => void; // No longer needed
}

const BookGrid: React.FC<BookGridProps> = ({ books }) => {
    return (
        <div className="grid grid-cols-3 gap-4">
            {books.map((book) => (
                <div key={book.id} className="border border-gray-300 rounded-lg p-4">
                    <a href={`/books/${book.id}`}> {/* Wrap with an anchor tag */}
                        <div className="aspect-w-3 aspect-h-4 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                            {/* Link icon instead of plus icon */}
                            +
                        </div>

                        <p className="text-center">{book.title}</p>
                        <p className="text-center text-gray-500">{book.authors.map(a => a.author.name).join(', ')}</p>
                    </a> {/* Close the anchor tag */}
                </div>
            ))}
        </div>
    );
};

export default BookGrid;