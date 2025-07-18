import { FixedDiscountContext } from "src/types/discount-type";
import { BaseDiscountHandler } from "../contracts/base-discount-handler";
import { DiscountMechanism } from "src/constants/discount-constant";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { DiscountCalculationRule } from "../rules/discount-calculation.rule";

export class FixedDiscountHandler extends BaseDiscountHandler<FixedDiscountContext> {
	protected additionalValidateContext({
		amount: discountAmount,
	}: FixedDiscountContext): void {
		if (discountAmount < 0) {
			throw new Error("Discount amount must equal or greater than 0");
		}
	}

	protected computeDiscount(
		cartItemsWithDiscountSnapshot: CartItemWithDiscountSnapshot[],
		discountContext: FixedDiscountContext
	): CartItemWithDiscountSnapshot[] {
		const { amount: discountAmount } = discountContext;
		const totalDiscountedSubtotal = this.calculateTotalDiscountedSubtotal(
			cartItemsWithDiscountSnapshot
		);

		return cartItemsWithDiscountSnapshot.map((item) => {
			const { discountedSubtotal } = item;

			// Calculate the fairness factor based on the item's discounted subtotal
			const fairnessFactor = discountedSubtotal / totalDiscountedSubtotal;
			const adjustedDiscountAmount = discountAmount * fairnessFactor;

			const newDiscountedSubtotal =
				DiscountCalculationRule.calculateFixedDiscount(
					discountedSubtotal,
					adjustedDiscountAmount
				);

			return {
				...item,
				discountedSubtotal: newDiscountedSubtotal,
				appliedDiscounts: [
					...item.appliedDiscounts,
					{
						mechanism: DiscountMechanism.FIXED,
						amount: adjustedDiscountAmount,
					},
				],
			};
		});
	}
}
