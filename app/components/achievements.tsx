import {
  Award,
  BookHeart,
  BookOpen,
  Sparkles,
  Zap,
  Coffee,
  Moon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data for achievements
const achievements = [
  {
    id: 1,
    title: "Bookworm Beginner",
    description: "Read your first 5 books",
    icon: <BookOpen className="h-8 w-8 text-emerald-500" />,
    progress: 100,
    unlocked: true,
    date: "Jan 15, 2025",
  },
  {
    id: 2,
    title: "Genre Explorer",
    description: "Read books from 3 different genres",
    icon: <BookHeart className="h-8 w-8 text-pink-500" />,
    progress: 100,
    unlocked: true,
    date: "Feb 2, 2025",
  },
  {
    id: 3,
    title: "Night Owl",
    description: "Read after midnight for 7 days",
    icon: <Moon className="h-8 w-8 text-indigo-500" />,
    progress: 100,
    unlocked: true,
    date: "Feb 18, 2025",
  },
  {
    id: 4,
    title: "Speed Reader",
    description: "Finish a book in less than 24 hours",
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    progress: 100,
    unlocked: true,
    date: "Mar 5, 2025",
  },
  {
    id: 5,
    title: "Dedicated Reader",
    description: "Maintain a 30-day reading streak",
    icon: <Sparkles className="h-8 w-8 text-purple-500" />,
    progress: 42,
    unlocked: false,
    date: null,
  },
  {
    id: 6,
    title: "Caffeine & Pages",
    description: "Log reading sessions at 5 different cafés",
    icon: <Coffee className="h-8 w-8 text-amber-600" />,
    progress: 60,
    unlocked: false,
    date: null,
  },
];

export default function Achievements() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <Card
          key={achievement.id}
          className={`transition-all hover:shadow-md ${
            achievement.unlocked
              ? "bg-gradient-to-br from-amber-50/50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20"
              : "bg-gray-50 dark:bg-gray-900/50"
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="rounded-full bg-white p-2 shadow-sm dark:bg-gray-800">
                {achievement.icon}
              </div>
              {achievement.unlocked && (
                <Award className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <CardTitle className="mt-2 text-lg">{achievement.title}</CardTitle>
            <CardDescription>{achievement.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
              <span className="ml-2 text-xs font-medium">
                {achievement.progress}%
              </span>
            </div>
            {achievement.unlocked && (
              <p className="mt-2 text-xs text-muted-foreground">
                Unlocked on {achievement.date}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
