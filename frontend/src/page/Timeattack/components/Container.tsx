import React, { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => (
  <div className="w-full flex flex-col max-w-md min-h-screen bg-gray-50 border-gray-200">
    {children}
  </div>
);

export default Container;
