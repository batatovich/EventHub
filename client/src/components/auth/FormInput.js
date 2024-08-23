import { ValidationError } from './ValidationError';

export function FormInput({ name, type = 'text', placeholder, validationError }) {
  return (
    <>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full border rounded h-10 px-3"
        required
      />
      <ValidationError error={validationError} />
    </>
  );
}
