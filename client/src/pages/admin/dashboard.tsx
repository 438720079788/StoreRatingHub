import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats/admin"],
  });

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Users"
              value={stats?.userCount}
              icon="people"
              iconClass="bg-primary-light/10 text-primary"
            />
            <StatsCard
              title="Total Stores"
              value={stats?.storeCount}
              icon="store"
              iconClass="bg-secondary-light/10 text-secondary"
            />
            <StatsCard
              title="Total Ratings"
              value={stats?.ratingCount}
              icon="star"
              iconClass="bg-info/10 text-info"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.recentActivity?.map((activity, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          {activity.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{activity.user.name}</div>
                        <div className="text-xs text-gray-500">{activity.user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {activity.type === 'rating' ? 'New Rating' : 'New Store'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {activity.type === 'rating' ? (
                        <>
                          <span className="font-medium">{activity.store.name}</span>
                          {` - ${activity.rating} star rating`}
                        </>
                      ) : (
                        <span className="font-medium">{activity.store.name} (new store)</span>
                      )}
                    </div>
                    {activity.type === 'rating' && (
                      <StarRating value={activity.rating} readOnly size="sm" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
              
              {stats?.recentActivity?.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
