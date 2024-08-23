import React from 'react';

const Header = ({ title, children }) => {
  return (
    <header className="w-full h-20 bg-transparent border-b border-gray-300 sticky top-0 z-50">
      <div className="container mx-auto px-3 h-full flex items-center justify-between">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
          {title}
        </h1>
        {children}
      </div>
    </header>
  );
};

export default Header;
