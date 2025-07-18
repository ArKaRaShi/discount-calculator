import { CartItem } from "../cart-item-type";
import { Discount } from "../discount-type";

export type ComputeDiscountRequest = {
	cartItems: CartItem[];
	discounts: Discount[];
};
