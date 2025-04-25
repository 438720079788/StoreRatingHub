import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Store } from "lucide-react";
import { Store as StoreType } from "@shared/schema";

type StoreCardProps = {
  store: StoreType & { 
    averageRating?: number;
    totalRatings?: number;
  };
  onRate: () => void;
};

export function StoreCard({ store, onRate }: StoreCardProps) {
  // In a real app, you would have store categories and images
  // This is a simplified version
  const storeCategories = ["Retail", "Local Business", "Service"];
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="h-48 bg-gray-200 relative">
        <div className="w-full h-full flex items-center justify-center bg-primary/10">
          <Store className="h-20 w-20 text-primary/40" />
        </div>
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-sm font-medium text-gray-900 flex items-center">
          <span className="material-icons text-yellow-400 text-sm mr-1">star</span>
          {store.averageRating?.toFixed(1) || "0.0"}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{store.address}</p>
        
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {storeCategories.map((category, index) => (
            <span 
              key={index} 
              className="text-xs px-2 py-1 bg-gray-100 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <Button variant="ghost" className="text-primary p-0 h-auto">
            View Details
          </Button>
          <Button onClick={onRate}>
            Rate Store
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
