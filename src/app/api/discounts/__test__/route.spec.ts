import { NextRequest } from "next/server";
import { POST } from "../route";
import {
	DiscountMechanism,
	DiscountSource,
} from "src/constants/discount-constant";
import { ProductCategory } from "src/constants/product-constant";
import { CartItem } from "src/types/cart-item-type";
import { Discount } from "src/types/discount-type";
import { ComputeDiscountResponse } from "src/types/responses/compute-discount-response";

describe("POST /api/discounts", () => {
	it("should apply discounts correctly and return total - sorted discounts", async () => {
		const mockCartItems: CartItem[] = [
			{
				name: "T-Shirt",
				unitPrice: 300,
				quantity: 1,
				productCategory: ProductCategory.CLOTHING,
			},
			{
				name: "Hat",
				unitPrice: 200,
				quantity: 1,
				productCategory: ProductCategory.ACCESSORIES,
			},
		];

		const mockDiscounts: Discount[] = [
			{
				source: DiscountSource.COUPON,
				mechanism: DiscountMechanism.FIXED,
				context: { amount: 50 },
			},
			{
				source: DiscountSource.ON_TOP,
				mechanism: DiscountMechanism.PERCENTAGE_BY_CATEGORY,
				context: {
					percentage: 10,
					productCategory: ProductCategory.CLOTHING,
				},
			},
		];

		const mockRequest = new Request("http://localhost/api/discounts", {
			method: "POST",
			body: JSON.stringify({
				cartItems: mockCartItems,
				discounts: mockDiscounts,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const response = await POST(mockRequest as NextRequest);
		const result: ComputeDiscountResponse = await response.json();

		expect(response.status).toBe(200);

		// First coupon T-shirt 300 - 30 = 270, Hat 200 - 20 = 180, Total = 450
		// Second coupon 10% off T-shirt 270 - 27 = 243, Hat is accessories so no discount, Total = 243 + 180 = 423
		expect(result.data?.discountedPrice).toBeCloseTo(423);
	});

	it("should apply discounts correctly and return total - unsorted discounts", async () => {
		const mockCartItems: CartItem[] = [
			{
				name: "T-Shirt",
				unitPrice: 300,
				quantity: 1,
				productCategory: ProductCategory.CLOTHING,
			},
			{
				name: "Hat",
				unitPrice: 200,
				quantity: 1,
				productCategory: ProductCategory.ACCESSORIES,
			},
		];

		// Unsorted discounts
		const mockDiscounts: Discount[] = [
			// This ON_TOP discount should be applied second
			{
				source: DiscountSource.ON_TOP,
				mechanism: DiscountMechanism.PERCENTAGE_BY_CATEGORY,
				context: {
					percentage: 10,
					productCategory: ProductCategory.CLOTHING,
				},
			},
			{
				source: DiscountSource.SEASONAL,
				mechanism: DiscountMechanism.EVERY_X_GET_Y,
				context: {
					everyX: 100,
					getY: 20,
				},
			},
			{
				source: DiscountSource.COUPON,
				mechanism: DiscountMechanism.FIXED,
				context: { amount: 50 },
			},
		];

		const mockRequest = new Request("http://localhost/api/discounts", {
			method: "POST",
			body: JSON.stringify({
				cartItems: mockCartItems,
				discounts: mockDiscounts,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const response = await POST(mockRequest as NextRequest);
		const result: ComputeDiscountResponse = await response.json();

		expect(response.status).toBe(200);

		// First coupon T-shirt 300 - 30 = 270, Hat 200 - 20 = 180, Total = 450
		// Second coupon 10% off T-shirt 270 - 27 = 243, Hat is accessories so no discount, Total = 243 + 180 = 423
		// Third coupon should apply 80, so result will be 423 - 80 = 343
		expect(result.data?.discountedPrice).toBeCloseTo(343);
	});

	it("should throw error when discounts have duplicate sources", async () => {
		const mockCartItems: CartItem[] = [
			{
				name: "T-Shirt",
				unitPrice: 300,
				quantity: 1,
				productCategory: ProductCategory.CLOTHING,
			},
		];

		const mockDiscounts: Discount[] = [
			{
				source: DiscountSource.COUPON,
				mechanism: DiscountMechanism.FIXED,
				context: { amount: 50 },
			},
			{
				source: DiscountSource.COUPON, // Duplicate source
				mechanism: DiscountMechanism.PERCENTAGE,
				context: { percentage: 10 },
			},
		];

		const mockRequest = new Request("http://localhost/api/discounts", {
			method: "POST",
			body: JSON.stringify({
				cartItems: mockCartItems,
				discounts: mockDiscounts,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const response = await POST(mockRequest as NextRequest);
		const result: ComputeDiscountResponse = await response.json();

		expect(response.status).toBe(400); // Should be BAD_REQUEST
		expect(result.message).toBe("Invalid request data");
		expect(result.issues).toBeDefined();
	});
});
