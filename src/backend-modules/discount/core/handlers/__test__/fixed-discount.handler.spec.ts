import { DiscountMechanism } from "src/constants/discount-constant";
import { FixedDiscountHandler } from "../fixed-discount.handler";
import { FixedDiscountContext } from "src/types/discount-type";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { ProductCategory } from "src/constants/product-constant";

describe("FixedDiscountHandler", () => {
	const handler = new FixedDiscountHandler();

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
			name: "Hat",
			unitPrice: 250,
			quantity: 1,
			productCategory: ProductCategory.ACCESSORIES,
			subtotal: 250,
			discountedSubtotal: 250,
			appliedDiscounts: [],
		},
	];

	it("should apply 50 THB discount proportionally", () => {
		const context: FixedDiscountContext = {
			amount: 50,
		};

		const result = handler.execute([...mockCartItems], context);

		const expectedTotalSubtotal = 350 + 250; // = 600
		const expectedTotalDiscounted = 50; // 50 THB discount

		const totalDiscounted = result.reduce(
			(sum, item) => sum + item.discountedSubtotal,
			0
		);

		const totalApplied = result.reduce(
			(sum, item) =>
				sum + item.appliedDiscounts.reduce((a, d) => a + d.amount, 0),
			0
		);

		expect(totalApplied).toBeCloseTo(expectedTotalDiscounted);
		expect(totalDiscounted).toBeCloseTo(
			expectedTotalSubtotal - expectedTotalDiscounted
		);

		result.forEach((item) =>
			expect(item.appliedDiscounts[0].mechanism).toBe(
				DiscountMechanism.FIXED
			)
		);
	});
});
