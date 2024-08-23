'use client';

export function FormButton({ label, processing }) {
  return (
    <button
      type="submit"
      className={`w-full font-bold py-2 px-4 rounded ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
      disabled={processing}
    >
      {label}
    </button>
  );
};

