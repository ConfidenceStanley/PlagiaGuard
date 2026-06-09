const LoadingSpinner = ({ size = "medium", color = "blue" }) => {
  const sizes = {
    small: "w-5 h-5 border-2",
    medium: "w-8 h-8 border-2",
    large: "w-14 h-14 border-4",
  };

  const colors = {
    blue: "border-blue-500 border-t-transparent",
    white: "border-white border-t-transparent",
    navy: "border-blue-900 border-t-transparent",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizes[size]} 
          ${colors[color]} 
          rounded-full animate-spin
        `}
      />
      {size === "large" && (
        <p className="text-white text-sm font-medium animate-pulse">
          Loading PlagiaGuard...
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;