import { isEmpty } from "lodash";

import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";

export abstract class BaseDiscountHandler<TDiscountContext> {
	/**
	 * Computes the discount for the given cart items based on the provided discount context.
	 * Must be implemented by subclasses.
	 *
	 * @param cartItemsWithDiscountSnapshot - The items in the cart with their discount snapshots.
	 * @param discountContext - The context
	 * @returns The computed cart items with applied discounts.
	 */
	protected abstract computeDiscount(
		cartItemsWithDiscountSnapshot: CartItemWithDiscountSnapshot[],
		discountContext: TDiscountContext
	): CartItemWithDiscountSnapshot[];

	/**
	 * Additional validation for the discount context.
	 * Must be implemented by subclasses.
	 *
	 * @param discountContext - The context for the discount.
	 */
	protected abstract additionalValidateContext(
		discountContext: TDiscountContext
	): void;

	/**
	 * Validates the structure and integrity of the discount context.
	 *
	 * Although the discount handler is routed by the factory based on the discount mechanism,
	 * the runtime system cannot fully guarantee that the provided context matches the expected shape.
	 *
	 * This method acts as a final safeguard to ensure that the context is valid,
	 * complete, and appropriate for the specific handler's logic before computing any discounts.
	 *
	 * Throws an error if the context is empty or structurally invalid.
	 *
	 * @param discountContext - The discount context specific to this handler.
	 */
	protected validateContext(discountContext: TDiscountContext): void {
		if (isEmpty(discountContext)) {
			throw new Error("Discount context cannot be empty");
		}
		this.additionalValidateContext(discountContext);
	}

	/**
	 * Calculates the total discounted subtotal from the cart items.
	 *
	 * @param cartItemsWithDiscountSnapshot - The items in the cart with their discount snapshots.
	 * @returns The total discounted subtotal.
	 */
	protected calculateTotalDiscountedSubtotal(
		cartItemsWithDiscountSnapshot: CartItemWithDiscountSnapshot[]
	): number {
		return cartItemsWithDiscountSnapshot.reduce(
			(total, item) => total + item.discountedSubtotal,
			0
		);
	}

	/**
	 * Executes the discount computation.
	 * Validates the context before computing the discount.
	 *
	 * @param cartItemsWithDiscountSnapshot - The items in the cart with their discount snapshots.
	 * @param discountContext - The context for the discount.
	 * @returns The cart items with applied discounts.
	 */
	public execute(
		cartItemsWithDiscountSnapshot: CartItemWithDiscountSnapshot[],
		discountContext: TDiscountContext
	): CartItemWithDiscountSnapshot[] {
		this.validateContext(discountContext);
		return this.computeDiscount(
			cartItemsWithDiscountSnapshot,
			discountContext
		);
	}
}
