import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../../utils/backend-conf";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import "./Register.css";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%_]).{12,24}$/;

interface RegistrationForm {
  Email: string;
  FirstName: string;
  LastName: string;
  Address: string;
  City: string;
  PostalCode: string;
  PhoneNumber: string;
  Password: string;
  ConfirmPassword: string;
}

const Register = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [formData, setFormData] = useState<RegistrationForm>({
    Email: "",
    FirstName: "",
    LastName: "",
    Address: "",
    City: "",
    PostalCode: "",
    PhoneNumber: "",
    Password: "",
    ConfirmPassword: "",
  });

  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [validPassword, setValidPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(formData.Email));
  }, [formData.Email]);

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(formData.Password));
    setValidMatch(formData.Password === formData.ConfirmPassword);
  }, [formData.Password, formData.ConfirmPassword]);

  useEffect(() => {
    setErrMsg("");
  }, [formData.Email, formData.Password, formData.ConfirmPassword]);

  // Add function to handle direct navigation with page refresh
  const navigateWithRefresh = (path: string) => {
    window.location.href = path; // This will cause a full page refresh
  };

  // Add effect to clean up any potentially problematic state on component unmount
  useEffect(() => {
    return () => {
      // Remove any temporary registration data from localStorage/sessionStorage
      sessionStorage.removeItem("registrationData");
      sessionStorage.removeItem("emailValidation");
      // Other cleanup if needed
    };
  }, []);

  const handleEmailBlur = () => {
    setEmailFocus(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const v1 = EMAIL_REGEX.test(formData.Email);
    const v2 = PWD_REGEX.test(formData.Password);

    if (!v1 || !v2) {
      setErrMsg("Invalid Entry");
      return;
    }

    const requestData = {
      Email: formData.Email,
      Password: formData.Password,
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      Address: formData.Address,
      City: formData.City,
      PostalCode: formData.PostalCode,
      PhoneNumber: formData.PhoneNumber,
    };

    console.log("Submitting registration with data:", {
      ...requestData,
      Password: "********",
    });

    try {
      const response = await fetch(`${BASE_URL}/api/account/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Registration failed (${response.status})`;

        try {
          const errorData = JSON.parse(errorText);

          if (Array.isArray(errorData) && errorData.length > 0) {
            const duplicateError = errorData.find(
              (err) => err.code === "DuplicateUserName"
            );
            if (duplicateError) {
              errorMessage =
                "This email address is already registered. Please use a different email or sign in.";
            } else {
              errorMessage = errorData.map((err) => err.description).join(", ");
            }
          } else if (errorData.errors) {
            errorMessage = Object.entries(errorData.errors)
              .map(([field, errors]) => `${field}: ${errors}`)
              .join(", ");
          } else if (errorData.message || errorData.title) {
            errorMessage = errorData.message || errorData.title;
          }
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        console.error("Registration error details:", {
          status: response.status,
          errorType: "Registration error",
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Registration successful:", data);
      toast.success("Registration successful! Please sign in.", {
        autoClose: 4000,
      });
      setSuccess(true);
      setFormData({
        Email: "",
        FirstName: "",
        LastName: "",
        Address: "",
        City: "",
        PostalCode: "",
        PhoneNumber: "",
        Password: "",
        ConfirmPassword: "",
      });
      setTimeout(() => {
        // Use direct navigation instead of React Router navigation to force refresh
        window.location.href = "/login";
      }, 6000);
    } catch (err: any) {
      if (!err?.response && err instanceof Error) {
        setErrMsg(err.message || "No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Email already registered");
      } else {
        setErrMsg(err.message || "Registration Failed");
      }
      errRef.current?.focus();
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Fill in your details to register</p>
        </div>

        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>

        {success ? (
          <section>
            <h2>
              Success! You will be redirected to the login page in 5 seconds!
            </h2>
            <p>
              {/* Replace Link with button that forces refresh */}
              <button
                onClick={() => navigateWithRefresh("/login")}
                className="sign-in-button"
              >
                Sign In
              </button>
            </p>
          </section>
        ) : (
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="Email">
                Email Address
                <span className={validEmail ? "valid" : "hide"}>
                  <CheckIcon className="check-icon" />
                </span>
                <span
                  className={validEmail || !formData.Email ? "hide" : "invalid"}
                >
                  <RemoveCircleOutlineIcon className="error-icon" />
                </span>
              </label>
              <input
                type="email"
                id="Email"
                name="Email"
                ref={emailRef}
                autoComplete="off"
                onChange={handleChange}
                value={formData.Email}
                required
                aria-invalid={validEmail ? "false" : "true"}
                aria-describedby="emailnote"
                onFocus={() => setEmailFocus(true)}
                onBlur={handleEmailBlur}
              />
              <p
                id="emailnote"
                className={
                  emailFocus && !validEmail ? "instructions" : "offscreen"
                }
              >
                Please enter a valid email address.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="Password">
                Password
                <span className={validPassword ? "valid" : "hide"}>
                  <CheckIcon className="check-icon" />
                </span>
                <span
                  className={
                    validPassword || !formData.Password ? "hide" : "invalid"
                  }
                >
                  <RemoveCircleOutlineIcon className="error-icon" />
                </span>
              </label>
              <input
                type="password"
                id="Password"
                name="Password"
                onChange={handleChange}
                value={formData.Password}
                required
                aria-invalid={validPassword ? "false" : "true"}
                aria-describedby="pwdnote"
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
              />
              <p
                id="pwdnote"
                className={
                  passwordFocus && !validPassword ? "instructions" : "offscreen"
                }
              >
                <span>12 to 24 characters.</span>
                <span>
                  Must include uppercase and lowercase letters, a number and a
                  special character.
                </span>
                <span>Allowed special characters: ! @ # $ %</span>
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="ConfirmPassword">
                Confirm Password
                <span
                  className={
                    validMatch && formData.ConfirmPassword ? "valid" : "hide"
                  }
                >
                  <CheckIcon className="check-icon" />
                </span>
                <span
                  className={
                    validMatch || !formData.ConfirmPassword ? "hide" : "invalid"
                  }
                >
                  <RemoveCircleOutlineIcon className="error-icon" />
                </span>
              </label>
              <input
                type="password"
                id="ConfirmPassword"
                name="ConfirmPassword"
                onChange={handleChange}
                value={formData.ConfirmPassword}
                required
                aria-invalid={validMatch ? "false" : "true"}
                aria-describedby="confirmnote"
                onFocus={() => setMatchFocus(true)}
                onBlur={() => setMatchFocus(false)}
              />
              <p
                id="confirmnote"
                className={
                  matchFocus && !validMatch ? "instructions" : "offscreen"
                }
              >
                Must match the first password input field.
              </p>
            </div>

            <div className="name-fields">
              <div className="form-group">
                <label htmlFor="FirstName">First Name</label>
                <input
                  type="text"
                  id="FirstName"
                  name="FirstName"
                  autoComplete="given-name"
                  required
                  value={formData.FirstName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="LastName">Last Name</label>
                <input
                  type="text"
                  id="LastName"
                  name="LastName"
                  autoComplete="family-name"
                  required
                  value={formData.LastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="PhoneNumber">Phone Number</label>
              <input
                type="tel"
                id="PhoneNumber"
                name="PhoneNumber"
                autoComplete="tel"
                required
                value={formData.PhoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="Address">Address</label>
              <input
                type="text"
                id="Address"
                name="Address"
                autoComplete="street-address"
                required
                value={formData.Address}
                onChange={handleChange}
              />
            </div>

            <div className="location-fields">
              <div className="form-group">
                <label htmlFor="City">City</label>
                <input
                  type="text"
                  id="City"
                  name="City"
                  autoComplete="address-level2"
                  required
                  value={formData.City}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="PostalCode">Postal Code</label>
                <input
                  type="text"
                  id="PostalCode"
                  name="PostalCode"
                  autoComplete="postal-code"
                  required
                  value={formData.PostalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={!validEmail || !validMatch || !validPassword}
            >
              Register
            </button>

            {/* Replace Link with button that forces refresh */}
            <button
              type="button"
              className="login-link"
              onClick={() => navigateWithRefresh("/login")}
            >
              Already have an account? Sign in
            </button>
          </form>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;
