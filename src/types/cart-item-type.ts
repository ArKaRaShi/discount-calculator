import { ProductCategory } from "src/constants/product-constant";

export type CartItem = {
	name: string;
	unitPrice: number;
	quantity: number;
	productCategory: ProductCategory;
};
