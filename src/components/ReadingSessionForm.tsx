import React, { useState, useEffect } from 'react';

interface ReadingSession {
  id?: number;
  bookId: number;
  startTime: string; // ISO string for Date
  duration: number;
  pageStart?: number;
  pageEnd?: number;
  finishedBook?: boolean;
}

interface ReadingSessionFormProps {
  initialSession?: ReadingSession;
  onSubmit: (session: ReadingSession) => void;
  books: { id: number, title: string }[];
}

const ReadingSessionForm: React.FC<ReadingSessionFormProps> = ({ initialSession, onSubmit, books }) => {
  const [sessionData, setSessionData] = useState<ReadingSession>(
    initialSession || { bookId: books[0]?.id || 0, startTime: new Date().toISOString(), duration: 30 } // Default values
  );

  useEffect(() => {
    if (initialSession) {
      setSessionData(initialSession);
    }
  }, [initialSession]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === 'startTime') {
      setSessionData({ ...sessionData, startTime: value });
    } else if (name === 'duration' || name === 'pageStart' || name === 'pageEnd') {
      setSessionData({ ...sessionData, [name]: value === '' ? undefined : parseInt(value, 10) });
    } else if (name === 'finishedBook') {
      setSessionData({ ...sessionData, finishedBook: checked });
    } else {
      setSessionData({ ...sessionData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(sessionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="bookId" className="block text-sm font-medium text-gray-700">Book</label>
        <select
          id="bookId"
          name="bookId"
          value={sessionData.bookId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          {books.map(book => (
            <option key={book.id} value={book.id}>{book.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
        <input type="datetime-local" id="startTime" name="startTime" value={sessionData.startTime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
        <input type="number" id="duration" name="duration" value={sessionData.duration} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="pageStart" className="block text-sm font-medium text-gray-700">Page Start (Optional)</label>
        <input type="number" id="pageStart" name="pageStart" value={sessionData.pageStart || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="pageEnd" className="block text-sm font-medium text-gray-700">Page End (Optional)</label>
        <input type="number" id="pageEnd" name="pageEnd" value={sessionData.pageEnd || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="finishedBook" className="inline-flex items-center">
          <input type="checkbox" id="finishedBook" name="finishedBook" checked={sessionData.finishedBook || false} onChange={handleChange} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
          <span className="ml-2 text-sm text-gray-700">Finished Book</span>
        </label>
      </div>
      <div>
        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          {initialSession ? 'Update Session' : 'Add Session'}
        </button>
      </div>
    </form>
  );
};

export default ReadingSessionForm;