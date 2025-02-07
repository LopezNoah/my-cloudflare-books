// readingSessionsStore.ts
import { create } from 'zustand';
// import { Book } from './booksStore'; // Import the Book type

interface ReadingSession {
  id: string;
  bookId: string;
  startPage?: number; // Make startPage optional, as you might not always have it.
  endPage?: number;
  sessionDuration?: number;
  sessionDate: string;
  pagesRead?: number;
}

interface ReadingSessionsState {
  readingSessions: ReadingSession[];
  isSessionModalOpen: boolean;
  currentSession: {
    endPage: string;
    sessionDuration: string;
    sessionDate: string;
  };
  setReadingSessions: (sessions: ReadingSession[]) => void;
  openSessionModal: () => void;
  closeSessionModal: () => void;
  setSessionData: (data: Partial<{ endPage: string; sessionDuration: string; sessionDate: string; }>) => void;
  addReadingSession: (bookId: string) => void; // Takes bookId as argument
}

const useReadingSessionsStore = create<ReadingSessionsState>((set, get) => ({
  readingSessions: [],
  isSessionModalOpen: false,
  currentSession: { endPage: '', sessionDuration: '', sessionDate: '' },
  setReadingSessions: (sessions) => set({ readingSessions: sessions }),
  openSessionModal: () => set({ isSessionModalOpen: true }),
  closeSessionModal: () => set({ isSessionModalOpen: false }),
  setSessionData: (data) => set((state) => ({ currentSession: { ...state.currentSession, ...data } })),
   addReadingSession: (bookId) => {

        const { currentSession } = get();
        const endPage = parseInt(currentSession.endPage, 10);


        if (isNaN(endPage)) {
            alert("Please enter a valid end page.");
            return;
        }
        const newSession: ReadingSession = {
            id: Date.now().toString(), // Unique ID
            bookId,
            endPage, // No more subtraction. Store the endPage directly.
            sessionDate: currentSession.sessionDate || new Date().toISOString(),
            sessionDuration: parseInt(currentSession.sessionDuration, 10) || 0,
            pagesRead: endPage //Or any logic to calculate
        };

        set((state) => ({
            readingSessions: [...state.readingSessions, newSession],
            currentSession: { endPage: '', sessionDuration: '', sessionDate: '' },
            isSessionModalOpen: false, // Close modal after adding
        }));
    }
}));

export default useReadingSessionsStore;