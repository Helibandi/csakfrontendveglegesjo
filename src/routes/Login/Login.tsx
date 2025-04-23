import React, { useState, useRef, useEffect } from "react";
import "./Login.css";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/backend-conf";
//import { useAuth } from '../../context/AuthContext';
import useAuth from "../../hooks/UseAuth.ts";
import parseJwt from "../../utils/utils";

const Login = () => {
  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef<any>(null);
  const errRef = useRef<any>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [error] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrorMessage("");
  }, [email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // Handle different error status codes
        if (res.status === 401) {
          setErrorMessage("Invalid email or password. Please try again.");
          return;
        }

        // Try to parse error message from response
        try {
          const errorData = await res.json();
          // Check common error patterns in the API response
          if (
            errorData.error === "invalid_credentials" ||
            errorData.title?.includes("Invalid") ||
            errorData.errors?.Password
          ) {
            setErrorMessage("Invalid email or password. Please try again.");
          } else if (errorData.message) {
            setErrorMessage(errorData.message);
          } else if (errorData.title) {
            setErrorMessage(errorData.title);
          } else {
            setErrorMessage("Login failed. Please try again.");
          }
        } catch (parseError) {
          // If response is not valid JSON
          setErrorMessage("Unable to login. Please try again later.");
        }
        return;
      }

      const data = await res.json();
      const parsedToken = parseJwt(data.token);

      const newAuth = {
        accessToken: data.token,
        refreshToken: data.refreshToken,
        tokenExpiration: data.tokenExpiration || new Date().toISOString(),
        role: Array.isArray(parsedToken.role)
          ? parsedToken.role
          : [parsedToken.role],
      };

      setAuth(newAuth);

      localStorage.setItem("accessToken", newAuth.accessToken);
      localStorage.setItem("refreshToken", newAuth.refreshToken);
      localStorage.setItem("role", newAuth.role.join(","));
      localStorage.setItem("useralldata", JSON.stringify(parsedToken));

      console.log("Login successful:", newAuth);

      navigate(from, { replace: true });
    } catch (err: any) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Login failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Please sign in to continue</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}
          <div
            ref={errRef}
            className={errorMessage ? "errmsg" : "offscreen"}
            aria-live="assertive"
          >
            {errorMessage}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              ref={userRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/*      <div className="form-options">
                <div className="forgot-password">
                  <a href="#">Forgot password?</a>
                </div>
              </div>  */}

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="register-link">
          <p>
            Don't have an account? <a href="/register">Register now</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
