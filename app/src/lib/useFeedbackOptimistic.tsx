import { useOptimistic } from "react";
import db from "./db";

export interface Feedback {
	id: number;
	feedback: string;
	email: string | null;
}

export function useFeedbackOptimistic() {
	// Add feedback with optimistic updates
	const addFeedbackOptimistically = (
		currentFeedbacks: Feedback[],
		newFeedback: { feedback: string; email: string | null },
	) => {
		const optimisticId = Date.now(); // Temporary ID for optimistic update

		// Create an optimistic feedback object
		const optimisticFeedback: Feedback = {
			id: optimisticId,
			feedback: newFeedback.feedback,
			email: newFeedback.email,
		};

		// Return optimistic state
		return [...currentFeedbacks, optimisticFeedback];
	};

	// Delete feedback with optimistic updates
	const deleteFeedbackOptimistically = (
		currentFeedbacks: Feedback[],
		idToDelete: number,
	) => {
		// Return optimistic state after deletion
		return currentFeedbacks.filter((feedback) => feedback.id !== idToDelete);
	};

	// Actual database operations
	const addFeedback = async (
		feedback: string,
		email: string | null,
	): Promise<Feedback> => {
		return db.addFeedback(feedback, email) as Feedback;
	};

	const deleteFeedback = async (id: number): Promise<number> => {
		return db.deleteFeedback(id);
	};

	const getAllFeedback = (): Feedback[] => {
		return db.getAllFeedback();
	};

	const feedbacks = getAllFeedback();

	return {
		// Optimistic update functions
		addFeedbackOptimistically,
		deleteFeedbackOptimistically,

		// Database operations
		addFeedback,
		deleteFeedback,
		getAllFeedback,
		feedbacks,

		// Hook factory for optimistic updates
		useOptimisticAdd: (feedbacks: Feedback[]) => {
			return useOptimistic(feedbacks, addFeedbackOptimistically);
		},

		useOptimisticDelete: (feedbacks: Feedback[]) => {
			return useOptimistic(feedbacks, deleteFeedbackOptimistically);
		},
	};
}
