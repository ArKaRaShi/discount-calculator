import {
	DiscountMechanism,
	DiscountSource,
} from "src/constants/discount-constant";
import { CartItem } from "src/types/cart-item-type";
import { Discount } from "src/types/discount-type";
import { ProductCategory } from "src/constants/product-constant";
import { getDiscountHandlerFactory } from "src/backend-modules/discount/core/dependency";
import { DiscountHandlerFactory } from "src/backend-modules/discount/core/discount-handler.factory";
import { ComputeDiscountsUseCase } from "../compute-discounts.use-case";
import { getComputeDiscountsUseCase } from "../dependency";

describe("ComputeDiscountsUseCase", () => {
	let computeDiscountsUseCase: ComputeDiscountsUseCase;
	let mockDiscountHandlerFactory: DiscountHandlerFactory;

	beforeEach(() => {
		// Initialize the discount handler factory
		mockDiscountHandlerFactory = getDiscountHandlerFactory();
		computeDiscountsUseCase = getComputeDiscountsUseCase(
			mockDiscountHandlerFactory
		);
	});

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
			{
				source: DiscountSource.SEASONAL,
				mechanism: DiscountMechanism.EVERY_X_GET_Y,
				context: {
					everyX: 100,
					getY: 20,
				},
			},
		];

		const result = await computeDiscountsUseCase.execute({
			cartItems: mockCartItems,
			discounts: mockDiscounts,
		});

		expect(result.discountedPrice).toBeCloseTo(343); // Expected value after applying discounts
		expect(result.totalDiscountApplied).toBeCloseTo(157); // Total discount applied
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

		const result = await computeDiscountsUseCase.execute({
			cartItems: mockCartItems,
			discounts: mockDiscounts,
		});

		expect(result.discountedPrice).toBeCloseTo(343); // Expected value after applying discounts
		expect(result.totalDiscountApplied).toBeCloseTo(157); // Total discount applied
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

		await expect(
			computeDiscountsUseCase.execute({
				cartItems: mockCartItems,
				discounts: mockDiscounts,
			})
		).rejects.toThrow("Duplicate discount source detected: COUPON");
	});

	it("should return original price when no discounts are applied", async () => {
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

		const mockDiscounts: Discount[] = []; // No discounts

		const result = await computeDiscountsUseCase.execute({
			cartItems: mockCartItems,
			discounts: mockDiscounts,
		});

		expect(result.discountedPrice).toBe(500); // 300 + 200
		expect(result.totalDiscountApplied).toBe(0);
	});

	it("should throw error when no cart items are provided", async () => {
		const mockDiscounts: Discount[] = [
			{
				source: DiscountSource.COUPON,
				mechanism: DiscountMechanism.FIXED,
				context: { amount: 50 },
			},
		];

		await expect(
			computeDiscountsUseCase.execute({
				cartItems: [],
				discounts: mockDiscounts,
			})
		).rejects.toThrow("Cart items are required for discount computation.");
	});
});
