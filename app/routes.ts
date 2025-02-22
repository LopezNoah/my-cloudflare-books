import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("books", "routes/books.tsx", [
    route(":id", "routes/books.$id.tsx"),
    route(":id/edit", "routes/books.$id.edit.tsx"),
    route("add", "routes/books/add/index.tsx"),
    route(":id/reading-sessions", "routes/books.$id.reading-sessions.tsx"),
  ]),
  route("reading-sessions", "routes/reading-sessions.tsx", [
    route(":id", "routes/reading-sessions.$id.tsx", [
      route("edit", "routes/reading-sessions.$id.edit.tsx"),
    ]),
  ]),
  route("genres", "routes/genres.tsx"),
] satisfies RouteConfig;
