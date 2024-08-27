import React, { createContext, useContext } from 'react';

const RefetchContext = createContext();

export const useRefetch = () => useContext(RefetchContext);

export const RefetchProvider = ({ children, refetch }) => (
  <RefetchContext.Provider value={refetch}>
    {children}
  </RefetchContext.Provider>
);