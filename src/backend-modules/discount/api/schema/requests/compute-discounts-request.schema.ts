import { z } from "zod";
import { ProductCategory } from "src/constants/product-constant";
import { DiscountSchema } from "src/schemas/discount-schema";

export const ComputeDiscountsRequestSchema = z.object({
	cartItems: z
		.array(
			z.object({
				name: z.string(),
				unitPrice: z.number().min(1),
				productCategory: z.enum(ProductCategory),
				quantity: z.number().min(1).default(1),
			})
		)
		.min(1, "At least one cart item is required"),
	discounts: z.array(DiscountSchema).refine(
		(discounts) => {
			const sources = discounts.map(({ source }) => source);
			return new Set(sources).size === sources.length;
		},
		{
			message: "Duplicate discount source is not allowed",
		}
	),
});
