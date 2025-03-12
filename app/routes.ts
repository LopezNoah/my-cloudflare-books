import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("books", "routes/books.tsx", [
    // route(":id", "routes/books.$id.tsx"),
    route(":id/edit", "routes/books.$id.edit.tsx"),
    route("add", "routes/books/add/index.tsx"),
    route(":id/reading-sessions", "routes/books.$id.reading-sessions.tsx"),
  ]),
  route("reading-sessions/:id/edit", "routes/reading-sessions.$id.edit.tsx"),
  route("genres", "routes/genres.tsx"),
  route("profile", "routes/profile.tsx"),
  route("library", "routes/library.tsx"),
  route("books/:id", "routes/books.$id.tsx"),
  route("add", "routes/add.tsx"),
  route("insights", "routes/insights.tsx"),
] satisfies RouteConfig;
