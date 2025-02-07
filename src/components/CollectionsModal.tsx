// CollectionsModal.tsx
import React from 'react';
// import useBookStore from './store';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import useBookStore from './store/bookStore';


const availableCollections = [
    "Sci-Fi",
    "Fantasy",
    "Christian",
    "Political",
    "<300 Pages",
];

const CollectionsModal: React.FC = () => {
    const { selectedCollections, setSelectedCollections, closeModal, isModalOpen } = useBookStore();

    const toggleCollection = (collection: string) => {
        let newCollections: string[];
        if (selectedCollections.includes(collection)) {
            newCollections = selectedCollections.filter(c => c !== collection);
        } else {
            newCollections = [...selectedCollections, collection];
        }
        setSelectedCollections(newCollections);
    };

    if (!isModalOpen) return null;

    return (
         <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                      <DialogTitle>COLLECTIONS SELECT</DialogTitle>
                       <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                                X
                            </Button>
                        </DialogClose>
                </DialogHeader>
               
                <div className="grid gap-4 py-4">
                {availableCollections.map(collection => (
                    <div key={collection} className="flex items-center space-x-2">
                        <Checkbox
                            checked={selectedCollections.includes(collection)}
                            onCheckedChange={() => toggleCollection(collection)}
                            id={collection}

                        />
                         <Label htmlFor={collection}>{collection}</Label>
                    </div>
                ))}
                </div>
                <DialogClose asChild>
                    <Button type="submit" className = "w-full">Save</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default CollectionsModal;