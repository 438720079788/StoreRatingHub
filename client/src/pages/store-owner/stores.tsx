import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, Store, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { insertStoreSchema } from "@shared/schema";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StoreOwnerStores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<number | null>(null);
  const [storeToEdit, setStoreToEdit] = useState<number | null>(null);
  
  // Store form
  const storeForm = useForm<z.infer<typeof insertStoreSchema>>({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      owner_id: user?.id || 0,
    },
  });

  // Edit store form
  const editStoreForm = useForm<z.infer<typeof insertStoreSchema>>({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      owner_id: user?.id || 0,
    },
  });

  const { data: stores, isLoading } = useQuery({
    queryKey: ["/api/stores"],
    select: (data) => data.filter(store => store.owner_id === user?.id),
  });

  const createStoreMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertStoreSchema>) => {
      await apiRequest("POST", "/api/stores", data);
    },
    onSuccess: () => {
      toast({
        title: "Store created",
        description: "Your store has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setIsAddDialogOpen(false);
      storeForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create store: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof insertStoreSchema> }) => {
      await apiRequest("PUT", `/api/stores/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Store updated",
        description: "Your store has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setIsEditDialogOpen(false);
      setStoreToEdit(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update store: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/stores/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Store deleted",
        description: "Your store has been deleted successfully.",
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

  const onCreateStore = (data: z.infer<typeof insertStoreSchema>) => {
    createStoreMutation.mutate({
      ...data,
      owner_id: user?.id || 0,
    });
  };

  const handleEditStore = (store: any) => {
    editStoreForm.reset({
      name: store.name,
      email: store.email,
      address: store.address,
      owner_id: store.owner_id,
    });
    setStoreToEdit(store.id);
    setIsEditDialogOpen(true);
  };

  const onUpdateStore = (data: z.infer<typeof insertStoreSchema>) => {
    if (storeToEdit === null) return;
    
    updateStoreMutation.mutate({
      id: storeToEdit,
      data: {
        ...data,
        owner_id: user?.id || 0,
      },
    });
  };

  const handleDeleteStore = (id: number) => {
    setStoreToDelete(id);
  };

  const confirmDeleteStore = () => {
    if (storeToDelete !== null) {
      deleteStoreMutation.mutate(storeToDelete);
    }
  };

  return (
    <DashboardLayout title="My Stores">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Stores</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  Create a new store to start receiving ratings and reviews
                </DialogDescription>
              </DialogHeader>
              <Form {...storeForm}>
                <form onSubmit={storeForm.handleSubmit(onCreateStore)} className="space-y-4">
                  <FormField
                    control={storeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter store name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={storeForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter store email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={storeForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter store address"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createStoreMutation.isPending}
                    >
                      {createStoreMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Store"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stores?.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">No stores yet</h3>
              <p className="text-gray-500 mt-2">Create your first store to get started</p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Store
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores?.map((store) => (
                    <TableRow key={store.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 rounded-lg mr-3">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary"
                          onClick={() => handleEditStore(store)}
                        >
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
                                This will permanently delete your store and all its ratings. This action cannot be undone.
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Store Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>
              Update your store information
            </DialogDescription>
          </DialogHeader>
          <Form {...editStoreForm}>
            <form onSubmit={editStoreForm.handleSubmit(onUpdateStore)} className="space-y-4">
              <FormField
                control={editStoreForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter store name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editStoreForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter store email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editStoreForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter store address"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateStoreMutation.isPending}
                >
                  {updateStoreMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Store"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
