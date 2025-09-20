interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({
  message = "Loading...",
}: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6">
        <svg
          className="w-24 h-24"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-primary animate-pulse"
          />
          <path
            d="M 50,50 m 0,-30 a 30,30 0 1,1 0,60 a 30,30 0 1,1 0,-60"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-primary animate-spin-slow"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
        <p className="text-xl font-medium text-foreground animate-fade-in">
          {message}
        </p>
      </div>
    </div>
  );
}
