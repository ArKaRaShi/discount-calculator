import { CartItemWithDiscountSnapshot } from "../cart-item-with-discount-snapshot-type";
import { BaseResponse } from "./base-response";

export type ComputeDiscountData = {
	discountedPrice: number;
	totalDiscountApplied: number;
	details: CartItemWithDiscountSnapshot[];
};

export type ComputeDiscountResponse = BaseResponse<ComputeDiscountData>;
