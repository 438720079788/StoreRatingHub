import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  iconClass?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
};

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconClass, 
  trend 
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={cn("p-3 rounded-full mr-4", iconClass || "bg-gray-100")}>
            <span className="material-icons">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-medium text-gray-900">{value || 0}</h3>
          </div>
        </div>
        
        {(trend || subtitle) && (
          <div className="mt-4">
            {trend && (
              <div className="flex items-center text-sm">
                <span className={cn(
                  "flex items-center",
                  trend.positive ? "text-green-500" : "text-red-500"
                )}>
                  <span className="material-icons text-sm">
                    {trend.positive ? "arrow_upward" : "arrow_downward"}
                  </span>
                  <span>{trend.value}</span>
                </span>
                {subtitle && (
                  <span className="ml-2 text-gray-500">{subtitle}</span>
                )}
              </div>
            )}
            
            {!trend && subtitle && (
              <div className="text-sm text-gray-500">{subtitle}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
