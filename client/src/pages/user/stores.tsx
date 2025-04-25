import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StoreCard } from "@/components/stores/store-card";
import { RatingDialog } from "@/components/stores/rating-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function UserStores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const { data: stores, isLoading } = useQuery({
    queryKey: ["/api/stores"],
  });

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setIsRatingDialogOpen(true);
  };

  // Filter stores based on search term and category
  const filteredStores = stores?.filter(store => {
    const matchesSearch = searchTerm === "" || 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // In a real app, stores would have categories
    const matchesCategory = category === "";
    
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <DashboardLayout title="Find Stores">
      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Find Stores</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by store name, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 md:flex-none md:w-48">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="food">Food & Drinks</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-none">
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : (
        <>
          {filteredStores.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">No stores found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search parameters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onRate={() => handleRateStore(store)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Rating Dialog */}
      <RatingDialog 
        open={isRatingDialogOpen} 
        onOpenChange={setIsRatingDialogOpen}
        store={selectedStore}
      />
    </DashboardLayout>
  );
}
