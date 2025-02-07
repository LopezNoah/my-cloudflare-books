// ReadingSessionModal.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog";
import { create } from 'zustand';
import type { Book } from '@/schemas/books';  // Make sure this path is correct

interface ReadingSession {
    startPage?: number;
    endPage?: number;
    sessionDuration?: number; // Changed to number
    sessionDate: string;
}

interface SessionState {
    session: ReadingSession;
    isSessionModalOpen: boolean;
    setSession: (updates: Partial<ReadingSession>) => void;
    openSessionModal: () => void;
    closeSessionModal: () => void;
    addSession: (bookId: number) => Promise<void>;
    showShareScreen: boolean;
    setShowShareScreen: (show: boolean) => void;
}

const useSessionStore = create<SessionState>((set) => ({
    session: { sessionDate: new Date().toISOString().split('T')[0] },
    isSessionModalOpen: false,
    setSession: (updates) => set((state) => ({ session: { ...state.session, ...updates } })),
    openSessionModal: () => set({ isSessionModalOpen: true }),
    closeSessionModal: () => set({ isSessionModalOpen: false }),
    showShareScreen: false,
    setShowShareScreen: (show) => set({ showShareScreen: show }),
    addSession: async (bookId) => {
        const { session, showShareScreen } = useSessionStore.getState();

        if (!session.startPage && !session.endPage && session.sessionDuration === undefined) {
            alert("Please enter at least start page, end page, or session duration.");
            return;
        }


        // Prepare data for the API call
        const apiData = {
            bookId: bookId,
            startTime: new Date(session.sessionDate).toISOString(), // Convert to ISO 8601 datetime
            duration: session.sessionDuration, //  duration is already number
            pageStart: session.startPage,
            pageEnd: session.endPage,
            finishedBook: false, // Consider adding a checkbox for this
        };
        //Remove undefined values
        //  for (const key in apiData) {
        //     if (apiData[key] === undefined) {
        //         delete apiData[key];
        //     }
        // }


      try {
            const response = await fetch('/api/reading-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Data:", errorData); // Log the full error response
                throw new Error(errorData.errors?.[0]?.message || errorData.error || 'Failed to add reading session');

            }

           // const newSession = await response.json();  //You can use this to store the newly added session.
           // console.log("Session added:", newSession);

        } catch (error:any) {
            console.error("Error adding session:", error);
             alert(error.message);
            return;
        }

        // Reset the form and close the modal *after* the API call is successful
        set({
            session: { sessionDate: new Date().toISOString().split('T')[0] },
            isSessionModalOpen: false,
            showShareScreen: false,
        });
    },
}));

interface Props {
    book: Book;
    isOpen: boolean;
    onClose: () => void;
}

const ReadingSessionModal: React.FC<Props> = ({ book, isOpen, onClose }) => {
    const {
        session,
        setSession,
        closeSessionModal,
        addSession,
        showShareScreen,
        setShowShareScreen,
    } = useSessionStore();

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>ADD READING SESSION</DialogTitle>
                     <p>Book: {book.title}</p>
                    <DialogClose asChild>
                    </DialogClose>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startPage" className="text-right">
                            Start page
                        </Label>
                        <Input
                            id="startPage"
                            type="number"
                            value={session.startPage || ''}
                            onChange={(e) => setSession({ startPage: parseInt(e.target.value, 10) })}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endPage" className="text-right">
                            End page
                        </Label>
                        <Input
                            id="endPage"
                            type="number"
                            value={session.endPage || ''}
                            onChange={(e) => setSession({ endPage: parseInt(e.target.value, 10) })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sessionDuration" className="text-right">
                            Duration (minutes)
                        </Label>
                        <Input
                            id="sessionDuration"
                            type="number"
                            value={session.sessionDuration || ''}
                            onChange={(e) => setSession({ sessionDuration: parseInt(e.target.value, 10) })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sessionDate" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="sessionDate"
                            type="date"
                            value={session.sessionDate}
                            onChange={(e) => setSession({ sessionDate: e.target.value })}
                            className="col-span-3"
                        />
                    </div>

                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox checked={showShareScreen} onCheckedChange={() => setShowShareScreen(!showShareScreen)} id="shareScreen" className="mr-2" />
                    <Label htmlFor="shareScreen">Show share screen on close</Label>
                </div>
                <DialogClose asChild>
                    <Button type="submit" onClick={() => addSession(book.id)} className="w-full mt-4">Add Session</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};
export default ReadingSessionModal;