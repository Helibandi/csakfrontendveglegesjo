import { render, screen, fireEvent, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../context/CartContext";
import * as AuthHook from "../../hooks/UseAuth";
import { toast } from "react-toastify";

// Mocks
jest.mock("../../hooks/UseAuth", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUseAuth = AuthHook.default as jest.Mock;

// Test component that uses the cart context
const TestComponent = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } =
    useCart();

  return (
    <div>
      <div data-testid="cart-length">{cart.length}</div>
      <button
        data-testid="add-item"
        onClick={() =>
          addToCart(
            { id: "1", name: "Test Pizza", price: 1000, imageUrl: "test.jpg" },
            1
          )
        }
      >
        Add Item
      </button>
      <button
        data-testid="update-quantity"
        onClick={() => updateQuantity("1", 3)}
      >
        Update Quantity
      </button>
      <button data-testid="remove-item" onClick={() => removeFromCart("1")}>
        Remove Item
      </button>
      <button data-testid="clear-cart" onClick={() => clearCart()}>
        Clear Cart
      </button>
      {cart.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.name} - {item.quantity}
        </div>
      ))}
    </div>
  );
};

describe("CartContext", () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue("[]"),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    // Mock auth
    mockUseAuth.mockReturnValue({ auth: { accessToken: "mock-token" } });

    // Clear mocks
    jest.clearAllMocks();
  });

  test("should add item to cart", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("cart-length").textContent).toBe("0");

    fireEvent.click(screen.getByTestId("add-item"));

    expect(screen.getByTestId("cart-length").textContent).toBe("1");
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalled();
  });

  test("should update item quantity", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item"));
    fireEvent.click(screen.getByTestId("update-quantity"));

    expect(screen.getByTestId("item-1").textContent).toContain("3");
  });

  test("should remove item from cart", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item"));
    expect(screen.getByTestId("cart-length").textContent).toBe("1");

    fireEvent.click(screen.getByTestId("remove-item"));
    expect(screen.getByTestId("cart-length").textContent).toBe("0");
  });

  test("should clear cart", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item"));
    expect(screen.getByTestId("cart-length").textContent).toBe("1");

    fireEvent.click(screen.getByTestId("clear-cart"));
    expect(screen.getByTestId("cart-length").textContent).toBe("0");
  });

  test("should not add to cart if not authenticated", () => {
    mockUseAuth.mockReturnValue({ auth: {} }); // No accessToken

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item"));

    expect(screen.getByTestId("cart-length").textContent).toBe("0");
    expect(toast.error).toHaveBeenCalled();
  });
});
