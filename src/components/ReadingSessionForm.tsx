import React, { useState } from 'react';
import type { ReadingSession } from '@prisma/client';

interface ReadingSessionFormProps {
  bookId: number;
  // onSessionAdded: () => void;
}

const ReadingSessionForm: React.FC<ReadingSessionFormProps> = ({ bookId }) => {
  const [sessionData, setSessionData] = useState<Partial<ReadingSession>>({
    bookId: bookId,
    startTime: undefined, // Initialize as undefined
    duration: undefined,
    pageStart: undefined,
    pageEnd: undefined,
    finishedBook: undefined, // Initialize as undefined (can be null in DB)
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'pageStart' || name === "pageEnd") {
      const parsedPage = parseInt(value, 10);
      setSessionData({ ...sessionData, [name]: isNaN(parsedPage) ? undefined : parsedPage });
    } else if (name === "duration") {
      const parsedDuration = parseInt(value);
      setSessionData({ ...sessionData, [name]: isNaN(parsedDuration) ? undefined : parsedDuration });
    } else if (name === "startTime") {
        // Convert the input string to a Date object (or undefined if empty).
        setSessionData({...sessionData, [name]: value ? new Date(value) : undefined});
    }
    else {
      setSessionData({ ...sessionData, [name]: value });
    }
  };

  // Separate handler for checkbox (boolean) inputs
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setSessionData({ ...sessionData, [name]: checked });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for sending to the API. Convert Date to ISO string.
    const dataToSend = {
      ...sessionData,
      startTime: sessionData.startTime ? sessionData.startTime.toISOString() : undefined, // Convert to ISO string here.
      pageStart: sessionData.pageStart ?? undefined,   // Use nullish coalescing
      pageEnd: sessionData.pageEnd ?? undefined,       // Use nullish coalescing
      finishedBook: sessionData.finishedBook ?? false, // Use nullish coalescing, default to null.
    };


    const response = await fetch('/api/reading-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      // onSessionAdded();
      window.location.reload();
      // Reset form
      setSessionData({
        bookId: bookId,
        startTime: undefined,
        duration: undefined,
        pageStart: undefined,
        pageEnd: undefined,
        finishedBook: undefined,
      });
    } else {
      alert('Failed to add reading session');
      console.error('Error adding reading session:', await response.json());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
        <input
          type="datetime-local"
          id="startTime"
          name="startTime"
          value={sessionData.startTime ? sessionData.startTime.toISOString().slice(0, 16) : ''} // Format for datetime-local
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
        <input
          type="number"
          id="duration"
          name="duration"
          value={sessionData.duration === undefined ? '' : sessionData.duration}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="pageStart" className="block text-sm font-medium text-gray-700">Starting Page (Optional)</label>
        <input
          type="number"
          id="pageStart"
          name="pageStart"
          value={sessionData.pageStart === undefined || sessionData.pageStart === null ? '' : sessionData.pageStart}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="pageEnd" className="block text-sm font-medium text-gray-700">Ending Page (Optional)</label>
        <input
          type="number"
          id="pageEnd"
          name="pageEnd"
          value={sessionData.pageEnd === undefined || sessionData.pageEnd === null ? '' : sessionData.pageEnd}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="finishedBook" className="block text-sm font-medium text-gray-700">Finished Book?</label>
        <input
          type="checkbox"
          id="finishedBook"
          name="finishedBook"
          checked={!!sessionData.finishedBook}  // Use double negation for boolean conversion
          onChange={handleCheckboxChange}
          className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        Add Reading Session
      </button>
    </form>
  );
};

export default ReadingSessionForm;