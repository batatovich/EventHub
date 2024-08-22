export function StatusMessage({ message }) {
  if (!message) return null;

  const isError = message.toLowerCase().includes('error');
  const messageClass = isError
    ? 'bg-red-100 text-red-700 border border-red-500'
    : 'bg-green-100 text-green-700 border border-green-500';

  return (
    <div className={`mt-4 w-full text-center p-3 rounded ${messageClass}`}>
      <p>{message}</p>
    </div>
  );
}
