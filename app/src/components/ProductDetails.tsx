import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Heart,
	RotateCcw,
	Shield,
	ShoppingCart,
	Star,
	Truck,
} from "lucide-react";
import { useState } from "react";
import { SafeHTML } from "../lib/safeHTML";
import type { WooCommerceProduct } from "../types/woocommerce";

interface ProductDetailsProps {
	product: WooCommerceProduct;
}

export function ProductDetails({ product }: ProductDetailsProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [isWishlisted, setIsWishlisted] = useState(false);

	const formatPrice = (price: string) => {
		return price ? `$${parseFloat(price).toFixed(2)}` : "N/A";
	};

	const renderStars = (rating: number) => {
		const stars = [];
		for (let i = 0; i < 5; i++) {
			stars.push(
				<Star
					key={`rating-${rating}-star-${i}`}
					className={`w-4 h-4 ${
						i < Math.floor(rating)
							? "fill-yellow-400 text-yellow-400"
							: "text-gray-300"
					}`}
				/>,
			);
		}
		return stars;
	};

	const handleAddToCart = () => {
		// This would integrate with WooCommerce's add to cart functionality
		console.log(`Adding ${quantity} of product ${product.id} to cart`);
	};

	const handleWishlist = () => {
		setIsWishlisted(!isWishlisted);
	};

	return (
		<div className="max-w-7xl mx-auto p-6 bg-white">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Product Images */}
				<div className="space-y-4">
					<div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
						{product.images.length > 0 ? (
							<img
								src={
									product.images[selectedImageIndex]?.src ||
									product.images[0].src
								}
								alt={product.images[selectedImageIndex]?.alt || product.name}
								className="w-full h-full object-cover transition-transform hover:scale-105"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-gray-400">
								No image available
							</div>
						)}
					</div>

					{/* Thumbnail images */}
					{product.images.length > 1 && (
						<div className="flex space-x-2 overflow-x-auto">
							{product.images.map((image, index) => (
								<button
									key={image.id}
									type="button"
									onClick={() => setSelectedImageIndex(index)}
									className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
										index === selectedImageIndex
											? "border-blue-500"
											: "border-gray-200"
									}`}
								>
									<img
										src={image.src}
										alt={image.alt}
										className="w-full h-full object-cover"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Product Information */}
				<div className="space-y-6">
					{/* Product Title and Rating */}
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{product.name}
						</h1>
						<div className="flex items-center space-x-2 mb-4">
							<div className="flex items-center">
								{renderStars(parseFloat(product.average_rating))}
							</div>
							<span className="text-sm text-gray-600">
								({product.rating_count} reviews)
							</span>
							{product.featured && (
								<Badge variant="secondary" className="ml-2">
									Featured
								</Badge>
							)}
						</div>
					</div>

					{/* Price */}
					<div className="space-y-2">
						<div className="flex items-center space-x-3">
							{product.on_sale ? (
								<>
									<span className="text-3xl font-bold text-red-600">
										{formatPrice(product.sale_price)}
									</span>
									<span className="text-xl text-gray-500 line-through">
										{formatPrice(product.regular_price)}
									</span>
									<Badge variant="destructive">Sale</Badge>
								</>
							) : (
								<span className="text-3xl font-bold text-gray-900">
									{formatPrice(product.regular_price)}
								</span>
							)}
						</div>
						{product.price_html && (
							<SafeHTML
								html={product.price_html}
								className="text-sm text-gray-600"
							/>
						)}
					</div>

					{/* Stock Status */}
					<div className="flex items-center space-x-2">
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
								? "In Stock"
								: product.stock_status === "onbackorder"
									? "On Backorder"
									: "Out of Stock"}
						</span>
						{product.stock_quantity && (
							<span className="text-sm text-gray-600">
								({product.stock_quantity} available)
							</span>
						)}
					</div>

					{/* Short Description */}
					{product.short_description && (
						<SafeHTML
							html={product.short_description}
							className="text-gray-700 prose prose-sm max-w-none"
						/>
					)}

					{/* Categories and Tags */}
					<div className="space-y-3">
						{product.categories.length > 0 && (
							<div>
								<span className="text-sm font-medium text-gray-900 mr-2">
									Categories:
								</span>
								<div className="inline-flex flex-wrap gap-1">
									{product.categories.map((category) => (
										<Badge key={category.id} variant="outline">
											{category.name}
										</Badge>
									))}
								</div>
							</div>
						)}

						{product.tags.length > 0 && (
							<div>
								<span className="text-sm font-medium text-gray-900 mr-2">
									Tags:
								</span>
								<div className="inline-flex flex-wrap gap-1">
									{product.tags.map((tag) => (
										<Badge key={tag.id} variant="secondary">
											{tag.name}
										</Badge>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Add to Cart Section */}
					{product.purchasable && product.stock_status !== "outofstock" && (
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<div className="flex items-center border rounded-md">
									<button
										type="button"
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										className="px-3 py-2 hover:bg-gray-100 transition-colors"
									>
										-
									</button>
									<input
										type="number"
										value={quantity}
										onChange={(e) =>
											setQuantity(Math.max(1, parseInt(e.target.value) || 1))
										}
										className="w-16 text-center py-2 border-x"
										min="1"
									/>
									<button
										type="button"
										onClick={() => setQuantity(quantity + 1)}
										className="px-3 py-2 hover:bg-gray-100 transition-colors"
									>
										+
									</button>
								</div>
							</div>

							<div className="flex space-x-3">
								<Button
									onClick={handleAddToCart}
									className="flex-1 h-12 text-lg font-medium"
									size="lg"
								>
									<ShoppingCart className="w-5 h-5 mr-2" />
									Add to Cart
								</Button>
								<Button
									variant="outline"
									size="lg"
									onClick={handleWishlist}
									className={`h-12 px-4 ${isWishlisted ? "text-red-500" : ""}`}
								>
									<Heart
										className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
									/>
								</Button>
							</div>
						</div>
					)}

					{/* Product Features */}
					<div className="border-t pt-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="flex items-center space-x-2 text-sm text-gray-600">
								<Truck className="w-4 h-4" />
								<span>Free shipping</span>
							</div>
							<div className="flex items-center space-x-2 text-sm text-gray-600">
								<Shield className="w-4 h-4" />
								<span>Secure payment</span>
							</div>
							<div className="flex items-center space-x-2 text-sm text-gray-600">
								<RotateCcw className="w-4 h-4" />
								<span>30-day returns</span>
							</div>
						</div>
					</div>

					{/* Additional Information */}
					{(product.sku ||
						product.weight ||
						Object.keys(product.dimensions).some(
							(key) =>
								product.dimensions[key as keyof typeof product.dimensions],
						)) && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Product Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								{product.sku && (
									<div className="flex justify-between">
										<span className="text-gray-600">SKU:</span>
										<span className="font-medium">{product.sku}</span>
									</div>
								)}
								{product.weight && (
									<div className="flex justify-between">
										<span className="text-gray-600">Weight:</span>
										<span className="font-medium">{product.weight}</span>
									</div>
								)}
								{(product.dimensions.length ||
									product.dimensions.width ||
									product.dimensions.height) && (
									<div className="flex justify-between">
										<span className="text-gray-600">Dimensions:</span>
										<span className="font-medium">
											{[
												product.dimensions.length,
												product.dimensions.width,
												product.dimensions.height,
											]
												.filter(Boolean)
												.join(" × ")}
										</span>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</div>

			{/* Full Description */}
			{product.description && (
				<div className="mt-12">
					<Card>
						<CardHeader>
							<CardTitle>Description</CardTitle>
						</CardHeader>
						<CardContent>
							<SafeHTML
								html={product.description}
								className="prose prose-gray max-w-none"
							/>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Product Attributes */}
			{product.attributes.length > 0 && (
				<div className="mt-8">
					<Card>
						<CardHeader>
							<CardTitle>Specifications</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{product.attributes.map((attribute) => (
									<div
										key={attribute.id}
										className="flex justify-between border-b pb-2"
									>
										<span className="font-medium text-gray-900">
											{attribute.name}:
										</span>
										<span className="text-gray-600">
											{attribute.options.join(", ")}
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
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
