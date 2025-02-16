import { Form, Link } from "react-router";
import { InputField } from "./InputField";
import type { BookWithRelations } from "~/lib/BookService";

export function BookEditForm({
  book,
  actionData,
  editFormData,
  handleInputChange,
}: {
  book: BookWithRelations;
  actionData: any;
  editFormData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Form
      method="post"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full md:w-3/4 lg:w-1/2"
    >
      <input type="hidden" name="intent" value="edit" />
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
        label="Title:"
        id="title"
        name="title"
        type="text"
        defaultValue={editFormData.title}
        onChange={handleInputChange}
        error={actionData?.errors?.title}
        required
      />
      <InputField
        label="Page Count:"
        id="pageCount"
        name="pageCount"
        type="number"
        defaultValue={editFormData.pageCount}
        onChange={handleInputChange}
        error={actionData?.errors?.pageCount}
        required
        min="1"
      />
      <InputField
        label="Genres (comma-separated):"
        id="genres"
        name="genres"
        type="text"
        defaultValue={editFormData.genres.join(", ")}
        onChange={handleInputChange}
      />
      <InputField
        label="Authors (comma-separated):"
        id="authors"
        name="authors"
        type="text"
        defaultValue={editFormData.authors.join(", ")}
        onChange={handleInputChange}
        error={actionData?.errors?.authors}
      />

      <div className="flex items-center justify-end mt-4">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out"
        >
          Save Changes
        </button>
        <Link
          to={`/books/${book.id}`}
          className="ml-4 text-gray-600 hover:underline"
        >
          Cancel
        </Link>
      </div>
    </Form>
  );
}
