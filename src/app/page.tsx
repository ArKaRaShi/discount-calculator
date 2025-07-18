"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Discount } from "src/types/discount-type";
import { CartItem } from "src/types/cart-item-type";
import { ComputeDiscountResponse } from "src/types/responses/compute-discount-response";
import AddItemSection from "src/components/AddItemSection";
import AddDiscountSection from "src/components/AddDiscountSection";
import { CartItemWithDiscountSnapshot } from "src/types/cart-item-with-discount-snapshot-type";
import toast, { Toaster } from "react-hot-toast";

type CalculationResult = {
	discountedPrice: number;
	totalDiscountApplied: number;
	details: CartItemWithDiscountSnapshot[];
};

// Mechanism map for better readability
const mechanismLabels: Record<string, string> = {
	FIXED: "ส่วนลดคงที่",
	PERCENTAGE: "ส่วนลดตามเปอร์เซ็นต์",
	PERCENTAGE_BY_CATEGORY: "ส่วนลดเปอร์เซ็นต์ตามหมวดหมู่สินค้า",
	USE_POINT: "ส่วนลดใช้คะแนน",
	EVERY_X_GET_Y: "ส่วนลดทุก X บาท ลด",
};

export default function Home() {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [discounts, setDiscounts] = useState<Discount[]>([]);
	const [calculationResult, setCalculationResult] =
		useState<CalculationResult | null>(null);

	// Add Item
	const handleAddItem = (item: CartItem) => {
		setCartItems([...cartItems, item]);
	};

	// Add Discount
	const handleAddDiscount = (discount: Discount) => {
		setDiscounts([...discounts, discount]);
	};

	// API call to calculate discounts
	const calculateDiscount = async () => {
		if (cartItems.length === 0) {
			toast.error("กรุณาเพิ่มสินค้าในตะกร้าก่อนคำนวณส่วนลด");
			return;
		}

		try {
			const response = await fetch("/api/discounts", {
				method: "POST",
				body: JSON.stringify({ cartItems, discounts }),
			});

			const result: ComputeDiscountResponse = await response.json();
			if (!response.ok) {
				const isDuplicate = result.issues?.some((issue) => {
					if (
						issue.message.includes(
							"Duplicate discount source is not allowed"
						)
					) {
						return true;
					}
				});
				const errorMessage = isDuplicate
					? "ส่วนลดไม่สามารถมีประเภทที่ซ้ำกันได้"
					: "เกิดข้อผิดพลาดขณะคำนวนส่วนลด";
				toast.error(errorMessage);
			}
			return result.data;
		} catch (error) {
			console.error("Error calculating discount:", error);
			return null;
		}
	};

	// Handle Final Calculation
	const handleCalculate = async () => {
		const computationData = await calculateDiscount();
		if (!computationData) {
			return;
		}

		setCalculationResult(computationData);
	};

	const clearData = () => {
		setCartItems([]);
		setDiscounts([]);
		setCalculationResult(null);
		toast.success("ข้อมูลถูกล้างเรียบร้อยแล้ว");
	};

	return (
		<>
			<Toaster />
			<div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
				<h1 className="text-3xl font-semibold text-center text-gray-900 mb-8">
					🧾 Discount Calculator
				</h1>

				<Card className="shadow-md border rounded-lg">
					<CardHeader className="text-xl font-medium text-gray-800">
						Add Item to Cart
					</CardHeader>
					<CardContent>
						<AddItemSection onAddItem={handleAddItem} />
					</CardContent>
				</Card>

				<Card className="shadow-md border rounded-lg">
					<CardHeader className="text-xl font-medium text-gray-800">
						Cart Items
					</CardHeader>
					<CardContent>
						{cartItems.length > 0 ? (
							<ul className="space-y-2 text-gray-700">
								{cartItems.map((item, index) => (
									<li
										key={index}
										className="flex justify-between"
									>
										<span>{item.name}</span>
										<span>
											{item.unitPrice} x {item.quantity} (
											{item.productCategory})
										</span>
									</li>
								))}
							</ul>
						) : (
							<h3 className="text-gray-500">
								ยังไม่มีสินค้าในตะกร้า
							</h3>
						)}
					</CardContent>
				</Card>

				<Card className="shadow-md border rounded-lg">
					<CardHeader className="text-xl font-medium text-gray-800">
						Add Discount
					</CardHeader>
					<CardContent>
						<AddDiscountSection onAddDiscount={handleAddDiscount} />
					</CardContent>
				</Card>

				<Card className="shadow-md border rounded-lg">
					<CardHeader className="text-xl font-medium text-gray-800">
						Applied Discounts
					</CardHeader>
					<CardContent>
						{discounts.length > 0 ? (
							<ul className="space-y-2 text-gray-700">
								{discounts.map((discount, index) => (
									<li
										key={index}
										className="flex justify-between"
									>
										<span>
											{mechanismLabels[
												discount.mechanism
											] || discount.mechanism}
										</span>
										<span>
											{Object.entries(
												discount.context
											).map(([key, value]) => (
												<div
													key={key}
													className="flex justify-end mb-2"
												>
													<span className="font-medium">
														{key}:
													</span>
													<span className="text-gray-700">
														{value}
													</span>
												</div>
											))}
										</span>
									</li>
								))}
							</ul>
						) : (
							<h3 className="text-gray-500">
								ยังไม่ได้เพิ่มส่วนลดใด ๆ
							</h3>
						)}
					</CardContent>
				</Card>

				<Button onClick={handleCalculate} className="w-full">
					คิดคำนวณราคารวมหลังหักส่วนลด
				</Button>
				<Button
					onClick={clearData}
					className="w-full mt-4"
					variant="destructive"
				>
					ล้างข้อมูล
				</Button>

				<Card className="shadow-md border rounded-lg">
					<CardHeader className="text-xl font-medium text-gray-800">
						Calculation Result
					</CardHeader>
					<CardContent>
						{calculationResult ? (
							<div>
								<p>
									<strong>ราคาหลังหักส่วนลด:</strong>{" "}
									{calculationResult.discountedPrice.toFixed(
										2
									)}
								</p>
								<p>
									<strong>ยอดรวมส่วนลด:</strong>{" "}
									{calculationResult.totalDiscountApplied.toFixed(
										2
									)}
								</p>
								<h3 className="mt-4 font-medium text-gray-800">
									Details:
								</h3>
								<ul className="space-y-2 text-gray-700">
									{calculationResult.details.map(
										(detail, index) => (
											<li key={index}>
												<strong>{detail.name}</strong>
												<ul className="pl-4 space-y-1">
													{detail.appliedDiscounts.map(
														(discount, i) => (
															<li key={i}>
																{mechanismLabels[
																	discount
																		.mechanism
																] ||
																	discount.mechanism}
																:
																{discount.amount.toFixed(
																	3
																)}{" "}
															</li>
														)
													)}
												</ul>
											</li>
										)
									)}
								</ul>
							</div>
						) : (
							<p className="text-gray-500">
								ยังไม่มีข้อมูลการคำนวณส่วนลด
								กรุณาเพิ่มสินค้าและส่วนลด และกดปุ่ม
								&quot;คิดคำนวณราคารวมหลังหักส่วนลด&quot;
								เพื่อดูผลลัพธ์
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
