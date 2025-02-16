import * as schema from "~/database/schema";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request, context }: Route.ActionArgs) {}

export async function loader({ context }: Route.LoaderArgs) {
  return { message: "Hello World!" };
}

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  return <div>{loaderData.message}</div>;
}
