import { Form } from "react-router";
import { InputField } from "./InputField";

type ActionData =
  | {
      errors?: { [key: string]: string };
    }
  | undefined;

export function ReadingSessionModal({
  onClose,
  actionData,
  nextPageStart,
}: {
  onClose: () => void;
  actionData: ActionData;
  nextPageStart: number;
}) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center">
      <Form
        method="post"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full md:w-3/4 lg:w-1/2"
      >
        <input type="hidden" name="intent" value="add-reading-session" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Add Reading Session
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
          defaultValue={new Date().toISOString().split("T")[0]}
          onChange={() => {}}
          placeHolder="YYYY-MM-DD"
          error={actionData?.errors?.startTime}
          required
        />
        <InputField
          label="Duration (minutes):"
          id="duration"
          name="duration"
          type="number"
          defaultValue={""}
          onChange={() => {}}
          error={actionData?.errors?.duration}
          required
          min="1"
        />
        <InputField
          label="Start Page:"
          id="pageStart"
          name="pageStart"
          type="number"
          defaultValue={nextPageStart}
          onChange={() => {}}
          error={actionData?.errors?.pageStart}
          required
          min="1"
        />
        <InputField
          label="End Page:"
          id="pageEnd"
          name="pageEnd"
          type="number"
          defaultValue={""}
          onChange={() => {}}
          error={actionData?.errors?.pageEnd}
          required
        />
        <div className="mb-4">
          <label htmlFor="finishedBook" className="flex items-center">
            <input
              type="checkbox"
              id="finishedBook"
              name="finishedBook"
              value="true" // Important: Send "true" as string
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
            Add Session
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 text-gray-600 hover:underline"
          >
            Cancel
          </button>
        </div>
      </Form>
    </div>
  );
}
