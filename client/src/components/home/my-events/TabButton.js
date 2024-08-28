import React from 'react';

function TabButton({ isActive, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 text-center transition border-b-2 ${isActive ? 'border-blue-500 text-blue-500 font-semibold' : 'border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-300'}`}
    >
      {label}
    </button>
  );
}

export default TabButton;
