export enum DiscountSource {
	COUPON = "COUPON",
	ON_TOP = "ON_TOP",
	SEASONAL = "SEASONAL",
}

export enum DiscountMechanism {
	FIXED = "FIXED",
	PERCENTAGE = "PERCENTAGE",
	PERCENTAGE_BY_CATEGORY = "PERCENTAGE_BY_CATEGORY",
	USE_POINT = "USE_POINT",
	EVERY_X_GET_Y = "EVERY_X_GET_Y",
}

export const DiscountSourcePriority: Record<DiscountSource, number> = {
	[DiscountSource.COUPON]: 1,
	[DiscountSource.ON_TOP]: 2,
	[DiscountSource.SEASONAL]: 3,
} as const;
