import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Store, Trash2, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function UserRatings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ratingToDelete, setRatingToDelete] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRating, setEditRating] = useState<{id: number, storeId: number, rating: number, review?: string}>({
    id: 0,
    storeId: 0,
    rating: 0,
    review: ""
  });

  const { data: ratings, isLoading } = useQuery({
    queryKey: ["/api/ratings/user", user?.id],
    enabled: !!user,
  });

  const deleteRatingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/ratings/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Rating deleted",
        description: "Your rating has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ratings/user", user?.id] });
      setRatingToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete rating: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateRatingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: { rating: number, review?: string, store_id: number, user_id: number } }) => {
      await apiRequest("POST", "/api/ratings", data);
    },
    onSuccess: () => {
      toast({
        title: "Rating updated",
        description: "Your rating has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ratings/user", user?.id] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update rating: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteRating = (id: number) => {
    setRatingToDelete(id);
  };

  const confirmDeleteRating = () => {
    if (ratingToDelete !== null) {
      deleteRatingMutation.mutate(ratingToDelete);
    }
  };

  const handleEditRating = (id: number, storeId: number, currentRating: number, currentReview?: string) => {
    setEditRating({
      id,
      storeId,
      rating: currentRating,
      review: currentReview || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRating = () => {
    if (!user) return;
    
    updateRatingMutation.mutate({
      id: editRating.id,
      data: {
        store_id: editRating.storeId,
        user_id: user.id,
        rating: editRating.rating,
        review: editRating.review || undefined
      }
    });
  };

  return (
    <DashboardLayout title="My Ratings">
      <Card>
        <CardHeader>
          <CardTitle>My Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ratings?.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">No ratings yet</h3>
              <p className="text-gray-500 mt-2">You haven't rated any stores yet.</p>
              <Button className="mt-4" onClick={() => window.location.href = "/user/stores"}>
                Browse Stores
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {ratings?.map((rating) => (
                <div key={rating.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 rounded-lg mr-3">
                        <AvatarFallback className="rounded-lg">
                          <Store className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium">{rating.store?.name}</h3>
                        <p className="text-sm text-gray-500">{rating.store?.address}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary"
                        onClick={() => handleEditRating(rating.id, rating.store_id, rating.rating, rating.review)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={ratingToDelete === rating.id} onOpenChange={() => setRatingToDelete(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteRating(rating.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete your rating. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={confirmDeleteRating}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteRatingMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    <StarRating value={rating.rating} readOnly size="md" />
                    <span className="ml-2 text-sm text-gray-500">
                      {format(new Date(rating.created_at), 'MMMM d, yyyy')}
                    </span>
                  </div>

                  {rating.review && (
                    <p className="text-gray-700">{rating.review}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Rating Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Your Rating</DialogTitle>
          </DialogHeader>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Your rating:</p>
            <StarRating
              value={editRating.rating}
              onChange={(value) => setEditRating({...editRating, rating: value})}
              size="lg"
            />
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Review (optional):</p>
            <Textarea
              rows={4}
              placeholder="Write your review here..."
              value={editRating.review}
              onChange={(e) => setEditRating({...editRating, review: e.target.value})}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRating}
              disabled={updateRatingMutation.isPending}
            >
              {updateRatingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Rating"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
