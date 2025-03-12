"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Calendar, BookMarked } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for reading stats
const readingData = {
  thisWeek: {
    booksRead: 2,
    pagesRead: 347,
    timeSpent: "8h 25m",
    streak: 5,
  },
  thisMonth: {
    booksRead: 6,
    pagesRead: 1248,
    timeSpent: "32h 10m",
    streak: 18,
  },
  thisYear: {
    booksRead: 24,
    pagesRead: 6532,
    timeSpent: "145h 30m",
    streak: 42,
  },
};

export default function ReadingStats() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Tabs defaultValue="thisWeek" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="thisWeek">This Week</TabsTrigger>
        <TabsTrigger value="thisMonth">This Month</TabsTrigger>
        <TabsTrigger value="thisYear">This Year</TabsTrigger>
      </TabsList>
      {Object.entries(readingData).map(([period, data]) => (
        <TabsContent key={period} value={period} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Books Read
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BookMarked className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{data.booksRead}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pages Read
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{data.pagesRead}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Time Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{data.timeSpent}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Reading Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{data.streak} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
