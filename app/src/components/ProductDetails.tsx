import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { SafeHTML } from "../lib/safeHTML";
import type { WooCommerceProduct } from "../types/woocommerce";

// Extend window interface for WooCommerce globals
declare global {
	interface Window {
		wc_add_to_cart_params?: {
			wc_ajax_url: string;
		};
		rwl_ajax_params?: {
			ajax_url: string;
			wc_ajax_url: string;
			add_to_cart_nonce: string;
		};
		jQuery?: (selector: string) => {
			trigger: (event: string) => void;
		};
	}
}

// Helper component for SVG icons to keep the main component clean.
const HeartIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<title>Heart icon</title>
		<path
			d="M19.5 12.572c-1.953-2.936-4.5-5.572-7.5-5.572s-5.547 2.636-7.5 5.572c-2.353 3.53-2.353 9.428 0 12.958 2.353 3.53 4.5 5.47 7.5 5.47s5.147-1.94 7.5-5.47c2.353-3.53 2.353-9.428 0-12.958z"
			stroke="none"
			fill="#fde68a"
			opacity="0.1"
		/>
		<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
	</svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<title>Chevron down icon</title>
		<path d="m6 9 6 6 6-6"></path>
	</svg>
);

interface ProductDetailsProps {
	product: WooCommerceProduct;
}

