import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductCategory } from "src/constants/product-constant";
import {
	Discount,
	EveryXGetYDiscountContext,
	FixedDiscountContext,
	PercentageByCategoryDiscountContext,
	PercentageDiscountContext,
	UsePointDiscountContext,
} from "src/types/discount-type";
import { Input } from "src/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "src/components/ui/select";
import { Button } from "src/components/ui/button";
import {
	DiscountSource,
	DiscountMechanism,
} from "src/constants/discount-constant";
import { DiscountSchema } from "src/schemas/discount-schema";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";

enum DiscountKey {
	COUPON_FIXED_DISCOUNT = "COUPON_FIXED_DISCOUNT",
	COUPON_PERCENTAGE_DISCOUNT = "COUPON_PERCENTAGE_DISCOUNT",
	ON_TOP_PERCENTAGE_BY_CATEGORY_DISCOUNT = "ON_TOP_PERCENTAGE_BY_CATEGORY_DISCOUNT",
	ON_TOP_USE_POINT_DISCOUNT = "ON_TOP_USE_POINT_DISCOUNT",
	SEASONAL_EVERY_X_GET_Y_DISCOUNT = "SEASONAL_EVERY_X_GET_Y_DISCOUNT",
}

const DiscountKeyAndLabel: { key: string; label: string }[] = [
	{
		key: DiscountKey.COUPON_FIXED_DISCOUNT,
		label: "คูปองส่วนลดแบบจำนวนเงิน",
	},
	{
		key: DiscountKey.COUPON_PERCENTAGE_DISCOUNT,
		label: "คูปองส่วนลดแบบเปอร์เซ็นต์",
	},
	{
		key: DiscountKey.ON_TOP_PERCENTAGE_BY_CATEGORY_DISCOUNT,
		label: "คูปองส่วนลดแบบเปอร์เซ็นต์ตามหมวดหมู่สินค้า",
	},
	{
		key: DiscountKey.ON_TOP_USE_POINT_DISCOUNT,
		label: "คูปองส่วนลดแบบใช้คะแนน",
	},
	{
		key: DiscountKey.SEASONAL_EVERY_X_GET_Y_DISCOUNT,
		label: "คูปองส่วนลดแบบทุก X บาท ลด Y บาท",
	},
];

interface AddDiscountSectionProps {
	onAddDiscount: (discount: Discount) => void;
}
const formSchema = z.object({
	label: z.enum(DiscountKey, {
		message: "กรุณาเลือกประเภทส่วนลด",
	}),
	context: z.object({
		amount: z
			.number()
			.min(1, {
				message: "จำนวนเงินส่วนลดต้องมากกว่า 0",
			})
			.optional(),
		percentage: z
			.number()
			.min(1, {
				message: "เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 1 ถึง 100",
			})
			.max(100, {
				message: "เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 1 ถึง 100",
			})
			.optional(),
		productCategory: z.enum(ProductCategory).optional(),
		points: z
			.number()
			.min(1, {
				message: "จำนวนคะแนนส่วนลดต้องมากกว่า 0",
			})
			.optional(),
		everyX: z
			.number()
			.min(1, {
				message: "จำนวนเงินที่ต้องใช้เพื่อรับส่วนลดต้องมากกว่า 0",
			})
			.optional(),
		getY: z
			.number()
			.min(1, {
				message: "จำนวนเงินส่วนลดต้องมากกว่า 0",
			})
			.optional(),
	}),
});

type FormSchemaType = z.infer<typeof formSchema>;

const DEFAULT_DISCOUNT_FORM_VALUES: FormSchemaType = {
	label: DiscountKey.COUPON_FIXED_DISCOUNT,
	context: {
		amount: 1,
		percentage: 1,
		productCategory: ProductCategory.CLOTHING,
		points: 1,
		everyX: 1,
		getY: 1,
	},
};

