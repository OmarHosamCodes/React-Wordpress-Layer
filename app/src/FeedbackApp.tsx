import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useFeedbackOptimistic } from "./lib/useFeedbackOptimistic";

interface Feedback {
	id: number;
	feedback: string;
	email: string | null;
}

// Form validation schema
const feedbackFormSchema = z.object({
	feedback: z
		.string()
		.min(3, { message: "Feedback must be at least 3 characters" }),
	email: z
		.string()
		.email({ message: "Please enter a valid email" })
		.optional()
		.nullable(),
});

export function FeedbackApp() {
	const { getAllFeedback, addFeedback, deleteFeedback } =
		useFeedbackOptimistic();
	const [error, setError] = useState<string | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const feedbacks = getAllFeedback();

	// Form setup
	const form = useForm<z.infer<typeof feedbackFormSchema>>({
		resolver: zodResolver(feedbackFormSchema),
		defaultValues: {
			feedback: "",
			email: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof feedbackFormSchema>) => {
		try {
			await addFeedback(data.feedback, data.email);
			form.reset();
			setIsDialogOpen(false);
		} catch (err) {
			setError("Failed to add feedback");
		}
	};

	if (error)
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<div>
						<CardTitle>Feedbacks</CardTitle>
						<CardDescription>User submitted feedback</CardDescription>
					</div>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button className="gap-2">
								<Plus className="h-4 w-4" />
								Add Feedback
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Feedback</DialogTitle>
								<DialogDescription>
									Share your thoughts with us. Your feedback is valuable!
								</DialogDescription>
							</DialogHeader>

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="feedback"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Feedback</FormLabel>
												<FormControl>
													<Input placeholder="Your feedback" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email (optional)</FormLabel>
												<FormControl>
													<Input
														placeholder="your@email.com"
														{...field}
														value={field.value || ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<DialogFooter>
										<Button type="submit">Submit Feedback</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent>
					{feedbacks.length === 0 ? (
						<p className="text-muted-foreground">No feedbacks yet.</p>
					) : (
						<div className="space-y-4">
							{feedbacks.map((feedback) => (
								<Card key={feedback.id}>
									<CardContent className="pt-4">
										<p className="mb-2">{feedback.feedback}</p>
										{feedback.email && (
											<p className="text-sm text-muted-foreground">
												From: {feedback.email}
											</p>
										)}
									</CardContent>
									<CardFooter className="flex justify-end pt-0">
										<Button
											variant="destructive"
											size="sm"
											className="gap-1"
											onClick={() => deleteFeedback(feedback.id)}
										>
											<Trash2 className="h-4 w-4" />
											Delete
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
