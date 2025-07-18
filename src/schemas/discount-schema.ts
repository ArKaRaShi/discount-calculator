import {
	DiscountSource,
	DiscountMechanism,
} from "src/constants/discount-constant";
import { ProductCategory } from "src/constants/product-constant";
import { z } from "zod";

const FixedDiscountContextSchema = z.object({
	amount: z.number().min(1),
});

const PercentageDiscountContextSchema = z.object({
	percentage: z.number().min(1).max(100),
});

const PercentageByCategoryDiscountContextSchema = z.object({
	percentage: z.number().min(1).max(100),
	productCategory: z.enum(ProductCategory),
});

const UsePointDiscountContextSchema = z.object({
	points: z.number().min(1),
});

const EveryXGetYDiscountContextSchema = z.object({
	everyX: z.number().min(1),
	getY: z.number().min(1),
});

export const DiscountSchema = z.discriminatedUnion("mechanism", [
	z.object({
		source: z.literal(DiscountSource.COUPON),
		mechanism: z.literal(DiscountMechanism.FIXED),
		context: FixedDiscountContextSchema,
	}),
	z.object({
		source: z.literal(DiscountSource.COUPON),
		mechanism: z.literal(DiscountMechanism.PERCENTAGE),
		context: PercentageDiscountContextSchema,
	}),
	z.object({
		source: z.literal(DiscountSource.ON_TOP),
		mechanism: z.literal(DiscountMechanism.PERCENTAGE_BY_CATEGORY),
		context: PercentageByCategoryDiscountContextSchema,
	}),
	z.object({
		source: z.literal(DiscountSource.ON_TOP),
		mechanism: z.literal(DiscountMechanism.USE_POINT),
		context: UsePointDiscountContextSchema,
	}),
	z.object({
		source: z.literal(DiscountSource.SEASONAL),
		mechanism: z.literal(DiscountMechanism.EVERY_X_GET_Y),
		context: EveryXGetYDiscountContextSchema,
	}),
]);
