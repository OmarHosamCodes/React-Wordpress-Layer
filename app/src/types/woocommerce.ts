export interface WooCommerceProduct {
	id: number;
	name: string;
	slug: string;
	permalink: string;
	type: "simple" | "grouped" | "external" | "variable";
	status: "publish" | "draft" | "pending" | "private";
	featured: boolean;
	catalog_visibility: "visible" | "catalog" | "search" | "hidden";
	description: string;
	short_description: string;
	sku: string;
	price: string;
	regular_price: string;
	sale_price: string;
	date_on_sale_from: string | null;
	date_on_sale_to: string | null;
	price_html: string;
	on_sale: boolean;
	purchasable: boolean;
	total_sales: number;
	virtual: boolean;
	downloadable: boolean;
	downloads: WooCommerceProductDownload[];
	download_limit: number;
	download_expiry: number;
	external_url: string;
	button_text: string;
	tax_status: "taxable" | "shipping" | "none";
	tax_class: string;
	manage_stock: boolean;
	stock_quantity: number | null;
	stock_status: "instock" | "outofstock" | "onbackorder";
	backorders: "no" | "notify" | "yes";
	backorders_allowed: boolean;
	backordered: boolean;
	sold_individually: boolean;
	weight: string;
	dimensions: WooCommerceProductDimensions;
	shipping_required: boolean;
	shipping_taxable: boolean;
	shipping_class: string;
	shipping_class_id: number;
	reviews_allowed: boolean;
	average_rating: string;
	rating_count: number;
	related_ids: number[];
	upsell_ids: number[];
	cross_sell_ids: number[];
	parent_id: number;
	purchase_note: string;
	categories: WooCommerceProductCategory[];
	tags: WooCommerceProductTag[];
	images: WooCommerceProductImage[];
	attributes: WooCommerceProductAttribute[];
	default_attributes: WooCommerceProductDefaultAttribute[];
	variations: number[];
	grouped_products: number[];
	menu_order: number;
	meta_data: WooCommerceProductMetaData[];
	date_created: string;
	date_created_gmt: string;
	date_modified: string;
	date_modified_gmt: string;
}

export interface WooCommerceProductDownload {
	id: string;
	name: string;
	file: string;
}

export interface WooCommerceProductDimensions {
	length: string;
	width: string;
	height: string;
}

export interface WooCommerceProductCategory {
	id: number;
	name: string;
	slug: string;
}

export interface WooCommerceProductTag {
	id: number;
	name: string;
	slug: string;
}

export interface WooCommerceProductImage {
	id: number;
	date_created: string;
	date_created_gmt: string;
	date_modified: string;
	date_modified_gmt: string;
	src: string;
	name: string;
	alt: string;
	position: number;
}

export interface WooCommerceProductAttribute {
	id: number;
	name: string;
	position: number;
	visible: boolean;
	variation: boolean;
	options: string[];
}

export interface WooCommerceProductDefaultAttribute {
	id: number;
	name: string;
	option: string;
}

export interface WooCommerceProductMetaData {
	id: number;
	key: string;
	value: string | number | boolean | object;
}

export interface ProductPageData {
	isProductPage: boolean;
	product: WooCommerceProduct | null;
}
