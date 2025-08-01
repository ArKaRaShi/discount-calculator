## Author

**Ponthep Homkasorn**

# Discount Calculator

This project is built with **Next.js** for the frontend and includes a modular backend structure inspired by NestJS. The main focus of this project is to apply discounts to cart items, with relevant business logic for discount handling, ensuring no duplication, and sorting the discounts based on priority.

The backend is structured under the `src/backend-modules` directory, and the logic for computing the discounts is encapsulated in the `src/backend-modules/discount/application/use-case/compute-discounts.use-case.ts`.

### Project Structure

-   **Frontend**: Implements a simple UI to view and interact with cart items and discounts.
-   **Backend**: Handles business logic for computing discounts based on cart items, ensuring no duplicate discount types, sorting discount application order, and applying discounts using a handler pattern.

### Key Features

1. **List of Cart Items**: Products added to the cart with price, quantity, and product category.
2. **List of Discounts**: Discounts applied to the cart items with mechanisms like fixed amount, percentage, and percentage by category.
3. **Discount Application Logic**:

    - **No Duplicate Discount Types**: The use case ensures that no duplicate discount types are applied.
    - **Discount Sorting**: Discounts are applied in order of priority.
    - **Discount Handler**: A handler mechanism is used to apply the discounts based on the discount type and context.

### Error Handling

In this project, I used the `throw Error()` approach for error handling to simplify the implementation. However, in a real application, errors would typically be more specific. For instance, instead of using a generic `Error`, it's recommended to use specific error types like `ApplicationError` or domain-specific exceptions, which provide more context and make error handling and debugging easier.

The `Error` is used here as a placeholder or "sign" to indicate a failure or an issue within the code, such as a duplicate discount source or other business logic issues. For a production-ready application, it must implement custom error classes and structured error responses, especially in APIs, to provide a better experience for developers and users.

### Assumptions

-   **Fixed Discount**: Uses a fair factor to distribute the discount equally across all items.
-   **Multiple Coupons**: Multiple coupons can be used, and lower-priority discounts will apply their discount to the price already discounted by higher-priority ones, recursively.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ArKaRaShi/discount-calculator.git
```

### 2. Install dependencies

```bash
cd discount-calculator
npm install
```

### 3. Run the development server

To run a simple UI interface, execute:

```bash
npm run dev
```

This will start the development server, and you can access the app in your browser at http://localhost:3000.

### 4. Running Tests

If you want to modify or add new test cases for the handlers and use case logic, go to the \*.spec.ts files and apply the changes. To run the tests, use:

```bash
npm run test
```

This will run all test cases, including those for the discount handlers and the ComputeDiscountsUseCase.
