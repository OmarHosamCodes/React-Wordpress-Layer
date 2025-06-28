import { useEffect, useState } from "react";
import type { ProductPageData, WooCommerceProduct } from "../types/woocommerce";
import { ProductDetails, ProductDetailsSkeleton } from "./ProductDetails";

declare global {
	interface Window {
		rwlProductData?: ProductPageData;
		wc_single_product_params?: {
			product_id: string;
		};
	}
}

export function ProductPageApp() {
	const [productData, setProductData] = useState<ProductPageData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Check if product data is available from WordPress
		if (window.rwlProductData) {
			setProductData(window.rwlProductData);
			setLoading(false);
		} else {
			// Fallback: try to detect if we're on a product page and fetch data
			const detectProductPage = async () => {
				try {
					// Check if we're on a WooCommerce product page
					const isProductPage =
						document.body.classList.contains("single-product") ||
						document.body.classList.contains("woocommerce-page") ||
						window.location.pathname.includes("/product/");

					if (!isProductPage) {
						setProductData({ isProductPage: false, product: null });
						setLoading(false);
						return;
					}

					// Try to get product ID from various sources
					let productId: number | null = null;

					// Method 1: Check for product ID in body classes
					const bodyClasses = document.body.className;
					const productIdMatch = bodyClasses.match(/postid-(\d+)/);
					if (productIdMatch) {
						productId = parseInt(productIdMatch[1]);
					}

					// Method 2: Check for product data in script tags
					if (!productId) {
						const scripts = document.querySelectorAll(
							'script[type="application/ld+json"]',
						);
						for (const script of Array.from(scripts)) {
							try {
								const data = JSON.parse(script.textContent || "");
								if (data["@type"] === "Product" && data.productID) {
									productId = parseInt(data.productID);
									break;
								}
							} catch {
								// Continue searching
							}
						}
					}

					// Method 3: Check for WooCommerce variables
					if (!productId && window.wc_single_product_params?.product_id) {
						productId = parseInt(window.wc_single_product_params.product_id);
					}

					if (productId) {
						// Fetch product data from REST API
						const response = await fetch(
							`/wp-json/wc/v3/products/${productId}`,
							{
								headers: {
									"Content-Type": "application/json",
								},
							},
						);

						if (response.ok) {
							const product: WooCommerceProduct = await response.json();
							setProductData({ isProductPage: true, product });
						} else {
							throw new Error("Failed to fetch product data");
						}
					} else {
						setProductData({ isProductPage: true, product: null });
					}
				} catch (err) {
					console.error("Error detecting product page:", err);
					setError(
						err instanceof Error ? err.message : "Unknown error occurred",
					);
				} finally {
					setLoading(false);
				}
			};

			detectProductPage();
		}
	}, []);

	if (loading) {
		return <ProductDetailsSkeleton />;
	}

	if (error) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<h3 className="text-red-800 font-medium">Error loading product</h3>
					<p className="text-red-600 text-sm mt-1">{error}</p>
				</div>
			</div>
		);
	}

	if (!productData?.isProductPage || !productData.product) {
		return null; // Don't render anything if not on a product page or no product data
	}

	return <ProductDetails product={productData.product} />;
}
