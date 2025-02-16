export function InputField({
  label,
  id,
  name,
  type,
  defaultValue,
  onChange,
  error,
  ...props
}: {
  label: string;
  id: string;
  name: string;
  type: string;
  defaultValue: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  [key: string]: any; // Allow other props
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        defaultValue={defaultValue}
        onChange={onChange}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-900 dark:text-gray-100"
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
