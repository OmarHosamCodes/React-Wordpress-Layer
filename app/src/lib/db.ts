interface Feedback {
	id: number;
	feedback: string;
	email: string | null;
}

// Simple localStorage-based database
const db = {
	// Initialize the database if needed
	init() {
		if (!localStorage.getItem("feedback")) {
			localStorage.setItem("feedback", JSON.stringify([]));
		}
	},

	// Add a new feedback entry
	addFeedback(feedback: string, email: string | null) {
		const feedbacks: Feedback[] = this.getAllFeedback();
		const id =
			feedbacks.length > 0 ? Math.max(...feedbacks.map((f) => f.id)) + 1 : 1;

		feedbacks.push({
			id,
			feedback,
			email,
		});

		localStorage.setItem("feedback", JSON.stringify(feedbacks));
		return { id, feedback, email };
	},

	// Delete a feedback entry by id
	deleteFeedback(id: number) {
		const feedbacks: Feedback[] = this.getAllFeedback();
		const newFeedbacks = feedbacks.filter((feedback) => feedback.id !== id);
		localStorage.setItem("feedback", JSON.stringify(newFeedbacks));
		return id;
	},

	// Get all feedback entries
	getAllFeedback(): Feedback[] {
		return JSON.parse(localStorage.getItem("feedback") || "[]");
	},

	// Compatibility layer for existing code
	prepare(query: string) {
		return {
			run: (feedback: string, email: string | null) => {
				this.addFeedback(feedback, email);
			},
		};
	},

	query(query: string) {
		return {
			all: () => {
				return this.getAllFeedback();
			},
		};
	},
};

// Initialize the database
if (typeof window !== "undefined") {
	db.init();
}

export default db;
