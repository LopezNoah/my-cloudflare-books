// AddBookForm.tsx
import React from 'react';
import CollectionsModal from './CollectionsModal';
import useBookStore from './store/bookStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group"


const AddBookForm: React.FC = () => {
    const {
        bookTitle, bookAuthor, numPages, readInPast, currentlyReading, progressType, isModalOpen,
        setBookTitle, setBookAuthor, setNumPages, setReadInPast, setCurrentlyReading, setProgressType,
        openModal, addBook
    } = useBookStore();

    return (
        <div className="p-5">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold">ADD BOOK</h2>
                <Button variant="ghost" size="icon" onClick={() => { /* Handle close */ }}>
                   X
                </Button>
            </div>

            <Button className="w-full mb-2.5">Search Online</Button>
            <Button className="w-full mb-5">Scan ISBN Code</Button>

            <p className="text-center mb-5">or add manually</p>

            {/* Progress Type Selection */}
           <div className="flex items-center mb-2.5">
                <div className="w-12 h-12 rounded border border-gray-400 flex items-center justify-center mr-5 text-2xl">
                    +
                </div>
                <RadioGroup onValueChange={(value) => setProgressType(value as "Pages" | "Percentage" | "Audiobook")} defaultValue={progressType} className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Pages" id="pages" />
                        <Label htmlFor="pages">Pages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                         <RadioGroupItem value="Percentage" id="percentage" />
                        <Label htmlFor="percentage">Percentage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                         <RadioGroupItem value="Audiobook" id="audiobook" />
                        <Label htmlFor="audiobook">Audiobook</Label>
                    </div>
                </RadioGroup>
            </div>


            <div className="mb-4">
                <Label htmlFor="bookTitle">Book Title*</Label>
                <Input type="text" id="bookTitle" placeholder="Book Title*" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
            </div>
            <div className="mb-4">
                <Label htmlFor="bookAuthor">Book Author*</Label>
                <Input type="text" id="bookAuthor" placeholder="Book Author*" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} />
            </div>
            <div className="mb-4">
                <Label htmlFor="numPages">Number of pages*</Label>
                <Input type="number" id="numPages" placeholder="Number of pages*" value={numPages} onChange={(e) => setNumPages(e.target.value)} />
            </div>


            <Button onClick={openModal} variant="outline" className="w-full mb-2.5">Collections</Button>

            <div className="flex items-center mb-2.5">
                <Checkbox checked={readInPast} onCheckedChange={() => setReadInPast(!readInPast)} id="readInPast" className="mr-2" />
                <Label htmlFor="readInPast">Book I've read in the past</Label>
            </div>
            <div className="flex items-center mb-5">
                <Checkbox checked={currentlyReading} onCheckedChange={() => setCurrentlyReading(!currentlyReading)} id="currentlyReading" className="mr-2" />
                <Label htmlFor="currentlyReading">Book I'm currently reading</Label>
            </div>

            <Button onClick={addBook} className="w-full">Add Book</Button>
            <p className="text-sm text-red-500 self-end mt-1">* Required fields</p>

            {isModalOpen && <CollectionsModal />}
        </div>
    );
};

export default AddBookForm;