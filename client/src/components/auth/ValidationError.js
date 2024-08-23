export function ValidationError({ error }) {
  return error ? <p className="text-red-500">{error}</p> : null;
}
