import { DiscountHandlerFactory } from "./discount-handler.factory";
import { FixedDiscountHandler } from "./handlers/fixed-discount.handler";
import { PercentageDiscountHandler } from "./handlers/percentage-discount.handler";
import { PercentageByCategoryDiscountHandler } from "./handlers/percentage-by-category-discount.handler";
import { UsePointDiscountHandler } from "./handlers/use-point-discount.handler";
import { EveryXGetYDiscountHandler } from "./handlers/every-x-get-y-discount.handler";

function getFixedDiscountHandler() {
	return new FixedDiscountHandler();
}

function getPercentageDiscountHandler() {
	return new PercentageDiscountHandler();
}

function getPercentageByCategoryDiscountHandler() {
	return new PercentageByCategoryDiscountHandler();
}

function getUsePointDiscountHandler() {
	return new UsePointDiscountHandler();
}

function getEveryXGetYDiscountHandler() {
	return new EveryXGetYDiscountHandler();
}

export function getDiscountHandlerFactory() {
	return new DiscountHandlerFactory(
		getFixedDiscountHandler(),
		getPercentageDiscountHandler(),
		getPercentageByCategoryDiscountHandler(),
		getUsePointDiscountHandler(),
		getEveryXGetYDiscountHandler()
	);
}