export default function AddDiscountSection({
	onAddDiscount,
}: AddDiscountSectionProps) {
	const discountForm = useForm<FormSchemaType>({
		resolver: zodResolver(formSchema),
		defaultValues: DEFAULT_DISCOUNT_FORM_VALUES,
	});
	const watchedLabel = discountForm.watch("label");

	const mapFormDataToDiscount = (
		formData: FormSchemaType
	): Discount | undefined => {
		const { label, context } = formData;
		const contextMappings: Record<
			DiscountKey,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(context: any) => Discount
		> = {
			[DiscountKey.COUPON_FIXED_DISCOUNT]: (
				context: FixedDiscountContext
			) => ({
				source: DiscountSource.COUPON,
				mechanism: DiscountMechanism.FIXED,
				context: { amount: context.amount },
			}),
			[DiscountKey.COUPON_PERCENTAGE_DISCOUNT]: (
				context: PercentageDiscountContext
			) => ({
				source: DiscountSource.COUPON,
				mechanism: DiscountMechanism.PERCENTAGE,
				context: { percentage: context.percentage },
			}),
			[DiscountKey.ON_TOP_PERCENTAGE_BY_CATEGORY_DISCOUNT]: (
				context: PercentageByCategoryDiscountContext
			) => ({
				source: DiscountSource.ON_TOP,
				mechanism: DiscountMechanism.PERCENTAGE_BY_CATEGORY,
				context: {
					percentage: context.percentage,
					productCategory: context.productCategory,
				},
			}),
			[DiscountKey.ON_TOP_USE_POINT_DISCOUNT]: (
				context: UsePointDiscountContext
			) => ({
				source: DiscountSource.ON_TOP,
				mechanism: DiscountMechanism.USE_POINT,
				context: { points: context.points },
			}),
			[DiscountKey.SEASONAL_EVERY_X_GET_Y_DISCOUNT]: (
				context: EveryXGetYDiscountContext
			) => ({
				source: DiscountSource.SEASONAL,
				mechanism: DiscountMechanism.EVERY_X_GET_Y,
				context: { everyX: context.everyX, getY: context.getY },
			}),
		};
		const mapping = contextMappings[label];
		return mapping ? mapping(context) : undefined;
	};

	const onSubmit = (values: FormSchemaType) => {
		const discount = mapFormDataToDiscount(values);
		const parsedDiscount = DiscountSchema.safeParse(discount);

		if (!parsedDiscount.success) {
			toast.error("ข้อมูลส่วนลดไม่ถูกต้อง");
			return;
		}

		onAddDiscount(parsedDiscount.data);
		discountForm.reset(DEFAULT_DISCOUNT_FORM_VALUES);
		toast.success("เพิ่มส่วนลดสำเร็จ");
	};

	const onNumberValueChange = (
		key: keyof FormSchemaType["context"],
		parseType: "float" | "int",
		value: string
	) => {
		if (value === "") {
			discountForm.setValue(`context.${key}`, 0);
			return;
		}

		const numValue =
			parseType === "float" ? parseFloat(value) : parseInt(value, 10);

		if (isNaN(numValue)) {
			discountForm.setValue(`context.${key}`, 0);
			return;
		}
		discountForm.setValue(`context.${key}`, numValue);
	};

	const renderDiscountContextInputs = () => {
		const label = watchedLabel as DiscountKey;
		switch (label) {
			case DiscountKey.COUPON_FIXED_DISCOUNT:
				return (
					<FormField
						control={discountForm.control}
						name="context.amount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>จำนวนเงินส่วนลด</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="จำนวนเงินส่วนลด"
										{...field}
										onChange={(e) =>
											onNumberValueChange(
												"amount",
												"float",
												e.target.value
											)
										}
										value={
											field.value === 0 &&
											field.name === "context.amount"
												? ""
												: field.value
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				);
			case DiscountKey.COUPON_PERCENTAGE_DISCOUNT:
				return (
					<FormField
						control={discountForm.control}
						name="context.percentage"
						render={({ field }) => (
							<FormItem>
								<FormLabel>เปอร์เซ็นต์ส่วนลด</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="เปอร์เซ็นต์ส่วนลด"
										{...field}
										onChange={(e) =>
											onNumberValueChange(
												"percentage",
												"float",
												e.target.value
											)
										}
										value={
											field.value === 0 &&
											field.name === "context.percentage"
												? ""
												: field.value
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				);
			case DiscountKey.ON_TOP_PERCENTAGE_BY_CATEGORY_DISCOUNT:
				return (
					<>
						<FormField
							control={discountForm.control}
							name="context.percentage"
							render={({ field }) => (
								<FormItem>
									<FormLabel>เปอร์เซ็นต์ส่วนลด</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											placeholder="เปอร์เซ็นต์ส่วนลด"
											onChange={(e) =>
												onNumberValueChange(
													"percentage",
													"float",
													e.target.value
												)
											}
											value={
												field.value === 0 &&
												field.name ===
													"context.percentage"
													? ""
													: field.value
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={discountForm.control}
							name="context.productCategory"
							render={({ field }) => (
								<FormItem>
									<FormLabel>หมวดหมู่สินค้า</FormLabel>
									<FormControl>
										<Select
											defaultValue={
												ProductCategory.CLOTHING
											}
											value={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger>
												<SelectValue placeholder="เลือกหมวดหมู่" />
											</SelectTrigger>
											<SelectContent>
												{Object.values(
													ProductCategory
												).map((category) => (
													<SelectItem
														key={category}
														value={category}
													>
														{category}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				);
			case DiscountKey.ON_TOP_USE_POINT_DISCOUNT:
				return (
					<FormField
						control={discountForm.control}
						name="context.points"
						render={({ field }) => (
							<FormItem>
								<FormLabel>จำนวนคะแนนส่วนลด</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="จำนวนคะแนนส่วนลด"
										{...field}
										onChange={(e) =>
											onNumberValueChange(
												"points",
												"int",
												e.target.value
											)
										}
										value={
											field.value === 0 &&
											field.name === "context.points"
												? ""
												: field.value
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				);
			case DiscountKey.SEASONAL_EVERY_X_GET_Y_DISCOUNT:
				return (
					<>
						<FormField
							control={discountForm.control}
							name="context.everyX"
							render={({ field }) => (
								<FormItem>
									<FormLabel>ทุก X บาท</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="ใส่จำนวนเงิน"
											{...field}
											onChange={(e) =>
												onNumberValueChange(
													"everyX",
													"int",
													e.target.value
												)
											}
											value={
												field.value === 0 &&
												field.name === "context.everyX"
													? ""
													: field.value
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={discountForm.control}
							name="context.getY"
							render={({ field }) => (
								<FormItem>
									<FormLabel>ลด Y บาท</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="ใส่จำนวนเงิน"
											{...field}
											onChange={(e) =>
												onNumberValueChange(
													"getY",
													"int",
													e.target.value
												)
											}
											value={
												field.value === 0 &&
												field.name === "context.getY"
													? ""
													: field.value
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				);
			default:
				return null;
		}
	};
	return (
		<>
			<Toaster position="top-center" />
			<Form {...discountForm}>
				<form
					onSubmit={discountForm.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<FormField
						control={discountForm.control}
						name="label"
						render={({ field }) => {
							console.log(field.value);
							return (
								<FormItem>
									<FormLabel>ประเภทส่วนลด</FormLabel>
									<FormControl>
										<Select
											value={field.value}
											onValueChange={(value) =>
												field.onChange(
													value as DiscountKey
												)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="เลือกประเภทส่วนลด" />
											</SelectTrigger>
											<SelectContent>
												{DiscountKeyAndLabel.map(
													(item) => (
														<SelectItem
															key={item.key}
															value={item.key}
														>
															{item.label}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					{renderDiscountContextInputs()}
					<Button type="submit" className="w-full">
						เพิ่มส่วนลด
					</Button>
				</form>
			</Form>
		</>
	);
}
