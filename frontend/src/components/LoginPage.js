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
  const { completeOtpLogin } = useContext(AuthContext);
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
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) throw new Error("Backend URL not configured");
      const response = await fetch(`${backendUrl}/api/auth/generate-otp?user_email=${encodeURIComponent(email)}`, {
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
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) throw new Error("Backend URL not configured");
      const response = await fetch(`${backendUrl}/api/auth/verify-otp?user_email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
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
      // Start OTP login flow immediately using email
      await generateOTP(formData.email);
      setOtpData({ ...otpData, email: formData.email });
      setStep("otp");
      setOtpSent(true);
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
        // Finalize session
        completeOtpLogin(otpData.email);
        const isAdmin = otpData.email.toLowerCase() === 'dubinigroup@gmail.com';
        // Navigate after a brief success message
        setTimeout(() => {
          navigate(isAdmin ? '/admin' : '/dashboard');
        }, 1000);
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
    return otpExpiry &amp;&amp; Date.now() &gt; otpExpiry;
  };

  const getRemainingTime = () => {
    if (!otpExpiry) return 0;
    const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
    return remaining;
  };

  // OTP Step Render
  const renderOtpStep = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"&gt;
      <div className="max-w-md w-full space-y-8"&gt;
        <div&gt;
          <Link to="/" className="flex justify-center"&gt;
            <h1 className="text-3xl font-bold text-blue-400"&gt;Apex Capital</h1&gt;
          </Link&gt;
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white"&gt;
            Enter Verification Code
          </h2&gt;
          <p className="mt-2 text-center text-sm text-gray-400"&gt;
            We've sent a security code to {otpData.email}
          </p&gt;
          {getRemainingTime() &gt; 0 &amp;&amp; (
            <p className="mt-1 text-center text-xs text-green-400"&gt;
              Code expires in {Math.floor(getRemainingTime() / 60)}:{(getRemainingTime() % 60).toString().padStart(2, '0')}
            </p&gt;
          )}
        </div&gt;
        <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}&gt;
          <div&gt;
            <label htmlFor="otp" className="sr-only"&gt;
              Verification Code
            </label&gt;
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength="8"
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 bg-slate-800 placeholder-gray-400 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
              placeholder="A1234567"
              value={otpData.otp}
              onChange={(e) =&gt; setOtpData({ ...otpData, otp: formatOtpInput(e.target.value) })}
            />
            <p className="mt-1 text-xs text-gray-400 text-center"&gt;
              Enter the 8-character code (1 letter + 7 digits)
            </p&gt;
          </div&gt;

          {error &amp;&amp; (
            <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 px-4 rounded"&gt;
              {error}
            </div&gt;
          )}

          <div&gt;
            <button
              type="submit"
              disabled={isLoading || otpData.otp.length < 8}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            &gt;
              {isLoading ? (
                <div className="flex items-center"&gt;
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"&gt;</div&gt;
                  Verifying...
                </div&gt;
              ) : (
                "Verify &amp; Continue"
              )}
            </button&gt;
          </div&gt;

          <div className="text-center"&gt;
            <button
              type="button"
              onClick={resendOTP}
              disabled={isLoading || (!isOtpExpired() &amp;&amp; getRemainingTime() &gt; 540)} // Allow resend in last 60 seconds or if expired
              className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            &gt;
              {isOtpExpired() ? "Code Expired - Resend" : "Didn't receive code? Resend"}
            </button&gt;
          </div&gt;

          <div className="text-center"&gt;
            <button
              type="button"
              onClick={() =&gt; {
                setStep("login");
                setOtpData({ otp: "", email: "" });
                setError("");
              }}
              className="text-gray-400 hover:text-gray-300 text-sm"
            &gt;
              ← Back to Login
            </button&gt;
          </div&gt;
        </form&gt;
      </div&gt;
    </div&gt;
  );

  // Success Step Render
  const renderSuccessStep = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"&gt;
      <div className="max-w-md w-full space-y-8 text-center"&gt;
        <div&gt;
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6"&gt;
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /&gt;
            </svg&gt;
          </div&gt;
          <h2 className="text-3xl font-extrabold text-white mb-4"&gt;
            Welcome Back!
          </h2&gt;
          <p className="text-gray-400"&gt;
            Login successful. Redirecting to your dashboard...
          </p&gt;
          <div className="mt-4"&gt;
            <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"&gt;</div&gt;
          </div&gt;
        </div&gt;
      </div&gt;
    </div&gt;
  );

  // Render appropriate step
  if (step === "otp") return renderOtpStep();
  if (step === "success") return renderSuccessStep();

  const handleGoogleLogin = () => {
    // Mock Google login for demo purposes
    alert("Google Authentication integration will be implemented here");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"&gt;
      <div className="max-w-md w-full space-y-8"&gt;
        <div&gt;
          <Link to="/" className="flex justify-center"&gt;
            <div className="text-3xl font-bold text-white"&gt;
              <span className="text-blue-400"&gt;Apex</span&gt;Capital
            </div&gt;
          </Link&gt;
          <h2 className="mt-6 text-center text-3xl font-bold text-white"&gt;
            Sign in to your account
          </h2&gt;
          <p className="mt-2 text-center text-sm text-slate-300"&gt;
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            &gt;
              create a new account
            </Link&gt;
          </p&gt;
        </div&gt;

        <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700"&gt;
          <form className="space-y-6" onSubmit={handleSubmit}&gt;
            {error &amp;&amp; (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg"&gt;
                {error}
              </div&gt;
            )}

            <div&gt;
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2"&gt;
                Email address
              </label&gt;
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your email"
              /&gt;
            </div&gt;

            <div&gt;
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2"&gt;
                Password (you will receive a one-time code via email)
              </label&gt;
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter any placeholder password"
              /&gt;
            </div&gt;

            <div className="flex items-center justify-between"&gt;
              <div className="flex items-center"&gt;
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-slate-600 rounded bg-slate-700"
                /&gt;
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300"&gt;
                  Remember me
                </label&gt;
              </div&gt;

              <div className="text-sm"&gt;
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300 transition-colors"&gt;
                  Forgot your password?
                </a&gt;
              </div&gt;
            </div&gt;

            <div&gt;
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              &gt;
                {isLoading ? "Sending code..." : "Sign in"}
              </button&gt;
            </div&gt;
          </form&gt;

          <div className="mt-6"&gt;
            <div className="relative"&gt;
              <div className="absolute inset-0 flex items-center"&gt;
                <div className="w-full border-t border-slate-600" /&gt;
              </div&gt;
              <div className="relative flex justify-center text-sm"&gt;
                <span className="px-2 bg-slate-800 text-slate-300"&gt;Or continue with</span&gt;
              </div&gt;
            </div&gt;

            <div className="mt-6"&gt;
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              &gt;
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"&gt;
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>&#10;                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>&#10;                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>&#10;                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg&gt;
                Sign in with Google
              </button&gt;
            </div&gt;
          </div&gt;
        </div&gt;

        <div className="text-center text-sm text-slate-400"&gt;
          <p&gt;Demo Accounts:</p&gt;
          <p className="mt-1"&gt;
            <span className="text-blue-400"&gt;Investor:</span&gt; investor@example.com (OTP via email)
          </p&gt;
          <p&gt;
            <span className="text-green-400"&gt;Admin:</span&gt; dubinigroup@gmail.com (OTP via email)
          </p&gt;
        </div&gt;
      </div&gt;
    </div&gt;
  );
};

export default LoginPage;