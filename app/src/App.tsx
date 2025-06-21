import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField } from "./components/ui/form";
import { useFeedbackOptimistic } from "./lib/useFeedbackOptimistic";

// Define a schema for the form data
const formSchema = z.object({
	feedback: z.string().min(1, "Feedback is required"),
	email: z.string().optional(),
});

// Define a type for the form data
type FormData = z.infer<typeof formSchema>;

export function App() {
	const { addFeedback } = useFeedbackOptimistic();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			feedback: "",
			email: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		try {
			await addFeedback(data.feedback, data.email);
			setIsSuccess(true);
			form.reset();
		} catch (error) {
			console.error("Error submitting feedback:", error);
		} finally {
			setIsSubmitting(false);
			setIsDialogOpen(false);
		}
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger className="fixed bottom-0 left-0 m-5">
				<Button>Open Dialog</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Send Your Feedback</DialogTitle>
					<DialogDescription>
						We appreciate your feedback! Please let us know your thoughts.
					</DialogDescription>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="feedback"
								render={({ field }) => (
									<>
										<label htmlFor="feedback" className="block mb-2">
											Your Feedback:
										</label>
										<textarea
											id="feedback"
											{...field}
											rows={4}
											className="w-full p-2 border border-gray-300 rounded"
											required
										/>
									</>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<>
										<label htmlFor="email" className="block mb-2">
											Your Email (optional):
										</label>
										<input
											type="email"
											id="email"
											{...field}
											className="w-full p-2 border border-gray-300 rounded"
										/>
									</>
								)}
							/>
							{isSuccess && (
								<div className="text-green-600 font-medium">
									Feedback submitted successfully!
								</div>
							)}
							<DialogFooter>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Submitting..." : "Submit Feedback"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

export default App;
