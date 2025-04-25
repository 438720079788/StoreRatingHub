import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function StoreOwnerDashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats/store-owner"],
  });

  return (
    <DashboardLayout title="Store Owner Dashboard">
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
              title="Total Stores"
              value={stats?.storeCount || 0}
              icon="store"
              iconClass="bg-primary-light/10 text-primary"
            />
            <StatsCard
              title="Average Rating"
              value={(stats?.averageRating || 0).toFixed(1)}
              icon="star"
              iconClass="bg-secondary-light/10 text-secondary"
            />
            <StatsCard
              title="Total Reviews"
              value={stats?.totalRatings || 0}
              icon="rate_review"
              iconClass="bg-info/10 text-info"
            />
          </>
        )}
      </div>

      {/* Store Performance */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Store Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ) : stats?.storePerformance?.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">No stores yet</h3>
              <p className="text-gray-500 mt-2">Create your first store to see performance metrics.</p>
              <Button className="mt-4" onClick={() => setLocation('/store-owner/stores')}>
                Create Store
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {stats?.storePerformance?.map((store, index) => (
                <div 
                  key={store.id} 
                  className={`p-4 rounded-lg ${index % 2 === 0 ? 'bg-primary-light/5' : 'bg-secondary-light/5'}`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex items-center mb-4 md:mb-0">
                      <Avatar className="h-12 w-12 rounded-lg mr-4">
                        <AvatarFallback className="rounded-lg">
                          {store.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <StarRating value={store.averageRating} readOnly />
                      <span className="ml-2 font-medium">{store.averageRating.toFixed(1)}</span>
                      <span className="ml-1 text-gray-500">({store.totalRatings} ratings)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = store.ratingDistribution[star] || 0;
                      const percentage = store.totalRatings > 0 
                        ? Math.round((count / store.totalRatings) * 100) 
                        : 0;
                        
                      return (
                        <div key={star} className="flex items-center">
                          <div className="text-sm w-12">{star} stars</div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                            <div 
                              className="bg-yellow-400 h-2.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm w-12 text-right">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Ratings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentRatings?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No ratings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.recentRatings?.map((rating, index) => (
                <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>
                          {rating.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{rating.user.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <StarRating value={rating.rating} readOnly size="sm" />
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{rating.store.name}</span>
                    {rating.review && ` - ${rating.review}`}
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => setLocation('/store-owner/stores')}>
                  View All Stores
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
