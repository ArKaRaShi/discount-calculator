import { BaseDiscountHandler } from "./contracts/base-discount-handler";
import { DiscountMechanism } from "src/constants/discount-constant";
import { FixedDiscountHandler } from "./handlers/fixed-discount.handler";
import { PercentageDiscountHandler } from "./handlers/percentage-discount.handler";
import {
	EveryXGetYDiscountContext,
	FixedDiscountContext,
	PercentageByCategoryDiscountContext,
	PercentageDiscountContext,
	UsePointDiscountContext,
} from "src/types/discount-type";

type HandlerContextByMechanism = {
	[DiscountMechanism.FIXED]: FixedDiscountContext;
	[DiscountMechanism.PERCENTAGE]: PercentageDiscountContext;
	[DiscountMechanism.PERCENTAGE_BY_CATEGORY]: PercentageByCategoryDiscountContext;
	[DiscountMechanism.USE_POINT]: UsePointDiscountContext;
	[DiscountMechanism.EVERY_X_GET_Y]: EveryXGetYDiscountContext;
};

export class DiscountHandlerFactory {
	private readonly handlers: {
		[K in DiscountMechanism]: BaseDiscountHandler<
			HandlerContextByMechanism[K]
		>;
	};

	constructor(
		fixedDiscountHandler: FixedDiscountHandler,
		percentageDiscountHandler: PercentageDiscountHandler,
		percentageByCategoryDiscountHandler: BaseDiscountHandler<PercentageByCategoryDiscountContext>,
		usePointDiscountHandler: BaseDiscountHandler<UsePointDiscountContext>,
		everyXGetYDiscountHandler: BaseDiscountHandler<EveryXGetYDiscountContext>
	) {
		this.handlers = {
			[DiscountMechanism.FIXED]: fixedDiscountHandler,
			[DiscountMechanism.PERCENTAGE]: percentageDiscountHandler,
			[DiscountMechanism.PERCENTAGE_BY_CATEGORY]:
				percentageByCategoryDiscountHandler,
			[DiscountMechanism.USE_POINT]: usePointDiscountHandler,
			[DiscountMechanism.EVERY_X_GET_Y]: everyXGetYDiscountHandler,
		};
	}

	getHandler<T extends DiscountMechanism>(
		mechanism: T
	): BaseDiscountHandler<HandlerContextByMechanism[T]> {
		const handler = this.handlers[mechanism];
		if (!handler) {
			throw new Error(`No handler for: ${mechanism}`);
		}
		return handler;
	}
}
