// src/routes/reading-sessions/index.tsx
import { Link } from 'react-router';
import type { Route } from './+types/reading-sessions'; //  generated type
import * as schema from "../../database/schema";
// import { generateLoader } from "@react-router/dev/server";
import { asc, desc } from 'drizzle-orm';

export async function loader ({ params, context }: Route.LoaderArgs) {
    const sessions = await context.db.query.readingSessions.findMany({
        with: {
            book: true, // Include book details
        },
        orderBy: [asc(schema.readingSessions.bookId), desc(schema.readingSessions.pageEnd)],
    });
    return { sessions };
};


export default function ReadingSessionsPage({ loaderData }: Route.ComponentProps) {
    const { sessions } = loaderData;

    async function deleteSession(id: number) {
      // Client-side confirmation *before* sending the request
      if (confirm("Are you sure you want to delete this reading session?")) {
        // Send the DELETE request.  We'll handle this with an action later.
        const response = await fetch(`/api/reading-sessions/${id}`, { method: 'DELETE' });

        if (!response.ok) {
           alert("Error deleting reading session!"); // Basic client-side error
        } else {
           window.location.reload(); //Simple reload.
        }

      }
    }


    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Reading Sessions</h1>
        <div className="mb-4">
          <Link to="add" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add New Session</Link>
        </div>
          <div>
              {sessions.length === 0 ? (
                <p>No reading sessions recorded yet.</p>
              ) : (
                 <table>
                    <thead>
                        <tr>
                          <th>Book</th>
                          <th>Start Time</th>
                          <th>Duration (min)</th>
                          <th>Pages</th>
                          <th>Finished</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                    <tbody>
                         {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <Link to={`/books/${session.book?.id}`}>
                          {session.book?.title}
                        </Link>
                      </td>
                      <td>{new Date(session.startTime).toLocaleString()}</td>
                      <td>{session.duration}</td>
                      <td>{session.pageStart}{session.pageEnd ? `-${session.pageEnd}` : ''}</td>
                      <td>{session.finishedBook ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link to={`/reading-sessions/${session.id}/edit`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                        <button onClick={() => deleteSession(session.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                    </tbody>
                 </table>
              )}
          </div>
      </div>
    );
}