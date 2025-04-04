import { ReactNode } from "react";

interface ButtonProps {
  color: "white" | "green" | "gray";
  width: number;
  height: number;
  textSize?: "md" | "lg" | "xl" | "2xl";
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}

function Button({
  color,
  width,
  height,
  textSize,
  onClick,
  children,
  disabled,
}: ButtonProps) {
  const colorClasses = {
    green:
      "bg-pic-primary hover:bg-[#7cc948] active:bg-[#66a13e] text-[#fafafa]",
    white:
      "bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800 border border-gray-300",
    gray: "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed opacity-75",
  };

  return (
    <button
      className={`w-${width} h-${height} px-5 py-3 rounded-sm shadow-[0px_0px_5px_-2px_gray]
      touch-action-manipulation transition-colors duration-150 cursor-pointer
      flex items-center justify-center text-center text-${textSize}
      ${colorClasses[color]} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={color === "gray" || disabled}
    >
      {children}
    </button>
  );
}

export default Button;
