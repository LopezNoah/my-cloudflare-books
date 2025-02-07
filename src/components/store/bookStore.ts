// store.ts (No changes - same as before)
import { create } from 'zustand';

interface BookState {
    bookTitle: string;
    bookAuthor: string;
    numPages: string;
    selectedCollections: string[];
    readInPast: boolean;
    currentlyReading: boolean;
    progressType: 'Pages' | 'Percentage' | 'Audiobook';
    isModalOpen: boolean;
    setBookTitle: (title: string) => void;
    setBookAuthor: (author: string) => void;
    setNumPages: (pages: string) => void;
    setSelectedCollections: (collections: string[]) => void;
    setReadInPast: (read: boolean) => void;
    setCurrentlyReading: (reading: boolean) => void;
    setProgressType: (type: 'Pages' | 'Percentage' | 'Audiobook') => void;
    openModal: () => void;
    closeModal: () => void;
    addBook: () => void;
}

const useBookStore = create<BookState>((set) => ({
    bookTitle: '',
    bookAuthor: '',
    numPages: '',
    selectedCollections: [],
    readInPast: false,
    currentlyReading: false,
    progressType: 'Pages',
    isModalOpen: false,
    setBookTitle: (title) => set({ bookTitle: title }),
    setBookAuthor: (author) => set({ bookAuthor: author }),
    setNumPages: (pages) => set({ numPages: pages }),
    setSelectedCollections: (collections) => set({ selectedCollections: collections }),
    setReadInPast: (read) => set({ readInPast: read }),
    setCurrentlyReading: (reading) => set({ currentlyReading: reading }),
    setProgressType: (type) => set({ progressType: type }),
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
    addBook: () => {
        const { bookTitle, bookAuthor, numPages } = useBookStore.getState();

        if (!bookTitle || !bookAuthor || !numPages) {
            alert("Please fill in all required fields (marked with *)");
            return;
        }
        console.log(useBookStore.getState());
        set({
            bookTitle: '',
            bookAuthor: '',
            numPages: '',
            selectedCollections: [],
            readInPast: false,
            currentlyReading: false,
            progressType: 'Pages',
        });
    }
}));

export default useBookStore;