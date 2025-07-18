import { PercentageByCategoryDiscountContext } from "src/types/discount-type";
import { BaseDiscountHandler } from "../contracts/base-discount-handler";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { DiscountMechanism } from "src/constants/discount-constant";
import { DiscountCalculationRule } from "../rules/discount-calculation.rule";

export class PercentageByCategoryDiscountHandler extends BaseDiscountHandler<PercentageByCategoryDiscountContext> {
	protected additionalValidateContext(
		discountContext: PercentageByCategoryDiscountContext
	): void {
		const { percentage, productCategory } = discountContext;
		if (percentage < 1 || percentage > 100) {
			throw new Error("Percentage must be between 1 and 100");
		}
		if (!productCategory) {
			throw new Error(
				"Category must be specified for percentage by category discount"
			);
		}
	}

	protected computeDiscount(
		cartItemsWithDiscountSnapshot: CartItemWithDiscountSnapshot[],
		discountContext: PercentageByCategoryDiscountContext
	): CartItemWithDiscountSnapshot[] {
		const { percentage, productCategory } = discountContext;
		return cartItemsWithDiscountSnapshot.map((item) => {
			const { productCategory: itemProductCategory, discountedSubtotal } =
				item;

			if (itemProductCategory !== productCategory) {
				return item; // No discount applied if category does not match
			}

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
						mechanism: DiscountMechanism.PERCENTAGE_BY_CATEGORY,
						amount: discountedSubtotal - newDiscountedSubtotal,
					},
				],
			};
		});
	}
}
