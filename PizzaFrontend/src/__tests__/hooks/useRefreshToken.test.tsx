import { renderHook, act } from "@testing-library/react-hooks";
import useRefreshToken from "../../hooks/useRefreshToken";
import axios from "axios";
import * as AuthHook from "../../hooks/UseAuth";
import parseJwt from "../../utils/utils";

// Mock dependencies
jest.mock("axios");
jest.mock("../../hooks/UseAuth");
jest.mock("../../utils/utils");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockUseAuth = AuthHook.default as jest.Mock;
const mockParseJwt = parseJwt as jest.Mock;

describe("useRefreshToken hook", () => {
  const mockSetAuth = jest.fn();

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
    mockUseAuth.mockReturnValue({ auth: {}, setAuth: mockSetAuth });
    localStorage.getItem = jest
      .fn()
      .mockReturnValueOnce("mock-access-token") // accessToken
      .mockReturnValueOnce("mock-refresh-token"); // refreshToken
    mockParseJwt.mockReturnValue({ role: "User" });
  });

  test("should skip refresh if tokens are missing", async () => {
    localStorage.getItem = jest.fn().mockReturnValue(null);

    const { result } = renderHook(() => useRefreshToken());

    let output;
    await act(async () => {
      output = await result.current();
    });

    expect(output).toBeNull();
    expect(localStorage.getItem).toHaveBeenCalledWith("accessToken");
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  test("should successfully refresh token", async () => {
    const mockResponse = {
      data: {
        token: "new-access-token",
        refreshToken: "new-refresh-token",
        TokenExpiration: "2023-12-31T00:00:00.000Z",
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useRefreshToken());

    let output;
    await act(async () => {
      output = await result.current();
    });

    expect(output).toBe("new-access-token");
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/account/refresh-token"),
      {
        token: "mock-access-token",
        refreshToken: "mock-refresh-token",
      },
      expect.any(Object)
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "accessToken",
      "new-access-token"
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "refreshToken",
      "new-refresh-token"
    );
    expect(mockSetAuth).toHaveBeenCalled();
  });

  test("should handle API error and return stored token for non-critical errors", async () => {
    const mockError = {
      response: {
        status: 400,
        data: "Bad request",
      },
    };

    mockedAxios.post.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useRefreshToken());

    let output;
    await act(async () => {
      output = await result.current();
    });

    expect(output).toBe("mock-access-token");
    expect(localStorage.removeItem).not.toHaveBeenCalled();
  });

  test("should handle critical API error and clear tokens", async () => {
    const mockError = {
      response: {
        status: 401,
        data: "Unauthorized",
      },
    };

    mockedAxios.post.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useRefreshToken());

    let output;
    await act(async () => {
      output = await result.current();
    });

    expect(output).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith("accessToken");
    expect(localStorage.removeItem).toHaveBeenCalledWith("refreshToken");
  });
});
