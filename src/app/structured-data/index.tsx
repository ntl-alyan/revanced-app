import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { PlusCircle, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';
import { MainLayout } from '@/components/layout/main-layout';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CustomBreadcrumb } from '@/components/ui/custom-breadcrumb';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface StructuredData {
  _id: string;
  entityType: string;
  entityId: string;
  schemaType: string;
  schemaData: any;
  createdAt: string;
  updatedAt: string;
}

interface InsertStructuredData {
  entityType: string;
  entityId: string;
  schemaType: string;
  schemaData: any;
}

const StructuredDataPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<StructuredData | null>(null);
  const [newData, setNewData] = useState<InsertStructuredData>({
    entityType: 'app',
    entityId: '',
    schemaType: 'Product',
    schemaData: '{}',
  });

  const { data: structuredDataList = [], isLoading, refetch } = useQuery<StructuredData[]>({
    queryKey: ['/api/structured-data'],
    queryFn: async () => {
      const res = await fetch('/api/structured-data');
      if (!res.ok) throw new Error('Failed to fetch structured data');
      return res.json();
    },
  });

  const { data: appsList = [] } = useQuery<any[]>({
    queryKey: ['/api/apps'],
    queryFn: async () => {
      const res = await fetch('/api/apps');
      if (!res.ok) throw new Error('Failed to fetch apps');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertStructuredData) => {
      const processedData = {
        ...data,
        schemaData: typeof data.schemaData === 'string' ? JSON.parse(data.schemaData) : data.schemaData,
      };
      return await apiRequest('POST', '/api/structured-data', processedData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Structured data created successfully",
      });
      setIsAddDialogOpen(false);
      setNewData({
        entityType: 'app',
        entityId: '',
        schemaType: 'Product',
        schemaData: '{}',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/structured-data'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/structured-data/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Structured data deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedData(null);
      queryClient.invalidateQueries({ queryKey: ['/api/structured-data'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate JSON
      if (newData.schemaData) {
        JSON.parse(typeof newData.schemaData === 'string' ? newData.schemaData : JSON.stringify(newData.schemaData));
      }
      createMutation.mutate(newData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON in schema data",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (selectedData) {
      deleteMutation.mutate(selectedData._id);
    }
  };

  const filteredData = structuredDataList.filter(data => 
    data.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.schemaType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.entityId.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEntityName = (entityType: string, entityId: string) => {
    if (entityType === 'app') {
      const app = appsList.find(app => app._id === entityId);
      return app ? app.name : entityId;
    }
    return entityId;
  };

  const formatSchemaData = (data: any) => {
    if (!data) return '{}';
    try {
      if (typeof data === 'string') {
        return data;
      }
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return '{}';
    }
  };

  const getPreviewUrl = (data: StructuredData) => {
    if (data.entityType === 'app') {
      const app = appsList.find(app => app._id === data.entityId);
      return app ? `/app/${app.slug}` : '#';
    }
    return '#';
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Structured Data | Admin Panel</title>
      </Helmet>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <CustomBreadcrumb
            items={[
              { label: 'Home', link: '/admin' },
              { label: 'Structured Data', link: '/admin/structured-data' }
            ]}
          />
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Structured Data</CardTitle>
                <CardDescription>
                  Manage structured data for SEO and rich snippets
                </CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by entity type, entity ID, or schema type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Schema Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No structured data found</TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((data) => (
                        <TableRow key={data._id}>
                          <TableCell>
                            <Badge variant="outline">{data.entityType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={getPreviewUrl(data)} className="hover:underline">
                              {getEntityName(data.entityType, data.entityId)}
                            </Link>
                          </TableCell>
                          <TableCell>{data.schemaType}</TableCell>
                          <TableCell>{new Date(data.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(data.updatedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setLocation(`/admin/structured-data/edit/${data._id}`);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedData(data);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Structured Data Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Structured Data</DialogTitle>
            <DialogDescription>
              Create structured data for SEO optimization. This will generate schema markup for your content.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entityType" className="text-right">
                  Entity Type
                </Label>
                <Select
                  value={newData.entityType}
                  onValueChange={(value) => setNewData({ ...newData, entityType: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">App</SelectItem>
                    <SelectItem value="homepage">Homepage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entityId" className="text-right">
                  Entity
                </Label>
                <Select
                  value={newData.entityId}
                  onValueChange={(value) => setNewData({ ...newData, entityId: value })}
                  disabled={newData.entityType === 'homepage'}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {newData.entityType === 'app' && appsList.map(app => (
                      <SelectItem key={app._id} value={app._id}>{app.name}</SelectItem>
                    ))}
                    {newData.entityType === 'homepage' && (
                      <SelectItem value="homepage">Homepage</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="schemaType" className="text-right">
                  Schema Type
                </Label>
                <Select
                  value={newData.schemaType}
                  onValueChange={(value) => setNewData({ ...newData, schemaType: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select schema type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="SoftwareApplication">Software Application</SelectItem>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="WebSite">WebSite</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="schemaData" className="text-right pt-2">
                  Schema Data
                </Label>
                <Textarea
                  id="schemaData"
                  className="col-span-3 font-mono min-h-[200px]"
                  placeholder='{"@context": "https://schema.org", "@type": "Product", ...}'
                  value={formatSchemaData(newData.schemaData)}
                  onChange={(e) => setNewData({ ...newData, schemaData: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Structured Data"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this structured data? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default StructuredDataPage;