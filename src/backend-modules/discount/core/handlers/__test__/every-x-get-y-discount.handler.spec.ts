import { DiscountMechanism } from "src/constants/discount-constant";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { EveryXGetYDiscountContext } from "src/types/discount-type";
import { ProductCategory } from "src/constants/product-constant";
import { EveryXGetYDiscountHandler } from "../every-x-get-y-discount.handler";

describe("EveryXGetYDiscountHandler", () => {
	const handler = new EveryXGetYDiscountHandler();
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

	it("should apply 40 THB for every 300 THB correctly", () => {
		const context: EveryXGetYDiscountContext = {
			everyX: 300,
			getY: 40,
		};

		const result = handler.execute([...mockCartItems], context);
		const expectedDiscountTotal = 2 * 40; // = 80

		const totalDiscounted = result.reduce(
			(sum, item) => sum + item.discountedSubtotal,
			0
		);
		const totalApplied = result.reduce(
			(sum, item) =>
				sum + item.appliedDiscounts.reduce((a, d) => a + d.amount, 0),
			0
		);

		expect(totalApplied).toBeCloseTo(expectedDiscountTotal);
		expect(totalDiscounted).toBeCloseTo(830 - expectedDiscountTotal);
		result.forEach((item) =>
			expect(item.appliedDiscounts[0].mechanism).toBe(
				DiscountMechanism.EVERY_X_GET_Y
			)
		);
	});
});
