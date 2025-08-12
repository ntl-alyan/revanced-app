import { Button } from "@/src/components/ui/button";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";


export function PageHeader({ 
  title, 
  description, 
  actionLabel, 
  actionLink, 
  actionIcon = <PlusCircle className="mr-2 h-4 w-4" />, 
  children 
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>}
      </div>
      
      <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
        {children}
        
        {actionLabel && actionLink && (
          <Button asChild>
            <Link href={actionLink}>
              {actionIcon}
              {actionLabel}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
