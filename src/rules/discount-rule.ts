export function computeDiscount(price: number, discount: number): number {
	if (discount < 0 || discount > 100) {
		throw new Error("Invalid discount value");
	}
	return price - (price * discount) / 100;
}
