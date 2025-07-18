import { UsePointDiscountHandler } from "../use-point-discount.handler";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { UsePointDiscountContext } from "src/types/discount-type";
import { DiscountMechanism } from "src/constants/discount-constant";
import { ProductCategory } from "src/constants/product-constant";
import { DISCOUNT_BY_POINT_MAXIMUM_CAP_PERCENTAGE } from "../../constants/discount.constant";

describe("UsePointDiscountHandler", () => {
	const handler = new UsePointDiscountHandler();

	const cartItems: CartItemWithDiscountSnapshot[] = [
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
		{
			name: "Belt",
			unitPrice: 230,
			quantity: 1,
			productCategory: ProductCategory.ACCESSORIES,
			subtotal: 230,
			discountedSubtotal: 230,
			appliedDiscounts: [],
		},
	];

	it("should apply up to 68 points correctly (within cap)", () => {
		const context: UsePointDiscountContext = { points: 68 };

		const result = handler.execute([...cartItems], context);

		const totalApplied = result.reduce(
			(sum, item) =>
				sum + item.appliedDiscounts.reduce((a, d) => a + d.amount, 0),
			0
		);
		const totalAfter = result.reduce(
			(sum, item) => sum + item.discountedSubtotal,
			0
		);

		expect(totalApplied).toBeCloseTo(68);
		expect(totalAfter).toBeCloseTo(762); // 830 - 68

		result.forEach((item) => {
			expect(item.appliedDiscounts[0].mechanism).toBe(
				DiscountMechanism.USE_POINT
			);
		});
	});

	it("should cap discount if points exceed 20% of total", () => {
		const context: UsePointDiscountContext = { points: 300 };

		const result = handler.execute([...cartItems], context);

		const totalDiscountedSubtotal = cartItems.reduce(
			(sum, item) => sum + item.discountedSubtotal,
			0
		);
		const maxAllowedDiscount = Math.floor(
			totalDiscountedSubtotal * DISCOUNT_BY_POINT_MAXIMUM_CAP_PERCENTAGE
		); // 20% of 830 = 166 max

		const totalApplied = result.reduce(
			(sum, item) =>
				sum + item.appliedDiscounts.reduce((a, d) => a + d.amount, 0),
			0
		);
		const totalAfter = result.reduce(
			(sum, item) => sum + item.discountedSubtotal,
			0
		);

		expect(totalApplied).toBeCloseTo(maxAllowedDiscount);
		expect(totalAfter).toBeCloseTo(830 - maxAllowedDiscount);
	});
});
