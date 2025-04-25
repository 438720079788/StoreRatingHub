import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Store, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Store as StoreType, InsertRating } from "@shared/schema";

type RatingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: StoreType | null;
};

export function RatingDialog({ open, onOpenChange, store }: RatingDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const submitRatingMutation = useMutation({
    mutationFn: async (data: InsertRating) => {
      await apiRequest("POST", "/api/ratings", data);
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Your rating has been submitted successfully."
      });
      // Reset form
      setRating(0);
      setReview("");
      // Close dialog
      onOpenChange(false);
      // Refresh stores data
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit rating: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmitRating = () => {
    if (!store) return;
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    submitRatingMutation.mutate({
      store_id: store.id,
      user_id: 0, // This will be set by the server
      rating,
      review: review.trim() || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate This Store</DialogTitle>
        </DialogHeader>
        
        {store && (
          <>
            <div className="mb-4">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 rounded-lg mr-4">
                  <AvatarFallback className="rounded-lg">
                    <Store className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-md font-medium text-gray-900">{store.name}</h3>
                  <div className="text-sm text-gray-500">{store.address}</div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Your rating:</p>
              <StarRating
                value={rating}
                onChange={setRating}
                size="lg"
              />
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Review (optional):</p>
              <Textarea
                rows={4}
                placeholder="Write your review here..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitRating}
                disabled={submitRatingMutation.isPending}
              >
                {submitRatingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Rating"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
