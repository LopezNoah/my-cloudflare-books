// import type { Route } from "./+types/books.$id.reading-sessions.$sessionId.edit";
import {
  redirect,
  Form,
  useActionData,
  Link,
  isRouteErrorResponse,
} from "react-router";
import { BookService } from "~/lib/BookService";
import { InputField } from "~/components/InputField";
import { z } from "zod";
import type { Route } from "./+types/reading-sessions.$id.edit";
import { data } from "react-router";

type LoaderData = {
  session: NonNullable<Awaited<ReturnType<BookService["getReadingSession"]>>>;
};
export async function loader({ params, context }: Route.LoaderArgs) {
  // const bookId = parseInt(params.id || "0");
  const sessionId = parseInt(params.id || "0");

  if (isNaN(sessionId)) {
    throw data("Invalid ID", { status: 400 });
  }

  const bookService = new BookService(context.db);
  const session = await bookService.getReadingSession(sessionId);

  if (!session) {
    throw data("Reading session not found", { status: 404 });
  }

  // if (session.bookId !== bookId) {
  //   throw data("Reading session does not belong to this book", {
  //     status: 403,
  //   });
  // }
  return { session } satisfies LoaderData;
}

const readingSessionSchema = z.object({
  startTime: z.string().datetime(),
  duration: z.coerce.number().int().min(1),
  pageStart: z.coerce.number().int().min(1),
  pageEnd: z.coerce.number().int().min(1),
  finishedBook: z.coerce.boolean(),
});

export const action = async ({
  request,
  params,
  context,
}: Route.ActionArgs) => {
  const bookId = parseInt(params.id || "0");
  const sessionId = parseInt(params.sessionId || "0");

  if (isNaN(bookId) || isNaN(sessionId)) {
    return { errors: { general: "Invalid ID" } };
  }

  const bookService = new BookService(context.db);

  const formData = await request.formData();

  const startTime = formData.get("startTime");
  const duration = formData.get("duration");
  const pageStart = formData.get("pageStart");
  const pageEnd = formData.get("pageEnd");
  const finishedBookString = formData.get("finishedBook"); // Get as string
  const finishedBook = finishedBookString === "true"; // Convert to boolean

  const result = readingSessionSchema.safeParse({
    startTime,
    duration,
    pageStart,
    pageEnd,
    finishedBook,
  });

  if (!result.success) {
    console.log(result.error.flatten());
    return { errors: result.error.flatten().fieldErrors };
  }

  const validatedData = result.data;

  try {
    await bookService.updateReadingSession(sessionId, {
      startTime: validatedData.startTime,
      duration: validatedData.duration,
      pageStart: validatedData.pageStart,
      pageEnd: validatedData.pageEnd,
      finishedBook: validatedData.finishedBook,
    });
  } catch (error) {
    console.error("Failed to update reading session:", error);
    return { errors: { general: "Failed to update reading session" } };
  }

  return redirect(`/books/${bookId}/reading-sessions`);
};

type ActionData =
  | {
      errors?: { [key: string]: string[] | undefined };
    }
  | undefined;

export default function EditReadingSessionPage({
  loaderData,
}: Route.ComponentProps) {
  const { session } = loaderData;
  const actionData = useActionData<ActionData>();

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center">
      <Form
        method="post"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full md:w-3/4 lg:w-1/2"
      >
        <input type="hidden" name="intent" value="edit-reading-session" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Edit Reading Session
        </h2>

        {actionData?.errors?.general && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{actionData.errors.general}</span>
          </div>
        )}

        <InputField
          label="Start Time:"
          id="startTime"
          name="startTime"
          type="text"
          defaultValue={session.startTime}
          onChange={() => {}}
          placeHolder="YYYY-MM-DD"
          error={actionData?.errors?.startTime?.[0]}
          required
        />
        <InputField
          label="Duration (minutes):"
          id="duration"
          name="duration"
          type="number"
          defaultValue={session.duration}
          onChange={() => {}}
          error={actionData?.errors?.duration?.[0]}
          required
          min="1"
        />
        <InputField
          label="Start Page:"
          id="pageStart"
          name="pageStart"
          type="number"
          defaultValue={session.pageStart}
          onChange={() => {}}
          error={actionData?.errors?.pageStart?.[0]}
          required
          min="1"
        />
        <InputField
          label="End Page:"
          id="pageEnd"
          name="pageEnd"
          type="number"
          defaultValue={session.pageEnd}
          onChange={() => {}}
          error={actionData?.errors?.pageEnd?.[0]}
          required
        />
        <div className="mb-4">
          <label htmlFor="finishedBook" className="flex items-center">
            <input
              type="checkbox"
              id="finishedBook"
              name="finishedBook"
              value="true"
              defaultChecked={session.finishedBook || false}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Finished Book
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out"
          >
            Save Changes
          </button>
          <Link
            to={`/books/${session.bookId}/reading-sessions`}
            className="ml-4 text-gray-600 hover:underline"
          >
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-900 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
            <h1 className="text-4xl font-bold mb-4">
              {error.status} {error.statusText}
            </h1>
            <p className="text-lg">
              {error.data?.message ||
                error.data ||
                "An error occurred while fetching data."}
            </p>{" "}
            {/* Handle potential nested message */}
          </div>
        </div>
      </>
    );
  } else if (error instanceof Error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <h1 className="text-4xl font-bold mb-4">
            Oops! Something went wrong.
          </h1>
          <p className="text-lg mb-4">{error.message}</p>
          <p className="font-bold mb-2">Stack Trace:</p>
          <pre className="bg-gray-200 p-4 rounded-md overflow-x-auto text-sm">
            {error.stack}
          </pre>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
          <h1 className="text-4xl font-bold mb-4">Unknown Error</h1>
          <p className="text-lg">
            An unexpected error occurred. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
