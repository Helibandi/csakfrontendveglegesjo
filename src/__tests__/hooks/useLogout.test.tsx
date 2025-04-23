import { renderHook, act } from "@testing-library/react-hooks";
import useLogout from "../../hooks/useLogout";
import * as AuthHook from "../../hooks/UseAuth";
import * as CartContext from "../../context/CartContext";

jest.mock("../../hooks/UseAuth");
jest.mock("../../context/CartContext");

const mockUseAuth = AuthHook.default as jest.Mock;
const mockUseCart = CartContext.useCart as jest.Mock;

describe("useLogout hook", () => {
  const mockSetAuth = jest.fn();
  const mockClearCart = jest.fn();

  beforeEach(() => {
    // Setup localStorage mock
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    // Reset mocks
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ setAuth: mockSetAuth });
    mockUseCart.mockReturnValue({ clearCart: mockClearCart });
  });

  test("should clear auth context, localStorage tokens, and cart on logout", async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockSetAuth).toHaveBeenCalledWith({});
    expect(localStorage.removeItem).toHaveBeenCalledWith("accessToken");
    expect(localStorage.removeItem).toHaveBeenCalledWith("refreshToken");
    expect(localStorage.removeItem).toHaveBeenCalledWith("tokenExpiration");
    expect(localStorage.removeItem).toHaveBeenCalledWith("role");
    expect(mockClearCart).toHaveBeenCalled();
  });
});
