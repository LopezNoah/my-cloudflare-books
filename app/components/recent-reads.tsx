// import Image from "next/image"
// import Link from "next/link"
import { BookOpen, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";

// Mock data for recent reads
const recentBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "/placeholder.svg?height=120&width=80",
    progress: 85,
    rating: 4.5,
    type: "Novel",
    lastRead: "2 days ago",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "/placeholder.svg?height=120&width=80",
    progress: 100,
    rating: 5,
    type: "Non-Fiction",
    lastRead: "1 week ago",
  },
  {
    id: 3,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    cover: "/placeholder.svg?height=120&width=80",
    progress: 42,
    rating: 4,
    type: "Finance",
    lastRead: "Yesterday",
  },
];

export default function RecentReads() {
  return (
    <div className="space-y-4">
      {recentBooks.map((book) => (
        <Link key={book.id} to={`/books/${book.id}`}>
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-0">
              <div className="flex">
                <div className="relative h-[120px] w-[80px] flex-shrink-0 overflow-hidden">
                  {/* <Image
                    src={book.cover || "/placeholder.svg"}
                    alt={`Cover of ${book.title}`}
                    fill
                    className="object-cover"
                  /> */}
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{book.title}</h3>
                      <Badge variant="outline" className="ml-2">
                        {book.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {book.author}
                    </p>
                  </div>
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>
                          {book.progress === 100
                            ? "Completed"
                            : `${book.progress}%`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{book.rating}</span>
                      </div>
                    </div>
                    <Progress value={book.progress} className="h-1.5" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Last read {book.lastRead}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
