// CollectionGrid.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
// import { PlusCircledIcon } from "@radix-ui/react-icons";

interface Collection {
    id: string;
    name: string;
}

interface CollectionGridProps {
    collections: Collection[];
}
const CollectionGrid: React.FC<CollectionGridProps> = ({ collections }) => {
    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Placeholder for "Add Collection" */}
            <div className="border border-dashed border-gray-400 rounded-lg p-4 flex items-center justify-center text-gray-500">
                +
            </div>

            {collections.map((collection) => (
                <div key={collection.id} className="border border-gray-300 rounded-lg p-4">
                    <div className="aspect-w-3 aspect-h-4 bg-gray-200 rounded-lg mb-2"></div>
                    <p className="text-center">{collection.name}</p>
                    <p className="text-center text-gray-500">
                        {/* You'll need to get the actual count of books in the collection */}
                        0 books
                    </p>
                </div>
            ))}
        </div>
    );
};
export default CollectionGrid;