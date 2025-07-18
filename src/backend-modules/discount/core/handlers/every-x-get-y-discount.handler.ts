import { DiscountMechanism } from "src/constants/discount-constant";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { EveryXGetYDiscountContext } from "src/types/discount-type";
import { BaseDiscountHandler } from "../contracts/base-discount-handler";
import { DiscountCalculationRule } from "../rules/discount-calculation.rule";

export class EveryXGetYDiscountHandler extends BaseDiscountHandler<EveryXGetYDiscountContext> {
	protected additionalValidateContext(
		discountContext: EveryXGetYDiscountContext
	): void {
		const { everyX, getY } = discountContext;
		if (everyX <= 0) {
			throw new Error("Every X must be greater than 0");
		}
		if (getY <= 0) {
			throw new Error("Get Y must be greater than 0");
		}
	}

	protected computeDiscount(
		cartItemsWithDiscountSnapshot: CartItemWithDiscountSnapshot[],
		discountContext: EveryXGetYDiscountContext
	): CartItemWithDiscountSnapshot[] {
		const { everyX: thresholdAmount, getY: rewardAmount } = discountContext;

		const totalDiscountedSubtotal = this.calculateTotalDiscountedSubtotal(
			cartItemsWithDiscountSnapshot
		);

		const qualifiedMultiples = Math.floor(
			totalDiscountedSubtotal / thresholdAmount
		);
		const totalRewardDiscount = qualifiedMultiples * rewardAmount;

		return cartItemsWithDiscountSnapshot.map((item) => {
			const { discountedSubtotal } = item;

			const fairnessFactor = discountedSubtotal / totalDiscountedSubtotal;
			const distributedDiscount = totalRewardDiscount * fairnessFactor;

			const newDiscountSubtotal =
				DiscountCalculationRule.calculateFixedDiscount(
					discountedSubtotal,
					distributedDiscount
				);

			return {
				...item,
				discountedSubtotal: newDiscountSubtotal,
				appliedDiscounts: [
					...item.appliedDiscounts,
					{
						mechanism: DiscountMechanism.EVERY_X_GET_Y,
						amount: distributedDiscount,
					},
				],
			};
		});
	}
}
