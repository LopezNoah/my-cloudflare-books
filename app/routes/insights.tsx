"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Calendar,
  BookMarked,
  PieChart,
  LineChart,
  BookText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for reading insights
const readingData = {
  overview: {
    totalBooks: 42,
    totalPages: 12568,
    totalTime: "245h 30m",
    avgRating: 4.2,
  },
  genres: [
    { name: "Fiction", count: 18, percentage: 43 },
    { name: "Non-Fiction", count: 12, percentage: 29 },
    { name: "Fantasy", count: 6, percentage: 14 },
    { name: "Sci-Fi", count: 4, percentage: 10 },
    { name: "Other", count: 2, percentage: 4 },
  ],
  readingTimes: [
    { time: "Morning", percentage: 15 },
    { time: "Afternoon", percentage: 25 },
    { time: "Evening", percentage: 40 },
    { time: "Night", percentage: 20 },
  ],
  readingDays: [
    { day: "Monday", pages: 45 },
    { day: "Tuesday", pages: 32 },
    { day: "Wednesday", pages: 28 },
    { day: "Thursday", pages: 50 },
    { day: "Friday", pages: 35 },
    { day: "Saturday", pages: 85 },
    { day: "Sunday", pages: 95 },
  ],
};

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState("all-time");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative z-10">
      <div className="container mx-auto px-4 py-8 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-lg shadow-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reading Insights</h1>
          <p className="text-muted-foreground">
            Discover your unique reading patterns and habits
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Reading Analytics</h2>
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookMarked className="mr-2 h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">
                  {readingData.overview.totalBooks}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pages Read</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">
                  {readingData.overview.totalPages}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">
                  {readingData.overview.totalTime}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span className="text-2xl font-bold">
                  {readingData.overview.avgRating}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reading-patterns" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reading-patterns">Reading Patterns</TabsTrigger>
            <TabsTrigger value="genres">Genres</TabsTrigger>
            <TabsTrigger value="reading-speed">Reading Speed</TabsTrigger>
          </TabsList>

          <TabsContent value="reading-patterns" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Reading Times</span>
                  </CardTitle>
                  <CardDescription>When you prefer to read</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full rounded-lg bg-muted p-4">
                    <div className="flex h-full flex-col justify-end gap-2">
                      {readingData.readingTimes.map((item) => (
                        <div
                          key={item.time}
                          className="flex items-center gap-2"
                        >
                          <div className="w-20 text-sm">{item.time}</div>
                          <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-primary/20">
                            <div
                              className="absolute left-0 top-0 h-full bg-primary"
                              style={{ width: `${item.percentage}%` }}
                            />
                            <div className="absolute left-2 top-0 flex h-full items-center text-xs font-medium">
                              {item.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Reading Days</span>
                  </CardTitle>
                  <CardDescription>Pages read by day of week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full rounded-lg bg-muted p-4">
                    <div className="flex h-full items-end justify-between gap-2">
                      {readingData.readingDays.map((item) => (
                        <div
                          key={item.day}
                          className="flex flex-1 flex-col items-center gap-2"
                        >
                          <div
                            className="w-full rounded-t-md bg-primary"
                            style={{
                              height: `${
                                (item.pages /
                                  Math.max(
                                    ...readingData.readingDays.map(
                                      (d) => d.pages
                                    )
                                  )) *
                                220
                              }px`,
                            }}
                          />
                          <div className="text-xs">
                            {item.day.substring(0, 3)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="genres" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    <span>Genre Distribution</span>
                  </CardTitle>
                  <CardDescription>Books read by genre</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full rounded-lg bg-muted p-4">
                    <div className="flex h-full items-center justify-center">
                      <div className="relative h-[200px] w-[200px] rounded-full border-8 border-background">
                        {readingData.genres.map((genre, index) => {
                          const rotation =
                            index > 0
                              ? readingData.genres
                                  .slice(0, index)
                                  .reduce((acc, g) => acc + g.percentage, 0)
                              : 0;

                          return (
                            <div
                              key={genre.name}
                              className="absolute left-0 top-0 h-full w-full"
                              style={{
                                clipPath: `conic-gradient(from ${rotation}deg, transparent ${genre.percentage}%, transparent 0)`,
                                backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                                transform: "rotate(0deg)",
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookText className="h-5 w-5 text-primary" />
                    <span>Genre Breakdown</span>
                  </CardTitle>
                  <CardDescription>Number of books by genre</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {readingData.genres.map((genre, index) => (
                      <div key={genre.name}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>{genre.name}</span>
                          <span className="font-medium">
                            {genre.count} books
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${genre.percentage}%`,
                              backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reading-speed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  <span>Reading Speed Over Time</span>
                </CardTitle>
                <CardDescription>
                  Pages per hour over your reading journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full rounded-lg bg-muted p-4">
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      Reading speed chart would appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
