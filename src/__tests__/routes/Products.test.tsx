import { render, screen, waitFor } from "@testing-library/react";
import Products from "../../routes/Products/Products";
import { CartProvider } from "../../context/CartContext";
import * as AuthHook from "../../hooks/UseAuth";

// Mock components and hooks
jest.mock("../../hooks/UseAuth", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUseAuth = AuthHook.default as jest.Mock;

// Mock products data
const mockProducts = [
  {
    id: "1",
    name: "Margherita",
    description: "Classic tomato and mozzarella",
    imageUrl: "margherita.jpg",
    price: 1200,
    isAvailable: true,
    category: "pizza",
  },
  {
    id: "2",
    name: "Pepperoni",
    description: "Tomato, mozzarella, pepperoni",
    imageUrl: "pepperoni.jpg",
    price: 1500,
    isAvailable: true,
    category: "pizza",
  },
];

describe("Products Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ auth: { accessToken: "mock-token" } });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });
  });

  test("renders loading state initially", () => {
    render(
      <CartProvider>
        <Products />
      </CartProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders products after loading", async () => {
    render(
      <CartProvider>
        <Products />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByText("Margherita")).toBeInTheDocument();
      expect(screen.getByText("Pepperoni")).toBeInTheDocument();
    });
  });

  test("renders error message when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(
      <CartProvider>
        <Products />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test("renders unavailable product correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            ...mockProducts[0],
            isAvailable: false,
          },
          mockProducts[1],
        ]),
    });

    render(
      <CartProvider>
        <Products />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
    });
  });
});
