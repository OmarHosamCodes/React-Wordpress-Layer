import { createElement } from "react";

// Simple HTML sanitizer for product content
export function createSafeHTML(html: string): { __html: string } {
	// In a production environment, you should use a proper HTML sanitizer like DOMPurify
	// For now, we'll create a basic version that handles common WooCommerce HTML
	const sanitized = html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
		.replace(/javascript:/gi, "") // Remove javascript: links
		.replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
		.replace(/on\w+='[^']*'/gi, ""); // Remove event handlers

	return { __html: sanitized };
}

interface SafeHTMLProps {
	html: string;
	className?: string;
	tag?: string;
}

// eslint-disable-next-line react/no-danger
export function SafeHTML({ html, className, tag = "div" }: SafeHTMLProps) {
	return createElement(tag, {
		className,
		dangerouslySetInnerHTML: createSafeHTML(html),
	});
}
