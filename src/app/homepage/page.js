"use client"
import { useQuery, useMutation } from "@tanstack/react-query";
//import {homepageSectionSchema, homepageSectionItemSchema, HomepageSection } from "@shared/schema";



import { Eye, Save, Plus, Trash2, MoveUp, MoveDown, MoreVertical, Languages, Globe, Search, ImageIcon } from "lucide-react";



import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/src/lib/queryClient";
import { useState, useEffect } from "react";
import { Textarea } from "@/src/components/ui/textarea";
import { Input } from "@/src/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/src/components/ui/select";
import { 
	Form, 
	FormControl, 
	FormField, 
	FormItem, 
	FormLabel, 
	FormMessage 
} from "@/src/components/ui/form";
import { 
	Accordion, 
	AccordionContent, 
	AccordionItem, 
	AccordionTrigger 
} from "@/src/components/ui/accordion";
import { TranslationManager } from "@/src/components/language/translation-manager";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { useToast } from "@/src/hooks/use-toast";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";

// Extend homepage schema to include SEO fields and download fields
const homepageFormSchema = z.object({
	//Dear Alyan Please uncomment the sections below when you have the homepageSectionSchema ready
//	sections: z.array(homepageSectionSchema),
	version: z.string().optional(),
	downloadUrl: z.string().optional(),
	downloadId: z.string().optional(),
	metaTitle: z.string().optional(),
	metaDescription: z.string().optional(),
	metaKeywords: z.string().optional(),
	ogTitle: z.string().optional(),
	ogDescription: z.string().optional(),
	ogImage: z.string().optional(),
});


