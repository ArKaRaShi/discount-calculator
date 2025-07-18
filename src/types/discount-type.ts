import {
	DiscountMechanism,
	DiscountSource,
} from "src/constants/discount-constant";
import { ProductCategory } from "src/constants/product-constant";

export type FixedDiscountContext = {
	amount: number;
};

export type PercentageDiscountContext = {
	percentage: number;
};

export type PercentageByCategoryDiscountContext = PercentageDiscountContext & {
	productCategory: ProductCategory;
};

export type UsePointDiscountContext = {
	points: number;
};

export type EveryXGetYDiscountContext = {
	everyX: number;
	getY: number;
};

export type UnionDiscountContext =
	| FixedDiscountContext
	| PercentageDiscountContext
	| PercentageByCategoryDiscountContext
	| UsePointDiscountContext
	| EveryXGetYDiscountContext;

type DiscountBase<
	TSource extends DiscountSource,
	TMechanism extends DiscountMechanism,
	TContext
> = {
	source: TSource;
	mechanism: TMechanism;
	context: TContext;
};

export type Discount =
	| DiscountBase<
			DiscountSource.COUPON,
			DiscountMechanism.FIXED,
			FixedDiscountContext
	  >
	| DiscountBase<
			DiscountSource.COUPON,
			DiscountMechanism.PERCENTAGE,
			PercentageDiscountContext
	  >
	| DiscountBase<
			DiscountSource.ON_TOP,
			DiscountMechanism.PERCENTAGE_BY_CATEGORY,
			PercentageByCategoryDiscountContext
	  >
	| DiscountBase<
			DiscountSource.ON_TOP,
			DiscountMechanism.USE_POINT,
			UsePointDiscountContext
	  >
	| DiscountBase<
			DiscountSource.SEASONAL,
			DiscountMechanism.EVERY_X_GET_Y,
			EveryXGetYDiscountContext
	  >;
