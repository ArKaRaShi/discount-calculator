import { NextRequest, NextResponse } from "next/server";
import { HTTP_STATUS } from "src/constants/http-status.constant";
import { CartItem } from "src/types/cart-item-type";
import { Discount } from "src/types/discount-type";
import { ComputeDiscountResponse } from "src/types/responses/compute-discount-response";
import { getComputeDiscountsUseCase } from "src/backend-modules/discount/application/use-case/dependency";
import { ComputeDiscountsRequestSchema } from "src/backend-modules/discount/api/schema/requests/compute-discounts-request.schema";
import { getDiscountHandlerFactory } from "src/backend-modules/discount/core/dependency";

export async function POST(request: NextRequest): Promise<NextResponse> {
	const discountHandlerFactory = getDiscountHandlerFactory();
	const computeDiscountsUseCase = getComputeDiscountsUseCase(
		discountHandlerFactory
	);

	const body = await request.json();

	// Validate the request body against the schema
	const result = ComputeDiscountsRequestSchema.safeParse(body);
	if (!result.success) {
		return NextResponse.json(
			{
				message: "Invalid request data",
				issues: result.error.issues.flat(),
			},
			{ status: HTTP_STATUS.BAD_REQUEST }
		);
	}
	const { cartItems, discounts } = result.data satisfies {
		cartItems: CartItem[];
		discounts: Discount[];
	};

	const { discountedPrice, totalDiscountApplied, details } =
		await computeDiscountsUseCase.execute({
			cartItems,
			discounts,
		});

	return NextResponse.json(
		{
			message: "Discounts applied successfully",
			data: {
				discountedPrice,
				totalDiscountApplied,
				details,
			},
		} satisfies ComputeDiscountResponse,
		{
			status: HTTP_STATUS.OK,
		}
	);
}
