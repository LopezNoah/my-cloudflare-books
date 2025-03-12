"use client";
import { SearchIcon as BookSearch, Upload, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Route } from "./+types/add";
import { getAuth } from "@clerk/react-router/ssr.server";
import { Form, redirect, useNavigation } from "react-router";
import { bookReads, books } from "~/database/schema";

export async function action(args: Route.ActionArgs) {
  const { request, context } = args;
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/home");
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const type = formData.get("type") as string;
  const status = formData.get("status") as string;
  const genre = formData.get("genre") as string;
  const description = formData.get("description") as string;

  const errors: Record<string, any> = {};
  if (!title) {
    errors.title = ["Title is required"];
  }
  if (!author) {
    errors.author = ["Author is required"];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const newBook = await context.db
    .insert(books)
    .values({
      title,
      author,
      // type,
      // status,
      genre,
      // description,
      userId,
    })
    .returning()
    .get();

  if (!newBook) {
    throw new Error("Failed to create book");
  }

  const newBookRead = await context.db
    .insert(bookReads)
    .values({
      bookId: newBook.id,
      userId,
      status: "to-read",
    })
    .returning()
    .get();

  if (!newBookRead) {
    throw new Error("Failed to create book read record");
  }

  return redirect("/library");
}

export default function AddBookPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="relative z-10">
      <div className="container mx-auto max-w-3xl px-4 py-8 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-lg shadow-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add to Your Library</h1>
          <p className="text-muted-foreground">
            Track a new book, article, or any reading material
          </p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <BookSearch className="h-4 w-4" />
              <span>Search Online</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-6">
            <Card>
              <Form method="post">
                <CardHeader>
                  <CardTitle>Manual Entry</CardTitle>
                  <CardDescription>
                    Add details about what you&apos;re reading
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter the title"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        name="author"
                        placeholder="Enter the author's name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select defaultValue="book">
                          <SelectTrigger id="type" name="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="book">Book</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="blog">Blog Post</SelectItem>
                            <SelectItem value="forum">Forum Thread</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select defaultValue="to-read">
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="to-read">To Read</SelectItem>
                            <SelectItem value="reading">
                              Currently Reading
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="dnf">Did Not Finish</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="genre">Genre</Label>
                      <Input
                        id="genre"
                        name="genre"
                        placeholder="E.g., Fantasy, Non-Fiction, Science"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Add a brief description or your thoughts"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cover">Cover Image</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative h-[120px] w-[80px] overflow-hidden rounded border bg-muted">
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <BookOpen className="h-8 w-8" />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Cover</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add to Library"}
                  </Button>
                </CardFooter>
              </Form>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Online</CardTitle>
                <CardDescription>
                  Find books from online databases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <BookSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by title, author, or ISBN..."
                      className="pl-9"
                    />
                  </div>
                  <div className="rounded-lg border p-8 text-center">
                    <BookSearch className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">
                      Search for books
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Enter a title, author name, or ISBN to find books from
                      online databases
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
