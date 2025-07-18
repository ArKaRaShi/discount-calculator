import { DiscountHandlerFactory } from "../../core/discount-handler.factory";
import { ComputeDiscountsUseCase } from "./compute-discounts.use-case";

// Can make use case an interface if needed
export function getComputeDiscountsUseCase(
	discountHandlerFactory: DiscountHandlerFactory
): ComputeDiscountsUseCase {
	return new ComputeDiscountsUseCase(discountHandlerFactory);
}
