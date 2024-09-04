export function StatusMessage({ message }) {
  if (!message) return null;

  const firstWord = message?.split(':')[0]?.toLowerCase();

  let messageClass;
  if (firstWord === 'error') {
    messageClass = 'bg-red-100 text-red-700 border border-red-500';
  } else if (firstWord === 'fail') {
    messageClass = 'bg-orange-100 text-orange-700 border border-orange-500';
  } else if (firstWord === 'success') {
    messageClass = 'bg-green-100 text-green-700 border border-green-500';
  } else {
    messageClass = 'bg-gray-100 text-gray-700 border border-gray-500'; 
  }

  return (
    <div className={`mt-4 w-full text-center p-3 rounded ${messageClass}`}>
      <p>{message}</p>
    </div>
  );
}
