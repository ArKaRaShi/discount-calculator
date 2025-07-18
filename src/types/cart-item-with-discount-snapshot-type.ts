import { DiscountMechanism } from "src/constants/discount-constant";
import { CartItem } from "./cart-item-type";

export type CartItemWithDiscountSnapshot = CartItem & {
	// The total price before applying any discounts, unitPrice * quantity
	subtotal: number;

	// The total price after applying all discounts
	discountedSubtotal: number;

	// For tracking applied discounts, debugging purposes
	appliedDiscounts: {
		mechanism: DiscountMechanism;
        amount: number; 
	}[];
};
