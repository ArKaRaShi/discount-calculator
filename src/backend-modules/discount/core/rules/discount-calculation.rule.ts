export class DiscountCalculationRule {
	/**
	 *  Calculates the discount percentage based on the price and percentage.
	 * Ensures that the discounted price does not fall below zero.
	 *
	 * @param price - The original price of the item.
	 * @param percentage - The discount percentage to apply.
	 * @returns The discounted price after applying the percentage discount.
	 */
	static calculatePercentageDiscount(
		price: number,
		percentage: number
	): number {
		const discount = (price * percentage) / 100;
		const discountedPrice = price - discount;
		return discountedPrice > 0 ? discountedPrice : 0;
	}

	/**
	 * Calculates the fixed discount based on the price and fixed discount amount.
	 * Ensures that the discounted price does not fall below zero.
	 *
	 * @param price - The original price of the item.
	 * @param fixedDiscount - The fixed discount amount to apply.
	 * @returns The discounted price after applying the fixed discount.
	 */
	static calculateFixedDiscount(
		price: number,
		fixedDiscount: number
	): number {
		const discountedPrice = price - fixedDiscount;
		return discountedPrice > 0 ? discountedPrice : 0;
	}
}