export function ProductDetails({ product }: ProductDetailsProps) {
	// State for interactive elements
	const [quantity, setQuantity] = useState(1);
	const [selectedImage, setSelectedImage] = useState(0);
	const [selectedSize, setSelectedSize] = useState(
		product.weight || "150 جرام",
	);
	const [selectedFragrance, setSelectedFragrance] = useState("مسك");
	const [isWishlisted, setIsWishlisted] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [addToCartMessage, setAddToCartMessage] = useState("");

	// Available options
	const availableSizes = ["150 جرام", "250 جرام", "500 جرام"];
	const availableFragrances = ["مسك", "ورد", "لافندر", "بدون رائحة"];

	// Product image data
	const productImages =
		product.images.length > 0
			? product.images.map((img, index) => ({
					id: `image-${index}`,
					url: img.src,
					alt: img.alt || `Product image ${index + 1}`,
				}))
			: [
					{
						id: "main",
						url: "https://placehold.co/500x500/14534e/FFFFFF?text=Product+Image",
						alt: "Main product view",
					},
				];

	// Handlers for state changes
	const handleQuantityChange = (amount: number) => {
		setQuantity((prev) => Math.max(1, prev + amount));
	};

	const handleThumbnailClick = (index: number) => {
		setSelectedImage(index);
	};

	const handleWishlist = async () => {
		try {
			if (typeof window !== "undefined" && window.rwl_ajax_params) {
				const response = await fetch(window.rwl_ajax_params.ajax_url, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						action: "rwl_toggle_wishlist",
						product_id: product.id.toString(),
						nonce: "wishlist_toggle", // WordPress will handle nonce verification
					}),
				});

				const result = await response.json();
				if (result.success) {
					setIsWishlisted(result.data.is_in_wishlist);
					console.log(`${result.data.action} wishlist:`, product.id);
				}
			} else {
				// Fallback for non-WordPress environments
				setIsWishlisted(!isWishlisted);
				console.log(
					`${isWishlisted ? "Removed from" : "Added to"} wishlist:`,
					product.id,
				);
			}
		} catch (error) {
			console.error("Error toggling wishlist:", error);
			// Fallback to local state change
			setIsWishlisted(!isWishlisted);
		}
	};

	const handleAddToCart = async () => {
		setIsAddingToCart(true);
		setAddToCartMessage("");

		try {
			// Use our custom WordPress AJAX endpoint
			if (typeof window !== "undefined" && window.rwl_ajax_params) {
				const response = await fetch(window.rwl_ajax_params.ajax_url, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						action: "rwl_add_to_cart",
						product_id: product.id.toString(),
						quantity: quantity.toString(),
						size: selectedSize,
						fragrance: selectedFragrance,
						nonce: window.rwl_ajax_params.add_to_cart_nonce,
					}),
				});

				const result = await response.json();

				if (result.success) {
					setAddToCartMessage("تم إضافة المنتج إلى السلة بنجاح!");

					// Trigger WooCommerce cart update event
					if (window.jQuery) {
						window.jQuery("body").trigger("wc_fragment_refresh");
					}

					console.log("Added to cart successfully:", result.data);
				} else {
					throw new Error(result.data || "Failed to add to cart");
				}
			} else {
				// Fallback: Use WooCommerce AJAX if available
				if (window.wc_add_to_cart_params) {
					const response = await fetch(
						window.wc_add_to_cart_params.wc_ajax_url.replace(
							"%%endpoint%%",
							"add_to_cart",
						),
						{
							method: "POST",
							headers: {
								"Content-Type": "application/x-www-form-urlencoded",
							},
							body: new URLSearchParams({
								product_id: product.id.toString(),
								quantity: quantity.toString(),
								size: selectedSize,
								fragrance: selectedFragrance,
							}),
						},
					);

					const result = await response.json();

					if (result.error) {
						throw new Error(result.error);
					}

					setAddToCartMessage("تم إضافة المنتج إلى السلة بنجاح!");

					// Trigger WooCommerce cart update event
					if (window.jQuery) {
						window.jQuery("body").trigger("wc_fragment_refresh");
					}
				} else {
					// Final fallback: redirect to WooCommerce add to cart URL
					const addToCartUrl = new URL(window.location.origin + "/");
					addToCartUrl.searchParams.set("add-to-cart", product.id.toString());
					addToCartUrl.searchParams.set("quantity", quantity.toString());

					window.location.href = addToCartUrl.toString();
				}
			}

			console.log("Add to cart completed:", {
				product_id: product.id,
				quantity,
				size: selectedSize,
				fragrance: selectedFragrance,
			});
		} catch (error) {
			console.error("Error adding to cart:", error);
			setAddToCartMessage("حدث خطأ أثناء إضافة المنتج إلى السلة");
		} finally {
			setIsAddingToCart(false);

			// Clear message after 3 seconds
			setTimeout(() => {
				setAddToCartMessage("");
			}, 3000);
		}
	};

	const formatPrice = (price: string) => {
		// Convert to Egyptian Pounds if needed
		const numPrice = parseFloat(price);
		return numPrice ? `${numPrice.toFixed(0)} ج.م` : "غير محدد";
	};

	// Calculate total price based on selected options
	const calculateTotalPrice = () => {
		let basePrice = parseFloat(
			product.on_sale ? product.sale_price : product.regular_price,
		);

		// Add size premium
		if (selectedSize === "250 جرام") {
			basePrice *= 1.5;
		} else if (selectedSize === "500 جرام") {
			basePrice *= 2.5;
		}

		return (basePrice * quantity).toFixed(0);
	};

	return (
		<>
			{/* This component is designed to run in an environment where Tailwind CSS is available.
			  The font 'Cairo' is imported via a link tag for better Arabic character support.
			*/}
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
			<link
				href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap"
				rel="stylesheet"
			/>

			<div
				style={{ fontFamily: "'Cairo', sans-serif" }}
				className="antialiased bg-gray-50 text-gray-800"
			>
				<div className="container mx-auto px-4 py-8">
					<main className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto">
						<div className="grid grid-cols-1 lg:grid-cols-2">
							{/* Left Column: Product Imagery */}
							<div className="p-6 sm:p-8 bg-gray-100 flex flex-col items-center justify-center w-full overflow-scroll">
								<div className="relative h-96 w-96 rounded-xl overflow-hidden flex justify-center items-center">
									<img
										src={productImages[selectedImage].url}
										alt={productImages[selectedImage].alt}
										className="rounded-lg object-contain transition-all duration-300 ease-in-out"
										key={selectedImage} // Force re-render on image change for animation
									/>
									<div className="absolute inset-0 bg-teal-800 opacity-20 rounded-full scale-110 blur-3xl -z-10"></div>
								</div>

								{/* Thumbnail Gallery */}
								{productImages.length > 1 && (
									<div className="flex items-center justify-start gap-4 mt-8 w-96 h-32 overflow-x-auto px-2">
										{productImages.map((image, index) => (
											<button
												key={image.id}
												type="button"
												onClick={() => handleThumbnailClick(index)}
												className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${selectedImage === index ? "border-teal-500 scale-110" : "border-transparent hover:border-gray-300"}`}
											>
												<img
													src={image.url}
													alt={image.alt}
													className="w-full h-full object-contain"
												/>
											</button>
										))}
									</div>
								)}
								{/* Image indicator dots */}
								{productImages.length > 1 && (
									<div className="flex justify-center gap-2 mt-6">
										{productImages.map((image, index) => (
											<div
												key={`dot-${image.id}-${index}`}
												className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedImage === index ? "bg-teal-600 w-6" : "bg-gray-300"}`}
											></div>
										))}
									</div>
								)}
							</div>

							{/* Right Column: Product Details */}
							<div dir="rtl" className="p-6 sm:p-10 flex flex-col">
								<div className="flex justify-between items-start mb-4">
									<h1 className="text-3xl sm:text-4xl font-black text-teal-900 leading-tight">
										{product.name}
									</h1>
									<button
										type="button"
										onClick={handleWishlist}
										className={`p-2 rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${
											isWishlisted
												? "text-red-500 bg-red-100"
												: "text-gray-400 hover:text-red-500 hover:bg-red-100"
										}`}
									>
										<HeartIcon className="w-7 h-7" />
									</button>
								</div>

								<div className="text-gray-500 mb-6">مدة الصلاحية 12 شهر</div>

								{/* Add to Cart Message */}
								{addToCartMessage && (
									<div
										className={`mb-4 p-3 rounded-lg text-center ${
											addToCartMessage.includes("خطأ")
												? "bg-red-100 text-red-700 border border-red-200"
												: "bg-green-100 text-green-700 border border-green-200"
										}`}
									>
										{addToCartMessage}
									</div>
								)}

								{/* Short Description */}
								{product.short_description && (
									<div className="mb-6">
										<SafeHTML
											html={product.short_description}
											className="text-gray-700 prose prose-sm max-w-none"
										/>
									</div>
								)}

								<div className="space-y-4 text-gray-700">
									<div>
										<h2 className="font-bold text-lg mb-2 text-teal-800">
											المكونات الأساسية:
										</h2>
										<ul className="list-disc list-inside space-y-1 pr-4">
											<li>80% زبدة شيا خام</li>
											<li>
												4 زيوت بنسبة 20%: زيت جوز الهند، زيت الجوجوبا، زيت
												الأفوكادو، زيت اللوز الحلو
											</li>
										</ul>
									</div>
									<div>
										<h2 className="font-bold text-lg mb-1 text-teal-800">
											المصدر:
										</h2>
										<p>غانا (من أكبر 5 دول في إنتاج زبدة الشيا في العالم)</p>
									</div>
								</div>

								<div className="my-8 space-y-4">
									{/* Categories as custom styled select-like components */}
									{product.categories.length > 0 && (
										<div className="flex justify-between items-center bg-amber-50/50 p-3 rounded-lg border border-amber-100">
											<span className="font-bold text-gray-600">التصنيف</span>
											<div className="flex items-center gap-2 text-teal-800 font-semibold">
												{product.categories[0].name}
												<ChevronDownIcon className="text-gray-400" />
											</div>
										</div>
									)}

									{/* Interactive Size Selector */}
									<div className="relative">
										<select
											value={selectedSize}
											onChange={(e) => setSelectedSize(e.target.value)}
											className="w-full appearance-none bg-amber-50/50 p-3 rounded-lg border border-amber-100 text-teal-800 font-semibold cursor-pointer hover:bg-amber-100/50 transition-colors"
										>
											{availableSizes.map((size) => (
												<option key={size} value={size}>
													{size}
												</option>
											))}
										</select>
										<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
											<ChevronDownIcon className="text-gray-400" />
										</div>
										<span className="absolute right-3 top-1/2 transform -translate-y-1/2 font-bold text-gray-600 pointer-events-none">
											الحجم
										</span>
									</div>

									{/* Interactive Fragrance Selector */}
									<div className="relative">
										<select
											value={selectedFragrance}
											onChange={(e) => setSelectedFragrance(e.target.value)}
											className="w-full appearance-none bg-amber-50/50 p-3 rounded-lg border border-amber-100 text-teal-800 font-semibold cursor-pointer hover:bg-amber-100/50 transition-colors"
										>
											{availableFragrances.map((fragrance) => (
												<option key={fragrance} value={fragrance}>
													{fragrance}
												</option>
											))}
										</select>
										<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
											<ChevronDownIcon className="text-gray-400" />
										</div>
										<span className="absolute right-3 top-1/2 transform -translate-y-1/2 font-bold text-gray-600 pointer-events-none">
											الروايح المتاحة
										</span>
									</div>
									<p className="text-xs text-gray-500 pr-1">
										(الروايح من مواد طبيعية ١٠٠٪)
									</p>
								</div>

								<div className="mt-auto pt-8">
									<div className="flex justify-between items-center mb-6">
										<div className="flex items-center border border-gray-200 rounded-lg">
											<button
												type="button"
												onClick={() => handleQuantityChange(1)}
												className="px-4 py-2 text-xl font-bold text-teal-600 hover:bg-gray-100 rounded-r-md transition"
											>
												+
											</button>
											<span className="px-4 py-2 text-xl font-bold">
												{quantity}
											</span>
											<button
												type="button"
												onClick={() => handleQuantityChange(-1)}
												className="px-4 py-2 text-xl font-bold text-teal-600 hover:bg-gray-100 rounded-l-md transition"
											>
												-
											</button>
										</div>
										<div className="text-left">
											<span className="text-4xl font-black text-teal-600">
												{calculateTotalPrice()}
											</span>
											<span className="text-lg font-bold text-gray-500 ml-1">
												ج.م
											</span>
											{quantity > 1 && (
												<div className="text-sm text-gray-500">
													(
													{formatPrice(
														product.on_sale
															? product.sale_price
															: product.regular_price,
													)}{" "}
													× {quantity})
												</div>
											)}
										</div>
									</div>

									{product.purchasable &&
									product.stock_status !== "outofstock" ? (
										<button
											type="button"
											onClick={handleAddToCart}
											disabled={isAddingToCart}
											className={`w-full font-bold text-lg py-4 rounded-xl shadow-lg transition-all duration-300 ${
												isAddingToCart
													? "bg-gray-400 text-gray-200 cursor-not-allowed"
													: "bg-teal-600 text-white shadow-teal-500/20 hover:bg-teal-700 transform hover:-translate-y-1"
											}`}
										>
											{isAddingToCart ? "جاري الإضافة..." : "اشتري دلوقتي"}
										</button>
									) : (
										<button
											type="button"
											disabled
											className="w-full bg-gray-400 text-gray-200 font-bold text-lg py-4 rounded-xl cursor-not-allowed"
										>
											غير متوفر
										</button>
									)}

									{/* Stock Status */}
									<div className="flex items-center justify-center space-x-2 mt-4">
										<div
											className={`w-3 h-3 rounded-full ${
												product.stock_status === "instock"
													? "bg-green-500"
													: product.stock_status === "onbackorder"
														? "bg-yellow-500"
														: "bg-red-500"
											}`}
										/>
										<span className="text-sm font-medium">
											{product.stock_status === "instock"
												? "متوفر"
												: product.stock_status === "onbackorder"
													? "طلب مسبق"
													: "غير متوفر"}
										</span>
										{product.stock_quantity && (
											<span className="text-xs text-gray-500">
												(متبقي {product.stock_quantity})
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					</main>
				</div>
			</div>
		</>
	);
}

export function ProductDetailsSkeleton() {
	return (
		<div className="max-w-7xl mx-auto p-6 bg-white">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="space-y-4">
					<Skeleton className="aspect-square w-full rounded-lg" />{" "}
					<div className="flex space-x-2">
						{[...Array(4)].map((_, i) => (
							<Skeleton
								key={`skeleton-${i + 1}`}
								className="w-20 h-20 rounded-md"
							/>
						))}
					</div>
				</div>

				<div className="space-y-6">
					<div>
						<Skeleton className="h-8 w-3/4 mb-2" />
						<Skeleton className="h-6 w-1/2 mb-4" />
					</div>

					<Skeleton className="h-10 w-1/3" />
					<Skeleton className="h-6 w-1/4" />
					<Skeleton className="h-20 w-full" />

					<div className="space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>

					<div className="flex space-x-3">
						<Skeleton className="h-12 flex-1" />
						<Skeleton className="h-12 w-12" />
					</div>
				</div>
			</div>
		</div>
	);
}
