import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [otpData, setOtpData] = useState({
    otp: "",
    email: ""
  });
  const [step, setStep] = useState("login"); // "login", "otp", "success"
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOtpChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value
    });
  };

  const generateOTP = async (email) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/auth/generate-otp?user_email=${email}`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        setOtpExpiry(Date.now() + (result.expires_in * 1000));
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate OTP');
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/auth/verify-otp?user_email=${email}&otp=${otp}`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        return result.valid;
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // First step: verify basic credentials
      const success = login(formData.email, formData.password);
      if (success) {
        // Generate and send OTP
        await generateOTP(formData.email);
        setOtpData({ ...otpData, email: formData.email });
        setStep("otp");
        setOtpSent(true);
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Verify OTP
      const isValid = await verifyOTP(otpData.email, otpData.otp);
      if (isValid) {
        setStep("success");
        // Navigate after a brief success message
        setTimeout(() => {
          // Navigation will be handled by the routing logic in App.js
          navigate('/');
        }, 1500);
      } else {
        setError("Invalid or expired OTP code");
      }
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      await generateOTP(otpData.email);
      setOtpExpiry(Date.now() + 600000); // 10 minutes
      alert("New OTP sent to your email!");
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const formatOtpInput = (value) => {
    // Format OTP input to match expected pattern (1 letter + 7 digits)
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length <= 8) {
      return cleaned;
    }
    return cleaned.substring(0, 8);
  };

  const isOtpExpired = () => {
    return otpExpiry && Date.now() > otpExpiry;
  };

  const getRemainingTime = () => {
    if (!otpExpiry) return 0;
    const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
    return remaining;
  };

  // OTP Step Render
  const renderOtpStep = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-blue-400">Apex Capital</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Enter Verification Code
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            We've sent a security code to {otpData.email}
          </p>
          {getRemainingTime() > 0 && (
            <p className="mt-1 text-center text-xs text-green-400">
              Code expires in {Math.floor(getRemainingTime() / 60)}:{(getRemainingTime() % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength="8"
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 bg-slate-800 placeholder-gray-400 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
              placeholder="A1234567"
              value={otpData.otp}
              onChange={(e) => setOtpData({ ...otpData, otp: formatOtpInput(e.target.value) })}
            />
            <p className="mt-1 text-xs text-gray-400 text-center">
              Enter the 8-character code (1 letter + 7 digits)
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 px-4 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || otpData.otp.length < 8}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Verify & Continue"
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={resendOTP}
              disabled={isLoading || (!isOtpExpired() && getRemainingTime() > 540)} // Allow resend in last 60 seconds or if expired
              className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOtpExpired() ? "Code Expired - Resend" : "Didn't receive code? Resend"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep("login");
                setOtpData({ otp: "", email: "" });
                setError("");
              }}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              ← Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Success Step Render
  const renderSuccessStep = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Welcome Back!
          </h2>
          <p className="text-gray-400">
            Login successful. Redirecting to your dashboard...
          </p>
          <div className="mt-4">
            <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render appropriate step
  if (step === "otp") return renderOtpStep();
  if (step === "success") return renderSuccessStep();

  const handleGoogleLogin = () => {
    // Mock Google login for demo purposes
    alert("Google Authentication integration will be implemented here");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <div className="text-3xl font-bold text-white">
              <span className="text-blue-400">Apex</span>Capital
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-slate-600 rounded bg-slate-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-300">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-slate-400">
          <p>Demo Accounts:</p>
          <p className="mt-1">
            <span className="text-blue-400">Investor:</span> investor@example.com / password123
          </p>
          <p>
            <span className="text-green-400">Admin:</span> admin@apexcapital.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;