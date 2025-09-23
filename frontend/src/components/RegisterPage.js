import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length &lt; 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Call backend to register and trigger welcome email
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) throw new Error("Backend URL not configured");
      const url = `${backendUrl}/api/users/register?user_name=${encodeURIComponent(formData.name)}&user_email=${encodeURIComponent(formData.email)}`;
      const resp = await fetch(url, { method: 'POST' });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Registration failed');
      }

      // Optionally, we could auto-login locally, but requirement is to send welcome email.
      // Redirect to login so user can sign in with OTP.
      alert('Registration successful! A welcome email has been sent. Please log in using the one-time code.');
      navigate("/login");
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Mock Google signup for demo purposes
    alert("Google Authentication integration will be implemented here");
  };

  return (
    &lt;div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"&gt;
      &lt;div className="max-w-md w-full space-y-8"&gt;
        &lt;div&gt;
          &lt;Link to="/" className="flex justify-center"&gt;
            &lt;div className="text-3xl font-bold text-white"&gt;
              &lt;span className="text-blue-400"&gt;Apex&lt;/span&gt;Capital
            &lt;/div&gt;
          &lt;/Link&gt;
          &lt;h2 className="mt-6 text-center text-3xl font-bold text-white"&gt;
            Create your account
          &lt;/h2&gt;
          &lt;p className="mt-2 text-center text-sm text-slate-300"&gt;
            Or{" "}
            &lt;Link
              to="/login"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            &gt;
              sign in to your existing account
            &lt;/Link&gt;
          &lt;/p&gt;
        &lt;/div&gt;

        &lt;div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700"&gt;
          &lt;form className="space-y-6" onSubmit={handleSubmit}&gt;
            {error &amp;&amp; (
              &lt;div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg"&gt;
                {error}
              &lt;/div&gt;
            )}

            &lt;div&gt;
              &lt;label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2"&gt;
                Full Name
              &lt;/label&gt;
              &lt;input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your full name"
              /&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2"&gt;
                Email address
              &lt;/label&gt;
              &lt;input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your email"
              /&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2"&gt;
                Password
              &lt;/label&gt;
              &lt;input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Create a password"
              /&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2"&gt;
                Confirm Password
              &lt;/label&gt;
              &lt;input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Confirm your password"
              /&gt;
            &lt;/div&gt;

            &lt;div className="flex items-center"&gt;
              &lt;input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-slate-600 rounded bg-slate-700"
              /&gt;
              &lt;label htmlFor="terms" className="ml-2 block text-sm text-slate-300"&gt;
                I agree to the{" "}
                &lt;a href="#" className="text-blue-400 hover:text-blue-300 transition-colors"&gt;
                  Terms of Service
                &lt;/a&gt;{" "}
                and{" "}
                &lt;a href="#" className="text-blue-400 hover:text-blue-300 transition-colors"&gt;
                  Privacy Policy
                &lt;/a&gt;
              &lt;/label&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              &gt;
                {isLoading ? "Creating account..." : "Create account"}
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/form&gt;

          &lt;div className="mt-6"&gt;
            &lt;div className="relative"&gt;
              &lt;div className="absolute inset-0 flex items-center"&gt;
                &lt;div className="w-full border-t border-slate-600" /&gt;
              &lt;/div&gt;
              &lt;div className="relative flex justify-center text-sm"&gt;
                &lt;span className="px-2 bg-slate-800 text-slate-300"&gt;Or continue with&lt;/span&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            &lt;div className="mt-6"&gt;
              &lt;button
                onClick={handleGoogleSignup}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              &gt;
                &lt;svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"&gt;
                  &lt;path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>&#10;                  &lt;path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>&#10;                  &lt;path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>&#10;                  &lt;path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                &lt;/svg&gt;
                Sign up with Google
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="text-center text-sm text-slate-400"&gt;
          &lt;p&gt;By creating an account, you agree to our investment terms and conditions.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default RegisterPage;