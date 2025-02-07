// BookListPage.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
// import { PlusCircledIcon } from "@radix-ui/react-icons";
// No longer need ReadingSessionModal here
// import ReadingSessionModal from './ReadingSessionModal';
import { create } from 'zustand';
import BookGrid from './BookGrid'; // Import the new components
import CollectionGrid from './CollectionGrid';
import type { Book } from '@/schemas/books';




interface Collection {
    id: string;
    name: string;
    // Add other collection properties
}

interface BookListState {
    // books: Book[]; // Removed: books are now props
    collections: Collection[]; // Removed: collections are now props
    selectedBook: Book | null;
    isReadingModalOpen: boolean;
    setSelectedBook: (book: Book | null) => void;
    openReadingSessionModal: (book: Book) => void;
    closeReadingSessionModal: () => void;
    // setBooks: (books: Book[]) => void; // Removed
    // setCollections: (collections: Collection[]) => void; // Removed

}

const useBookListStore = create<BookListState>((set) => ({
    // books: [], // Removed
    collections: [ //Keep collections in Zustand, since that won't change.
        { id: '1', name: 'Reading' },
        { id: '2', name: 'Finished' },
    ],
    selectedBook: null,
    isReadingModalOpen: false,
    setSelectedBook: (book) => set({ selectedBook: book }),
    openReadingSessionModal: (book) => set({ selectedBook: book, isReadingModalOpen: true }),
    closeReadingSessionModal: () => set({ selectedBook: null, isReadingModalOpen: false }),
    // setBooks: (books) => set({ books: books }), // Removed
    // setCollections: (collections) => set({ collections: collections }), // Removed
}));

interface BookListPageProps {
    books: Book[];
}

const BookListPage: React.FC<BookListPageProps> = ({ books }) => {
    const {
        // books, // Removed and now a prop
        collections,
        selectedBook,
        isReadingModalOpen,
        openReadingSessionModal,
        closeReadingSessionModal,
    } = useBookListStore();


    return (
        <div className="p-5">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold">Library</h1>
                <div className="flex space-x-2">
                    {/*Placeholder icons */}
                    <Button variant="ghost" size="icon">+</Button>  {/* Placeholder Icon 1 */}
                    <Button variant="ghost" size="icon"> {/* Placeholder Icon 2 */}</Button>
                    <Button variant="ghost" size="icon">{/* Placeholder Icon 3 */} </Button>
                </div>

            </div>
            <h2 className="font-bold mb-4">Collections</h2>
            {/* Use CollectionGrid */}
            <CollectionGrid collections={collections} />

            <h2 className="font-bold mb-4">All Books</h2>

            {/* Use BookGrid */}
             <BookGrid books={books}  /> {/* No longer need openReadingSessionModal */}

            {/* No longer rendering ReadingSessionModal here */}
            {/* {selectedBook && (
                <ReadingSessionModal
                    bookTitle={selectedBook.title}
                    isOpen={isReadingModalOpen}
                    onClose={closeReadingSessionModal}
                />
            )} */}

        </div>
    );
};

export default BookListPage;