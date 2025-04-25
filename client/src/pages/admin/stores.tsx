import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Store as StoreType, StoreWithRatings } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Search, Plus, Edit, Trash2, ArrowUpDown, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminStores() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [storeToDelete, setStoreToDelete] = useState<number | null>(null);

  const { data: stores, isLoading } = useQuery<StoreWithRatings[]>({
    queryKey: ["/api/stores"],
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/stores/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Store deleted",
        description: "The store has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setStoreToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete store: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteStore = (id: number) => {
    setStoreToDelete(id);
  };

  const confirmDeleteStore = () => {
    if (storeToDelete !== null) {
      deleteStoreMutation.mutate(storeToDelete);
    }
  };

  // Filter and sort stores
  const filteredStores = stores?.filter((store: StoreWithRatings) => {
    return searchTerm === "" || 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  return (
    <DashboardLayout title="Stores Management">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stores</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Store</DialogTitle>
                <DialogDescription>
                  Create a new store
                </DialogDescription>
              </DialogHeader>
              {/* Add store form would go here */}
              <div className="py-4">Store form placeholder (not implemented)</div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Store</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center w-full md:w-auto">
              <Input
                type="text"
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mr-2"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <label className="text-sm text-muted-foreground">Sort by:</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center cursor-pointer">
                        Store
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer">
                        Owner
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer">
                        Rating
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer">
                        Address
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No stores found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStores.map((store) => (
                      <TableRow key={store.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3 rounded-lg">
                              <AvatarFallback className="rounded-lg">
                                <Store className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{store.name}</div>
                              <div className="text-sm text-muted-foreground">{store.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{store.owner?.name || "Unknown"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <StarRating 
                              value={store.averageRating || 0} 
                              readOnly 
                              size="sm" 
                            />
                            <span className="ml-2 text-sm text-muted-foreground">
                              {store.averageRating?.toFixed(1) || "0.0"} ({store.totalRatings || 0})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {store.address}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={storeToDelete === store.id} onOpenChange={() => setStoreToDelete(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDeleteStore(store.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the store and all its ratings. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={confirmDeleteStore}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleteStoreMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{filteredStores.length}</span> of{" "}
              <span className="font-medium">{filteredStores.length}</span> results
            </div>
            <div className="flex space-x-2">
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
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
