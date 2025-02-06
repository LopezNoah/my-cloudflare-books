import React from 'react';
import type { ReadingSession } from '@prisma/client';

interface ReadingSessionListProps {
  sessions: ReadingSession[];
  onDelete: (id: number) => void;
}

const ReadingSessionList: React.FC<ReadingSessionListProps> = ({ sessions, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th> */}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (min)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pages</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finished</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sessions.map((session) => (
            <tr key={session.id}>
              {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.book.title}</td> */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.startTime).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.duration}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.pageStart}{session.pageEnd ? `-${session.pageEnd}` : ''}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.finishedBook ? 'Yes' : 'No'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <a href={`/reading-sessions/edit/${session.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</a>
                <button onClick={() => onDelete(session.id)} className="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReadingSessionList;