// page/Arena/components/Container.tsx
import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pic-secondary/10 to-pic-primary/10">
      {children}
    </div>
  );
};

export default Container;
