// components/ReadingSessionsList.tsx
import type { ReadingSession } from '@prisma/client';
import React from 'react';
// import type { ReadingSession } from './ReadingSessionModal'; // Import ReadingSession

interface ReadingSessionsListProps {
    readingSessions: ReadingSession[];
}

const ReadingSessionsList: React.FC<ReadingSessionsListProps> = ({ readingSessions }) => {
    if (readingSessions.length === 0) {
        return <p>No reading sessions recorded yet.</p>;
    }

    return (
        <div>
            {readingSessions.map((session, index) => {
                 const hours = Math.floor((session.duration || 0) / 60);
                 const minutes = (session.duration || 0) % 60

                 return (
                <div key={index} className="border-b border-gray-200 py-2">
                    <p className="text-sm text-gray-600">{new Date(session.startTime).toLocaleDateString()}</p>
                      <div className = "flex justify-between">
                       <p>Pages Read: {session.pageStart} - {session.pageEnd}</p>
                       <p>Read Time: {hours}h {minutes}m</p>
                      </div>

                </div>
            )})}
        </div>
    );
};

export default ReadingSessionsList;