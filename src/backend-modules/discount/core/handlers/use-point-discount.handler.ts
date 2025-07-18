import { DiscountMechanism } from "src/constants/discount-constant";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { UsePointDiscountContext } from "src/types/discount-type";
import { BaseDiscountHandler } from "../contracts/base-discount-handler";
import {
	DISCOUNT_BY_POINT_MAXIMUM_CAP_PERCENTAGE,
	POINT_TO_MONEY_CONVERSION_RATE,
} from "../constants/discount.constant";
import { DiscountCalculationRule } from "../rules/discount-calculation.rule";

export class UsePointDiscountHandler extends BaseDiscountHandler<UsePointDiscountContext> {
	protected additionalValidateContext(
		discountContext: UsePointDiscountContext
	): void {
		const { points } = discountContext;
		if (points < 0) {
			throw new Error("Points cannot be negative");
		}
		// In this takehome exam, assume user's point value is infinite
		// so no need to validate pointValue exceeds user's point
	}

	protected computeDiscount(
		cartItemsWithDiscountSnapshot: CartItemWithDiscountSnapshot[],
		discountContext: UsePointDiscountContext
	): CartItemWithDiscountSnapshot[] {
		const { points } = discountContext;
		const totalDiscountedSubtotal = this.calculateTotalDiscountedSubtotal(
			cartItemsWithDiscountSnapshot
		);

		const maxUsablePoints = this.calculateMaxPointsUsable(
			cartItemsWithDiscountSnapshot
		);
		// Ensure we do not use more points than the maximum cap allowed
		const pointsToUse = Math.min(points, maxUsablePoints);
		const discountAmount = this.convertPointsToMoney(pointsToUse);

		return cartItemsWithDiscountSnapshot.map((item) => {
			const { discountedSubtotal } = item;

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
						mechanism: DiscountMechanism.USE_POINT,
						amount: adjustedDiscountAmount, // The discount amount applied
					},
				],
			};
		});
	}

	private calculateMaxPointsUsable(
		cartItems: CartItemWithDiscountSnapshot[]
	): number {
		const totalDiscounted =
			this.calculateTotalDiscountedSubtotal(cartItems);

		const rawPointCap =
			totalDiscounted * DISCOUNT_BY_POINT_MAXIMUM_CAP_PERCENTAGE;
		const convertedPoints = this.convertMoneyToPoints(rawPointCap);

		// Ensure we return a whole number of points
		// and not exceed the maximum usable points cap
		const maxUsablePoints = Math.floor(convertedPoints);
		return maxUsablePoints;
	}

	// In real application, this can be use other service to convert points to money
	// that will be configurable and not constant
	private convertPointsToMoney(points: number): number {
		return points * POINT_TO_MONEY_CONVERSION_RATE;
	}

	private convertMoneyToPoints(money: number): number {
		return money / POINT_TO_MONEY_CONVERSION_RATE;
	}
}
