import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
    text: string;
  };
  bgColor?: string;
  className?: string;
};

export function StatCard({ title, value, icon, trend, bgColor = "bg-blue-100 dark:bg-blue-900", className }: StatCardProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow p-5 border border-gray-200 dark:border-gray-700", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">{value}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
        </div>
        <div className={cn("p-3 rounded-full", bgColor)}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn("flex items-center", trend.isPositive ? "text-green-500" : "text-red-500")}>
            {trend.isPositive ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {trend.value}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">{trend.text}</span>
        </div>
      )}
    </div>
  );
}
