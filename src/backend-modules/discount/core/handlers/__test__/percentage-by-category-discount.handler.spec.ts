import { PercentageByCategoryDiscountHandler } from "../percentage-by-category-discount.handler";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { PercentageByCategoryDiscountContext } from "src/types/discount-type";
import { DiscountMechanism } from "src/constants/discount-constant";
import { ProductCategory } from "src/constants/product-constant";

describe("PercentageByCategoryDiscountHandler", () => {
	const handler = new PercentageByCategoryDiscountHandler();

	const mockCartItems: CartItemWithDiscountSnapshot[] = [
		{
			name: "T-Shirt",
			unitPrice: 350,
			quantity: 1,
			productCategory: ProductCategory.CLOTHING,
			subtotal: 350,
			discountedSubtotal: 350,
			appliedDiscounts: [],
		},
		{
			name: "Hoodie",
			unitPrice: 700,
			quantity: 1,
			productCategory: ProductCategory.CLOTHING,
			subtotal: 700,
			discountedSubtotal: 700,
			appliedDiscounts: [],
		},
		{
			name: "Watch",
			unitPrice: 850,
			quantity: 1,
			productCategory: ProductCategory.ACCESSORIES,
			subtotal: 850,
			discountedSubtotal: 850,
			appliedDiscounts: [],
		},
		{
			name: "Bag",
			unitPrice: 640,
			quantity: 1,
			productCategory: ProductCategory.ACCESSORIES,
			subtotal: 640,
			discountedSubtotal: 640,
			appliedDiscounts: [],
		},
	];

	it("should apply 15% discount only on CLOTHING items", () => {
		const context: PercentageByCategoryDiscountContext = {
			percentage: 15,
			productCategory: ProductCategory.CLOTHING,
		};

		const result = handler.execute([...mockCartItems], context);

		const totalApplied = result.reduce(
			(sum, item) =>
				sum + item.appliedDiscounts.reduce((a, d) => a + d.amount, 0),
			0
		);
		const totalAfter = result.reduce(
			(sum, item) => sum + item.discountedSubtotal,
			0
		);

		expect(totalApplied).toBeCloseTo(157.5); // 15% of 1050
		expect(totalAfter).toBeCloseTo(2382.5);

		const clothingItems = result.filter(
			(i) => i.productCategory === ProductCategory.CLOTHING
		);
		clothingItems.forEach((item) => {
			expect(item.appliedDiscounts.length).toBeGreaterThan(0);
			expect(item.appliedDiscounts[0].mechanism).toBe(
				DiscountMechanism.PERCENTAGE_BY_CATEGORY
			);
		});

		const nonClothingItems = result.filter(
			(i) => i.productCategory !== ProductCategory.CLOTHING
		);
		nonClothingItems.forEach((item) => {
			expect(item.appliedDiscounts.length).toBe(0);
			expect(item.discountedSubtotal).toBe(item.subtotal);
		});
	});
});
