
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hook";
import { loginSuccess } from "@/redux/features/auth/authSlice";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user && token) {
      const userRole = user.role?.toLowerCase() || "rider";
      if (userRole === "admin") navigate("/admin/dashboard", { replace: true });
      else if (userRole === "driver") navigate("/driver/dashboard", { replace: true });
      else navigate("/rider/dashboard", { replace: true });
    }
  }, [user, token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data).unwrap();
      const user = response.user;
      const token = response.tokens?.accessToken;
      const refreshToken = response.tokens?.refreshToken;

      if (user && token) {
        const tokenPayload = {
          user,
          tokens: {
            accessToken: token,
            refreshToken: refreshToken || "",
            expiresIn: response.tokens?.expiresIn || 3600,
            tokenType: response.tokens?.tokenType || "Bearer",
          },
          rememberMe: false,
        };

        dispatch(loginSuccess(tokenPayload));

        const userRole = user.role?.toLowerCase() || "rider";
        const message = `Welcome back, ${user.firstName || "User"}!`;

        toast.success(message, { duration: 4000 });

        if (userRole === "admin") navigate("/admin/dashboard", { replace: true });
        else if (userRole === "driver") navigate("/driver/dashboard", { replace: true });
        else navigate("/rider/dashboard", { replace: true });
      } else {
        toast.error("Invalid response from server. Please try again.", { duration: 5000 });
      }
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";

      if (error?.status === 401) errorMessage = "Invalid email or password.";
      else if (error?.status === 403) errorMessage = "Access denied. Please contact support.";
      else if (error?.status === 404) errorMessage = "Account not found. Please register first.";
      else if (error?.status === 429) errorMessage = "Too many login attempts. Try again later.";
      else if (error?.status >= 500) errorMessage = "Server error. Please try again later.";
      else if (error?.data?.message) errorMessage = error.data.message;
      else if (error?.message) errorMessage = error.message;
      else if (!navigator.onLine) errorMessage = "No internet connection.";

      toast.error(errorMessage, { duration: 5000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full blur-3xl animate-pulse dark:from-primary/20 dark:to-primary/30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-primary/5 via-secondary/5 to-accent/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl shadow-2xl p-8 space-y-8 relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl"></div>

          <div className="text-center space-y-6 relative z-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-3xl flex items-center justify-center shadow-2xl relative group transition-all duration-300">
              <Lock className="h-10 w-10 text-primary-foreground relative z-10" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold gradient-text leading-tight">Welcome Back</h1>
              <p className="text-muted-foreground text-lg font-medium">Sign in to your account</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <label htmlFor="email" className="text-sm font-bold text-foreground flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <span>Email Address</span>
              </label>
              <div className="relative group">
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className={`input-field w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-500 font-medium ${
                    errors.email
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "focus:ring-primary/20 group-hover:border-primary/50"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="text-sm font-bold text-foreground flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <span>Password</span>
              </label>
              <div className="relative group">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your secure password"
                  className={`input-field w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-500 font-medium pr-14 ${
                    errors.password
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "focus:ring-primary/20 group-hover:border-primary/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-all duration-300 p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && (
                  <p className="text-sm text-destructive font-medium">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-5 mt-8 font-bold text-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  <span>Sign In to Your Account</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </button>
          </form>

          <div className="space-y-4 pt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">Or</span>
              </div>
            </div>

            <Link to="/register" replace>
              <button
                type="button"
                className="w-full group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg"
              >
                <div className="relative flex items-center justify-center space-x-3">
                  <User className="w-5 h-5" />
                  <span>Create New Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </Link>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <span className="text-primary font-semibold">Join for free!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
