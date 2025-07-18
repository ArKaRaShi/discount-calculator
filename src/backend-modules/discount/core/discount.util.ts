import { DiscountSourcePriority } from "src/constants/discount-constant";
import { Discount } from "src/types/discount-type";

export function sortDiscountsByPriority(discounts: Discount[]): Discount[] {
	return discounts.sort(
		(a, b) =>
			DiscountSourcePriority[a.source] - DiscountSourcePriority[b.source]
	);
}
