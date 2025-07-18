"use client";

import { z } from "zod";
import { ProductCategory } from "src/constants/product-constant";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "src/components/ui/select";
import { toast, Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";

interface AddItemSectionProps {
	onAddItem: (item: {
		name: string;
		unitPrice: number;
		quantity: number;
		productCategory: ProductCategory;
	}) => void;
}

const formSchema = z.object({
	name: z
		.string()
		.min(1, {
			message: "ชื่อสินค้าต้องมีอย่างน้อย 1 ตัวอักษร",
		})
		.max(100, {
			message: "ชื่อสินค้าต้องไม่เกิน 100 ตัวอักษร",
		}),
	unitPrice: z
		.number()
		.min(0)
		.refine((val) => val > 0, {
			message: "กรุณาใส่ราคาสินค้าที่ถูกต้อง",
		}),
	quantity: z
		.number()
		.min(0)
		.refine((val) => val > 0, {
			message: "กรุณาใส่จำนวนสินค้าที่ถูกต้อง",
		}),
	productCategory: z.enum(ProductCategory, {
		message: "กรุณาเลือกหมวดหมู่สินค้า",
	}),
});
type FormSchemaType = z.infer<typeof formSchema>;

const DEFAULT_FORM_VALUES: FormSchemaType = {
	name: "",
	unitPrice: 0,
	quantity: 0,
	productCategory: ProductCategory.CLOTHING,
};

export default function AddItemSection({ onAddItem }: AddItemSectionProps) {
	const itemForm = useForm<FormSchemaType>({
		resolver: zodResolver(formSchema),
		defaultValues: DEFAULT_FORM_VALUES,
	});

	const onSubmit = (values: FormSchemaType) => {
		const { name, unitPrice, quantity, productCategory } = values;
		onAddItem({
			name,
			unitPrice,
			quantity,
			productCategory,
		});
		itemForm.reset(DEFAULT_FORM_VALUES);
		toast.success("เพิ่มสินค้าสำเร็จ");
	};

	return (
		<>
			<Toaster position="top-center" />
			<Form {...itemForm}>
				<form
					onSubmit={itemForm.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<FormField
						control={itemForm.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>ชื่อสินค้า</FormLabel>
								<FormControl>
									<Input
										placeholder="ชื่อสินค้า"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={itemForm.control}
						name="unitPrice"
						render={({ field }) => {
							console.log("Rendering unitPrice field", field);
							return (
								<FormItem>
									<FormLabel>ราคาต่อหน่วย</FormLabel>
									<FormControl>
										<Input
											type="text"
											{...field}
											placeholder="ราคา"
											onChange={(e) => {
												const value = e.target.value;
												if (value === "") {
													// Set to default value in form state but display empty in UI
													field.onChange(0);
												} else {
													const numValue =
														parseFloat(value);
													field.onChange(
														isNaN(numValue)
															? 0
															: numValue
													);
												}
											}}
											value={
												field.value === 0 &&
												field.name === "unitPrice"
													? ""
													: field.value
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={itemForm.control}
						name="quantity"
						render={({ field }) => (
							<FormItem>
								<FormLabel>จำนวน</FormLabel>
								<FormControl>
									<Input
										type="text"
										{...field}
										placeholder="จำนวน"
										onChange={(e) => {
											const value = e.target.value;
											if (value === "") {
												// Set to default value in form state but display empty in UI
												field.onChange(0);
											} else {
												const numValue =
													parseInt(value);
												field.onChange(
													isNaN(numValue)
														? 0
														: numValue
												);
											}
										}}
										value={
											field.value === 0 &&
											field.name === "quantity"
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
						control={itemForm.control}
						name="productCategory"
						render={({ field }) => (
							<FormItem>
								<FormLabel>หมวดหมู่สินค้า</FormLabel>
								<FormControl>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<SelectTrigger>
											<SelectValue placeholder="เลือกหมวดหมู่" />
										</SelectTrigger>
										<SelectContent>
											{Object.values(ProductCategory).map(
												(category) => (
													<SelectItem
														key={category}
														value={category}
													>
														{category}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full">
						เพิ่มสินค้า
					</Button>
				</form>
			</Form>
		</>
	);
}
