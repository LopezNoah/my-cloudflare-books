// GenreManager.tsx
import React, { useState, useEffect } from 'react';

interface Genre {
  id: number;
  name: string;
}

interface Props {
  initialGenres: Genre[];
}

export const GenreForm: React.FC<Props> = ({ initialGenres }) => {
  const [genres, setGenres] = useState<Genre[]>(initialGenres);
  const [loading, setLoading] = useState(false);  // Track loading state

  // Function to refetch genres (used after adding or deleting)
  const refetchGenres = async () => {
     setLoading(true); //start the loading
    try{
        const response = await fetch('/api/genres');
        if (!response.ok) {
            throw new Error(`Failed to fetch genres: ${response.status}`);
        }
        const data: Genre[] = await response.json();
        setGenres(data);
    } catch (error) {
      console.error("Error refetching genres:", error);
      alert('Failed to refresh genres. See console for details.');
    } finally {
        setLoading(false);
    }
  };


  async function handleAddGenre(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;

     setLoading(true);
    try {
        const response = await fetch('/api/genres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to add genre: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        await refetchGenres(); // Refetch after successful addition

    } catch(error) {
        console.error('Error adding genre:', error);
        alert(`Failed to add genre.  See console for details.`);
    } finally {
        setLoading(false);
    }

  }

  async function deleteGenre(id: number) {
    if (confirm("Are you sure you want to delete this genre?")) {
        setLoading(true);
        try {
            const response = await fetch(`/api/genres/${id}`, { method: 'DELETE' });
            if(!response.ok) {
                throw new Error(`Failed to delete: ${response.status}`);
            }
            await refetchGenres();
        } catch(error) {
            console.error("Error deleting genre:", error);
            alert('Failed to delete genre.  See console for details.');
        } finally {
            setLoading(false);
        }
    }
  }

  if (loading) {
    return <div>Loading...</div>; // Basic loading indicator.  Could be a spinner.
  }

  return (
    <>
      <form onSubmit={handleAddGenre} className="mb-4 space-y-2">
        <div>
          <label htmlFor="genreName" className="block text-sm font-medium text-gray-700">New Genre Name</label>
          <input type="text" id="genreName" name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Add Genre
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">Existing Genres</h2>
      <ul className="list-disc list-inside">
        {genres.map(genre => (
          <li key={genre.id} className="flex items-center justify-between">
            {genre.name}
            <button onClick={() => deleteGenre(genre.id)} className="text-red-600 hover:text-red-900 ml-2">Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
};