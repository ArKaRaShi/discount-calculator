import { PercentageDiscountHandler } from "../percentage-discount.handler";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { PercentageDiscountContext } from "src/types/discount-type";
import { DiscountMechanism } from "src/constants/discount-constant";
import { ProductCategory } from "src/constants/product-constant";

describe("PercentageDiscountHandler", () => {
	const handler = new PercentageDiscountHandler();

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

	it("should apply 10% discount to entire cart", () => {
		const context: PercentageDiscountContext = {
			percentage: 10,
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

		expect(totalApplied).toBeCloseTo(60); // 10% of 600
		expect(totalAfter).toBeCloseTo(540); // 600 - 60

		result.forEach((item) =>
			expect(item.appliedDiscounts[0].mechanism).toBe(
				DiscountMechanism.PERCENTAGE
			)
		);
	});
});
