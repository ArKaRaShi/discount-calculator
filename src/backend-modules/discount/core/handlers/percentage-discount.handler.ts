import { PercentageDiscountContext } from "src/types/discount-type";
import { DiscountMechanism } from "src/constants/discount-constant";
import { BaseDiscountHandler } from "../contracts/base-discount-handler";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { DiscountCalculationRule } from "../rules/discount-calculation.rule";

export class PercentageDiscountHandler extends BaseDiscountHandler<PercentageDiscountContext> {
	protected computeDiscount(
		cartItemsWithDiscountSnapshot: CartItemWithDiscountSnapshot[],
		discountContext: PercentageDiscountContext
	): CartItemWithDiscountSnapshot[] {
		const { percentage } = discountContext;
		return cartItemsWithDiscountSnapshot.map((item) => {
			const { discountedSubtotal } = item;

			const newDiscountedSubtotal =
				DiscountCalculationRule.calculatePercentageDiscount(
					discountedSubtotal,
					percentage
				);
			return {
				...item,
				discountedSubtotal: newDiscountedSubtotal,
				appliedDiscounts: [
					...item.appliedDiscounts,
					{
						mechanism: DiscountMechanism.PERCENTAGE,
						amount: discountedSubtotal - newDiscountedSubtotal, // The discount amount applied
					},
				],
			};
		});
	}

	protected additionalValidateContext(
		discountContext: PercentageDiscountContext
	): void {
		if (
			discountContext.percentage < 0 ||
			discountContext.percentage > 100
		) {
			throw new Error("Percentage must be between 0 and 100");
		}
	}
}
