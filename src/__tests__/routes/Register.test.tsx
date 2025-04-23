import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../../routes/Register/Register";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/backend-conf";

// Mock modules
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.location
const mockNavigate = jest.fn();
Object.defineProperty(window, "location", {
  value: {
    href: jest.fn(),
  },
  writable: true,
});

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = mockNavigate;
  });

  test("renders register form", () => {
    render(<Register />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
  });

  test("validates email format", () => {
    render(<Register />);

    const emailInput = screen.getByLabelText(/Email Address/i);

    fireEvent.focus(emailInput);
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    fireEvent.blur(emailInput);

    expect(
      screen.getByText(/Please enter a valid email address/i)
    ).toBeVisible();

    fireEvent.change(emailInput, { target: { value: "valid@email.com" } });
    fireEvent.blur(emailInput);

    expect(
      screen.queryByText(/Please enter a valid email address/i)
    ).not.toBeVisible();
  });

  test("validates password requirements", () => {
    render(<Register />);

    const passwordInput = screen.getByLabelText(/^Password/i);

    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: "weak" } });
    fireEvent.blur(passwordInput);

    expect(screen.getByText(/12 to 24 characters/i)).toBeVisible();

    fireEvent.change(passwordInput, {
      target: { value: "StrongPassword123!" },
    });
    fireEvent.blur(passwordInput);

    expect(screen.queryByText(/12 to 24 characters/i)).not.toBeVisible();
  });

  test("validates password confirmation", () => {
    render(<Register />);

    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);

    fireEvent.change(passwordInput, {
      target: { value: "StrongPassword123!" },
    });
    fireEvent.focus(confirmInput);
    fireEvent.change(confirmInput, {
      target: { value: "DifferentPassword123!" },
    });
    fireEvent.blur(confirmInput);

    expect(
      screen.getByText(/Must match the first password input field/i)
    ).toBeVisible();

    fireEvent.change(confirmInput, { target: { value: "StrongPassword123!" } });
    fireEvent.blur(confirmInput);

    expect(
      screen.queryByText(/Must match the first password input field/i)
    ).not.toBeVisible();
  });

  test("submits registration form successfully", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(<Register />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "StrongPassword123!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "StrongPassword123!" },
    });
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: "Anytown" },
    });
    fireEvent.change(screen.getByLabelText(/Postal Code/i), {
      target: { value: "12345" },
    });

    // Submit the form
    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/account/register`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.any(String),
        })
      );
      expect(toast.success).toHaveBeenCalled();
    });
  });

  test("handles registration error", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        text: () =>
          Promise.resolve(
            JSON.stringify([
              {
                code: "DuplicateUserName",
                description: "Username is already taken.",
              },
            ])
          ),
      })
    );

    render(<Register />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "StrongPassword123!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "StrongPassword123!" },
    });
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: "Anytown" },
    });
    fireEvent.change(screen.getByLabelText(/Postal Code/i), {
      target: { value: "12345" },
    });

    // Submit the form
    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(
        screen.getByText(/email address is already registered/i)
      ).toBeInTheDocument();
    });
  });
});
