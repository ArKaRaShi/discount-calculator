import { Discount } from "src/types/discount-type";
import { CartItem } from "src/types/cart-item-type";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import { DiscountHandlerFactory } from "../../core/discount-handler.factory";
import { sortDiscountsByPriority } from "../../core/discount.util";

type ComputeDiscountInput = {
	cartItems: CartItem[];
	discounts: Discount[];
};
type ComputeDiscountOutput = {
	discountedPrice: number;
	totalDiscountApplied: number;
	details: CartItemWithDiscountSnapshot[];
};

export class ComputeDiscountsUseCase {
	constructor(
		private readonly discountHandlerFactory: DiscountHandlerFactory
	) {}

	async execute(input: ComputeDiscountInput): Promise<ComputeDiscountOutput> {
		const { cartItems, discounts } = input;

		// Ensure no duplicate discount sources
		this.ensureNoDiscountSourceDuplication(discounts);

		const cartItemsWithDiscountSnapshot =
			this.mapCartItemsWithDiscountSnapshot(cartItems);
		const sortedDiscounts = sortDiscountsByPriority(discounts);

		// Iterate through sorted discounts and apply them
		const discountedCart = sortedDiscounts.reduce((acc, discount) => {
			const { mechanism, context } = discount;
			const discountHandler =
				this.discountHandlerFactory.getHandler(mechanism);
			return discountHandler.execute(acc, context);
		}, cartItemsWithDiscountSnapshot);

		// Calculate the total discounted price
		const totalDiscountedPrice = discountedCart.reduce(
			(acc, { discountedSubtotal: itemDiscountedSubtotal }) =>
				acc + itemDiscountedSubtotal,
			0
		);

		// Calculate total discount applied
		const totalDiscountApplied = discountedCart.reduce(
			(acc, { subtotal, discountedSubtotal }) =>
				acc + (subtotal - discountedSubtotal),
			0
		);

		return {
			discountedPrice: totalDiscountedPrice,
			totalDiscountApplied,
			details: discountedCart,
		};
	}

	private mapCartItemsWithDiscountSnapshot(
		cartItems: CartItem[]
	): CartItemWithDiscountSnapshot[] {
		return cartItems.map((item) => {
			const totalPrice = item.unitPrice * item.quantity;
			return {
				...item,
				subtotal: totalPrice,
				discountedSubtotal: totalPrice,
				appliedDiscounts: [],
			};
		});
	}

	private ensureNoDiscountSourceDuplication(discounts: Discount[]) {
		const seenSources = new Set<string>();
		discounts.forEach(({ source }) => {
			if (seenSources.has(source)) {
				throw new Error(
					`Duplicate discount source detected: ${source}`
				);
			}
			seenSources.add(source);
		});
	}
}