export default function HomepagePage() {
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState("content");
	
	// Fetch homepage data
	const { data: homepageData, isLoading } = useQuery({
		queryKey: ["/api/homepage"],
	});
	
	// Setup form with homepage data
	const form = useForm({
		resolver: zodResolver(homepageFormSchema),
		defaultValues: {
			sections: homepageData?.sections || [] ,
			version: homepageData?.version || '',
			downloadUrl: homepageData?.downloadUrl || '',
			downloadId: homepageData?.downloadId || '',
			metaTitle: homepageData?.metaTitle || '',
			metaDescription: homepageData?.metaDescription || '',
			metaKeywords: homepageData?.metaKeywords || '',
			ogTitle: homepageData?.ogTitle || '',
			ogDescription: homepageData?.ogDescription || '',
			ogImage: homepageData?.ogImage || ''
		},
	});

	const metaTitle = form.watch('metaTitle');
	const metaDescription = form.watch('metaDescription');
	
	useEffect(() => {
		if (metaTitle !== undefined) {
			form.setValue('ogTitle', metaTitle, { shouldValidate: true });
		}
	}, [metaTitle, form]);
	
	useEffect(() => {
		if (metaDescription !== undefined) {
			form.setValue('ogDescription', metaDescription, { shouldValidate: true });
		}
	}, [metaDescription, form]);
	
	// Setup field array for sections
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "sections",
	});
	
	// Update form when homepage data is loaded
	useEffect(() => {
		if (homepageData) {
			form.reset({
				sections: homepageData.sections || [],
				version: homepageData.version || '',
				downloadUrl: homepageData.downloadUrl || '',
				downloadId: homepageData.downloadId || '',
				metaTitle: homepageData.metaTitle || '',
				metaDescription: homepageData.metaDescription || '',
				metaKeywords: homepageData.metaKeywords || '',
				ogTitle: homepageData.ogTitle || '',
				ogDescription: homepageData.ogDescription || '',
				ogImage: homepageData.ogImage || ''
			});
		}
	}, [homepageData, form]);
	
	// Setup mutation for updating homepage
	const updateMutation = useMutation({
		mutationFn: async (data) => {
			const res = await apiRequest("PATCH", "/api/homepage", data);
			return await res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["/api/homepage"] });
			toast({
				title: "Success",
				description: "Homepage updated successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error updating homepage",
				description: error.message,
				variant: "destructive",
			});
		},
	});
	
	// Handle form submission
	const onSubmit = (data) => {
		updateMutation.mutate(data);
	};
	
	// Move a section up
	const moveUp = (index) => {
		if (index === 0) return;
		const sections = [...form.getValues().sections];
		const temp = sections[index];
		sections[index] = sections[index - 1];
		sections[index - 1] = temp;
		form.setValue('sections', sections);
	};

	// Move a section down
	const moveDown = (index) => {
		const sections = [...form.getValues().sections];
		if (index === sections.length - 1) return;
		const temp = sections[index];
		sections[index] = sections[index + 1];
		sections[index + 1] = temp;
		form.setValue('sections', sections);
	};

	// Section type options
	const sectionTypeOptions = [
		{ label: "Hero", value: "hero" },
		{ label: "Introduction", value: "intro" },
		{ label: "About", value: "about" },
		{ label: "Goals", value: "goals" },
		{ label: "Features", value: "features" },
		{ label: "Installation", value: "installation" },
		{ label: "FAQ", value: "faq" },
		{ label: "Apps", value: "apps" },
		{ label: "Content", value: "content" }
	];

	// Add a new section
	const addSection = () => {
		append({ 
			type: "content", 
			title: "New Section", 
			content: "",
			items: []
		});
	};
	
	// Add item to a section
	const addItem = (sectionIndex) => {
		const currentSections = form.getValues().sections;
		const currentSection = currentSections[sectionIndex];
		
		const updatedSection = {
			...currentSection,
			items: [
				...(currentSection.items || []),
				{ title: "New Item", content: "" }
			]
		};
		
		const updatedSections = [...currentSections];
		updatedSections[sectionIndex] = updatedSection;
		
		form.setValue('sections', updatedSections);
	};
	
	// Remove item from a section
	const removeItem = (sectionIndex, itemIndex) => {
		const currentSections = form.getValues().sections;
		const currentSection = currentSections[sectionIndex];
		
		if (!currentSection.items) return;
		
		const updatedItems = [...currentSection.items];
		updatedItems.splice(itemIndex, 1);
		
		const updatedSection = {
			...currentSection,
			items: updatedItems
		};
		
		const updatedSections = [...currentSections];
		updatedSections[sectionIndex] = updatedSection;
		
		form.setValue('sections', updatedSections);
	};
	
	// If data is loading, show a loading state
	if (isLoading) {
		return (
			<MainLayout>
				<Helmet>
					<title>Loading Homepage - ReVanced Admin Panel</title>
				</Helmet>
				<div className="flex items-center justify-center h-full p-8">
					<div className="flex flex-col items-center gap-4">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
						<p>Loading homepage data...</p>
					</div>
				</div>
			</MainLayout>
		);
	}
	
	return (
		<MainLayout>
			<Helmet>
				<title>Homepage Editor - ReVanced Admin Panel</title>
			</Helmet>
			<div className="space-y-6 p-6">
				<PageHeader
					title="Homepage Editor"
					description="Edit the content displayed on your website's homepage"
				/>
				
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={() => window.open("/", "_blank")}
						className="gap-2"
					>
						<Eye className="h-4 w-4" />
						Preview Homepage
					</Button>
					
					<Button 
						onClick={form.handleSubmit(onSubmit)}
						disabled={updateMutation.isPending || (activeTab !== "content" && activeTab !== "seo")}
						className="gap-2"
					>
						<Save className="h-4 w-4" />
						Save Changes
					</Button>
				</div>
				
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-3 lg:w-1/2">
						<TabsTrigger value="content" className="flex items-center gap-1">
							<MoreVertical className="h-4 w-4" />
							Content
						</TabsTrigger>
						<TabsTrigger value="seo" className="flex items-center gap-1">
							<Search className="h-4 w-4" />
							SEO
						</TabsTrigger>
						<TabsTrigger value="translations" className="flex items-center gap-1">
							<Globe className="h-4 w-4" />
							Translations
						</TabsTrigger>
					</TabsList>
					
					<TabsContent value="content" className="space-y-6">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								<div className="space-y-4">
									{fields.map((field, index) => (
										<Card key={field.id} className="overflow-hidden">
											<CardHeader className="bg-muted/50">
												<div className="flex justify-between items-center">
													<CardTitle className="text-xl">Section {index + 1}</CardTitle>
													<div className="flex items-center gap-1">
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => moveUp(index)}
															disabled={index === 0}
															className="h-8 w-8 p-0"
														>
															<MoveUp className="h-4 w-4" />
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => moveDown(index)}
															disabled={index === fields.length - 1}
															className="h-8 w-8 p-0"
														>
															<MoveDown className="h-4 w-4" />
														</Button>
														<Button
															type="button"
															variant="destructive"
															size="sm"
															onClick={() => remove(index)}
															className="h-8 w-8 p-0"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</CardHeader>
											<CardContent className="pt-6">
												<div className="grid gap-6">
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<FormField
															control={form.control}
															name={`sections.${index}.title`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Section Title</FormLabel>
																	<FormControl>
																		<Input placeholder="Enter section title" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														
														<FormField
															control={form.control}
															name={`sections.${index}.type`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Section Type</FormLabel>
																	<Select 
																		onValueChange={field.onChange} 
																		defaultValue={field.value}
																	>
																		<FormControl>
																			<SelectTrigger>
																				<SelectValue placeholder="Select section type" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			{sectionTypeOptions.map(option => (
																				<SelectItem key={option.value} value={option.value}>
																					{option.label}
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
													
													<FormField
														control={form.control}
														name={`sections.${index}.subtitle`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Subtitle (Optional)</FormLabel>
																<FormControl>
																	<Input placeholder="Enter section subtitle" {...field} value={field.value || ""} />
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													
													<FormField
														control={form.control}
														name={`sections.${index}.content`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Content</FormLabel>
																<FormControl>
																	<Textarea 
																		placeholder="Enter section content" 
																		className="min-h-32"
																		{...field} 
																		value={field.value || ""}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													
													{/* Section Items */}
													{["goals", "features", "installation", "faq"].includes(form.watch(`sections.${index}.type`)) && (
														<div className="border rounded-md p-4">
															<div className="flex justify-between items-center mb-4">
																<h3 className="text-lg font-medium">Section Items</h3>
																<Button
																	type="button"
																	variant="outline"
																	size="sm"
																	onClick={() => addItem(index)}
																	className="h-8 gap-1"
																>
																	<Plus className="h-4 w-4" />
																	Add Item
																</Button>
															</div>
															
															<Accordion type="multiple" className="space-y-2">
																{form.watch(`sections.${index}.items`)?.map((item, itemIndex) => (
																	<AccordionItem key={itemIndex} value={`item-${itemIndex}`} className="border rounded-md">
																		<AccordionTrigger className="px-4">
																			<div className="flex justify-between items-center w-full">
																				<span>{item.title || `Item ${itemIndex + 1}`}</span>
																				<Button
																					type="button"
																					variant="ghost"
																					size="sm"
																					onClick={(e) => {
																						e.stopPropagation();
																						removeItem(index, itemIndex);
																					}}
																					className="h-8 w-8 p-0"
																				>
																					<Trash2 className="h-4 w-4" />
																				</Button>
																			</div>
																		</AccordionTrigger>
																		<AccordionContent className="px-4 pb-4 pt-2">
																			<div className="grid gap-4">
																				<FormField
																					control={form.control}
																					name={`sections.${index}.items.${itemIndex}.title`}
																					render={({ field }) => (
																						<FormItem>
																							<FormLabel>Title</FormLabel>
																							<FormControl>
																								<Input placeholder="Item title" {...field} />
																							</FormControl>
																							<FormMessage />
																						</FormItem>
																					)}
																				/>
																				
																				<FormField
																					control={form.control}
																					name={`sections.${index}.items.${itemIndex}.content`}
																					render={({ field }) => (
																						<FormItem>
																							<FormLabel>Content</FormLabel>
																							<FormControl>
																								<Textarea 
																									placeholder="Item content" 
																									className="min-h-20"
																									{...field} 
																									value={field.value || ""}
																								/>
																							</FormControl>
																							<FormMessage />
																						</FormItem>
																					)}
																				/>
																				
																				<FormField
																					control={form.control}
																					name={`sections.${index}.items.${itemIndex}.icon`}
																					render={({ field }) => (
																						<FormItem>
																							<FormLabel>Icon (Optional)</FormLabel>
																							<FormControl>
																								<Input placeholder="Icon name" {...field} value={field.value || ""} />
																							</FormControl>
																							<FormMessage />
																						</FormItem>
																					)}
																				/>
																			</div>
																		</AccordionContent>
																	</AccordionItem>
																))}
															</Accordion>
															
															{!form.watch(`sections.${index}.items`)?.length && (
																<div className="text-center py-4 text-muted-foreground">
																	No items added yet. Click "Add Item" to create one.
																</div>
															)}
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									))}
									
									<Button
										type="button"
										variant="outline"
										className="w-full gap-2"
										onClick={addSection}
									>
										<Plus className="h-4 w-4" />
										Add New Section
									</Button>
								</div>
								
								<Button type="submit" className="gap-2" disabled={updateMutation.isPending}>
									<Save className="h-4 w-4" />
									Save All Changes
								</Button>
							</form>
						</Form>
					</TabsContent>

					<TabsContent value="seo" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Download Settings</CardTitle>
							</CardHeader>
							<CardContent>
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
										<div className="grid gap-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name="version"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Version</FormLabel>
															<FormControl>
																<Input placeholder="e.g. 1.0.0" {...field} value={field.value || ""} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												
												<FormField
													control={form.control}
													name="downloadId"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Download ID</FormLabel>
															<div className="flex items-center gap-2">
																<FormControl>
																	<Input placeholder="Leave empty to auto-generate" {...field} value={field.value || ""} />
																</FormControl>
																<Button
																	type="button"
																	variant="outline"
																	className="flex-shrink-0"
																	onClick={() => {
																		const randomId = Math.random().toString(36).substring(2, 15);
																		form.setValue('downloadId', randomId);
																	}}
																>
																	Generate
																</Button>
															</div>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											
											<FormField
												control={form.control}
												name="downloadUrl"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Download URL</FormLabel>
														<FormControl>
															<Input placeholder="https://example.com/download/file.apk" {...field} value={field.value || ""} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</form>
								</Form>
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader>
								<CardTitle>Search Engine Optimization</CardTitle>
							</CardHeader>
							<CardContent>
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
										<div className="grid gap-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name="metaTitle"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Meta Title</FormLabel>
															<FormControl>
																<Input placeholder="Enter meta title" {...field} value={field.value || ""} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												
												<FormField
													control={form.control}
													name="metaKeywords"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Meta Keywords</FormLabel>
															<FormControl>
																<Input placeholder="keyword1, keyword2, keyword3" {...field} value={field.value || ""} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											
											<FormField
												control={form.control}
												name="metaDescription"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Meta Description</FormLabel>
														<FormControl>
															<Textarea 
																placeholder="Enter meta description" 
																className="min-h-20"
																{...field} 
																value={field.value || ""}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											
											<div className="border-t pt-6 mt-6">
												<h3 className="text-lg font-medium mb-4">
													Open Graph Data
												</h3>
												
												<div className="grid gap-6">
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<FormField
															control={form.control}
															name="ogTitle"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>OG Title</FormLabel>
																	<FormControl>
																		<Input placeholder="Enter OG title" {...field} value={field.value || ""} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														
														<FormField
															control={form.control}
															name="ogImage"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>OG Image URL</FormLabel>
																	<FormControl>
																		<Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
													
													<FormField
														control={form.control}
														name="ogDescription"
														render={({ field }) => (
															<FormItem>
																<FormLabel>OG Description</FormLabel>
																<FormControl>
																	<Textarea 
																		placeholder="Enter OG description" 
																		className="min-h-20"
																		{...field} 
																		value={field.value || ""}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>
										</div>
										
										<Button type="submit" className="gap-2" disabled={updateMutation.isPending}>
											<Save className="h-4 w-4" />
											Save SEO Settings
										</Button>
									</form>
								</Form>
							</CardContent>
						</Card>
					</TabsContent>
					
					<TabsContent value="translations" className="space-y-6">
						{homepageData && homepageData.id ? (
							<TranslationManager 
								contentType="homepage" 
								contentId={homepageData.id} 
								originalData={{
									...homepageData,
									sections: homepageData.sections || []
								}}
							/>
						) : (
							<div className="text-center py-12 text-muted-foreground">
								<p>Please save the homepage content first before adding translations.</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</MainLayout>
	);
}