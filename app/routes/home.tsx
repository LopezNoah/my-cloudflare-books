import * as schema from "~/database/schema";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Library App" },
    { name: "description", content: "Welcome to the Library!" },
  ];
}

export async function action({ request, context }: Route.ActionArgs) {}

// export async function loader({ context }: Route.LoaderArgs) {
//   return { message: "Hello World!" };
// }

// export default function Home({ actionData, loaderData }: Route.ComponentProps) {
//   return <div>{loaderData.message}</div>;
// }

// import Link from "next/link"
import { BookOpen, BookPlus, Award, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router";
import RecentReads from "@/components/recent-reads";
import ReadingStats from "@/components/reading-stats";
import Achievements from "@/components/achievements";

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Personal Reading Realm
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your cozy corner of the universe for tracking literary adventures
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span>My Library</span>
            </CardTitle>
            <CardDescription>Browse your collection</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-2xl font-bold">42</p>
            <p className="text-sm text-muted-foreground">
              Books in your collection
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/library">View Library</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Add New</span>
            </CardTitle>
            <CardDescription>Log your latest adventure</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">
              Track books, articles, or anything you read
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/add">Add Reading</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <span>Achievements</span>
            </CardTitle>
            <CardDescription>Your reading milestones</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-2xl font-bold">7</p>
            <p className="text-sm text-muted-foreground">Milestones unlocked</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/achievements">View All</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950/30 dark:to-sky-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <span>Insights</span>
            </CardTitle>
            <CardDescription>Discover your reading patterns</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">
              Uncover your unique reading habits
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/insights">View Insights</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Reads</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/library">View All</Link>
            </Button>
          </div>
          <RecentReads />
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Reading Stats</h2>
          </div>
          <ReadingStats />
        </section>
      </div>

      <section className="mt-12">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Latest Achievements</h2>
        </div>
        <Achievements />
      </section>
    </div>
  );
}
