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
import config from "@/config";
import { loginSuccess } from "@/redux/features/auth/authSlice";

// Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useAppSelector((state) => state.auth);

  // 🔹 Already logged in users redirect to appropriate dashboard
  useEffect(() => {
    if (user && token) {
      console.log("🔄 User already logged in, redirecting...", user);
      const userRole = user.role?.toLowerCase() || "rider";
      
      if (userRole === "admin") {
        console.log("🔧 Already logged in Admin - redirecting to Admin Dashboard");
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "driver") {
        console.log("🚗 Already logged in Driver - redirecting to Driver Dashboard");
        navigate("/driver/dashboard", { replace: true });
      } else {
        console.log("🚖 Already logged in Rider - redirecting to Rider Dashboard");
        navigate("/rider/dashboard", { replace: true });
      }
    }
  }, [user, token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

 const onSubmit = async (data: LoginFormData) => {
  console.log("🚀 ===== LOGIN PROCESS START =====");
  console.log("📧 Login Email:", data.email);
  
  try {
    console.log("🌐 Sending login request to backend...");
    const response = await login(data).unwrap();
    
    console.log("✅ ===== LOGIN SUCCESS =====");
    
    // 🚨 PROMINENT ACCESS TOKEN DISPLAY
    if (response?.tokens?.accessToken) {
      console.log("🔥🔥🔥 ===== LOGIN ACCESS TOKEN FOUND ===== 🔥🔥🔥");
      console.log("🎯 ACCESS TOKEN:", response.tokens.accessToken);
      console.log("🔄 REFRESH TOKEN:", response.tokens.refreshToken);
      console.log("⏰ TOKEN EXPIRES IN:", response.tokens.expiresIn, "seconds");
      console.log("🏷️ TOKEN TYPE:", response.tokens.tokenType);
      console.log("🔥🔥🔥 ===== END LOGIN ACCESS TOKEN ===== 🔥🔥🔥");
      
      //  TABLE VIEW OF TOKEN INFO
      console.table({
        "Access Token": response.tokens.accessToken,
        "Refresh Token": response.tokens.refreshToken,
        "Expires In (seconds)": response.tokens.expiresIn,
        "Token Type": response.tokens.tokenType,
        "User Name": `${response.user.firstName} ${response.user.lastName}`,
        "User Role": response.user.role
      });
    } else {
      console.log("❌ NO ACCESS TOKEN FOUND IN LOGIN RESPONSE");
    }
    
    console.log("✅ Raw Login Response:", response);
    
    // Auth API returns: { user: User, tokens: AuthTokens, message: string }
    console.log("📦 Login Response Structure:", response);
    
    console.log("🎫 ===== LOGIN TOKEN DETAILED ANALYSIS =====");
    console.log("🔍 Full Response Object:", JSON.stringify(response, null, 2));
    console.log("🔍 Tokens Object Present:", !!response.tokens);
    
    // Extract user and token from direct response structure
    const user = response.user;
    const token = response.tokens?.accessToken;
    const refreshToken = response.tokens?.refreshToken;
    
    console.log("👤 Extracted User:", user ? {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role
    } : "No user found");
    
    if (response.tokens) {
      console.log("🔑 === TOKEN BREAKDOWN ===");
      console.log("🎯 Access Token FULL:", response.tokens.accessToken);
      console.log("🔄 Refresh Token FULL:", response.tokens.refreshToken);
      console.log("⏰ Expires In:", response.tokens.expiresIn);
      console.log("🏷️ Token Type:", response.tokens.tokenType);
      console.log("📏 Access Token Length:", response.tokens.accessToken?.length);
      console.log("📏 Refresh Token Length:", response.tokens.refreshToken?.length);
      console.log("🔑 === END TOKEN BREAKDOWN ===");
    } else {
      console.log("❌ NO TOKENS OBJECT FOUND IN RESPONSE");
    }
    
    console.log("🔑 Token Extraction Results:", {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken,
      tokenSource: token ? 'tokens.accessToken' : 'none'
    });
    console.log("🎫 ===== END LOGIN TOKEN ANALYSIS =====");

    console.log("🔑 Token Extraction Results:", {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken,
      tokenSource: token ? 'tokens.accessToken' : 'none'
    });

    if (user && token) {
      console.log("✅ Authentication successful - storing credentials");
      
      // 💾 COMPLETE LOGIN TOKEN STORAGE LOG
      console.log("💾 ===== REDUX TOKEN STORAGE =====");
      console.log("🎫 Complete Token Object for Redux:", { token, refreshToken });
      console.log("🎯 AccessToken FULL for Redux:", token);
      console.log("🔄 RefreshToken FULL for Redux:", refreshToken || 'Not provided');
      console.log("📏 Token Length Check:", token?.length);
      
      const tokenPayload = {
        user,
        tokens: {
          accessToken: token,
          refreshToken: refreshToken || '',
          expiresIn: response.tokens?.expiresIn || 3600,
          tokenType: response.tokens?.tokenType || 'Bearer'
        },
        rememberMe: false
      };
      
      console.log("📦 Complete Redux Payload:", JSON.stringify(tokenPayload, null, 2));
      
      // Dispatch login success action
      dispatch(loginSuccess(tokenPayload));
      
      console.log("✅ Credentials dispatched to Redux");
      
      // 🔍 VERIFY TOKEN STORAGE IN LOCALSTORAGE
      setTimeout(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        console.log("🔍 ===== LOCALSTORAGE VERIFICATION =====");
        console.log("📱 STORED ACCESS TOKEN:", storedToken);
        console.log("📱 STORED REFRESH TOKEN:", storedRefreshToken);
        console.log("✅ TOKEN SUCCESSFULLY STORED:", !!storedToken);
        console.log("🔍 ===== END LOCALSTORAGE VERIFICATION =====");
      }, 100);
      
      console.log("💾 ===== END REDUX TOKEN STORAGE =====");
      
      // Role-based redirect with success messages
      const userRole = user.role?.toLowerCase() || "rider";
      console.log(`🎯 Redirecting ${userRole} user to appropriate dashboard`);
      
      if (userRole === "admin") {
        const adminMessage = `✅ Login Successful! Welcome Admin ${user.firstName || 'User'}!`;
        
        console.log("🎊 SHOWING ADMIN LOGIN SUCCESS TOAST:", adminMessage);
        toast.success(adminMessage, {
          duration: 4000,
        });
        
        console.log("🎊 ADMIN LOGIN SUCCESS TOAST DISPLAYED!");
        console.log("🔧 Redirecting to Admin Dashboard");
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "driver") {
        const driverMessage = `✅ Login Successful! Welcome Driver ${user.firstName || 'User'}!`;
        
        console.log("🎊 SHOWING DRIVER LOGIN SUCCESS TOAST:", driverMessage);
        toast.success(driverMessage, {
          duration: 4000,
        });
        
        console.log("🎊 DRIVER LOGIN SUCCESS TOAST DISPLAYED!");
        console.log("🚗 Redirecting to Driver Dashboard");
        navigate("/driver/dashboard", { replace: true });
      } else {
        const userMessage = `Welcome back, ${user.firstName || 'User'}!`;
        
        console.log("🎊 SHOWING USER LOGIN SUCCESS TOAST:", userMessage);
        toast.success(userMessage, {
          duration: 4000,
        });
        
        console.log("🎊 USER LOGIN SUCCESS TOAST DISPLAYED!");
        console.log("🚖 Redirecting to Rider Dashboard");
        navigate("/rider/dashboard", { replace: true });
      }
    } else {
      console.log("❌ ===== LOGIN DATA INCOMPLETE =====");
      console.log("❌ Missing Data Analysis:");
      console.log("👤 User Present:", !!user);
      console.log("🔑 Token Present:", !!token);
      console.log("📦 Full Response Structure:", JSON.stringify(response, null, 2));
      
      if (!user && !token) {
        console.log("❌ SHOWING NO USER/TOKEN ERROR TOAST");
        toast.error("Backend returned no user or authentication token!", {
          duration: 5000,
        });
        
        console.log("❌ NO USER/TOKEN ERROR TOAST DISPLAYED!");
      } else if (!user) {
        console.log("❌ SHOWING NO USER INFO ERROR TOAST");
        toast.error("Backend returned no user information!", {
          duration: 5000,
        });
        
        console.log("❌ NO USER INFO ERROR TOAST DISPLAYED!");
      } else if (!token) {
        console.log("❌ SHOWING NO TOKEN ERROR TOAST");
        toast.error("Backend returned no authentication token!", {
          duration: 5000,
        });
        
        console.log("❌ NO TOKEN ERROR TOAST DISPLAYED!");
      }
    }
  } catch (error: any) {
    console.log("❌ ===== LOGIN FAILED =====");
    console.error("❌ Login Error:", error);
    console.error("📊 Error Status:", error?.status);
    console.error("📝 Error Data:", error?.data);
    console.error("💬 Error Message:", error?.message);
    
    // Enhanced error handling
    let errorMessage = "Login failed. Please try again.";
    
    if (error?.status === 401) {
      errorMessage = "Invalid email or password. Please check your credentials.";
    } else if (error?.status === 403) {
      errorMessage = "Account access denied. Please contact support.";
    } else if (error?.status === 404) {
      errorMessage = "Account not found. Please check your email or register first.";
    } else if (error?.status === 429) {
      errorMessage = "Too many login attempts. Please try again later.";
    } else if (error?.status >= 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (error?.data?.message) {
      errorMessage = error.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (!navigator.onLine) {
      errorMessage = "No internet connection. Please check your network.";
    }
    
    console.error("📢 Final Error Message:", errorMessage);
    console.log("❌ SHOWING LOGIN ERROR TOAST:", errorMessage);
    toast.error(errorMessage, {
      duration: 5000,
    });
    
    console.log("❌ LOGIN ERROR TOAST DISPLAYED!");
    console.log("❌ ===== END LOGIN ERROR =====");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Animated Elements - Adaptive to theme */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full blur-3xl animate-pulse dark:from-primary/20 dark:to-primary/30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-primary/5 via-secondary/5 to-accent/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Premium Card with Enhanced Glass Effect - Theme Adaptive */}
        <div className="glass rounded-3xl shadow-2xl p-8 space-y-8 relative overflow-hidden animate-fade-in">
          {/* Subtle gradient overlay - Theme adaptive */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl"></div>
          
          {/* Header with Enhanced Branding - Theme Adaptive */}
          <div className="text-center space-y-6 relative z-10">
            {/* Premium Logo Design - Theme Adaptive */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-3xl flex items-center justify-center shadow-2xl relative group transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Lock className="h-10 w-10 text-primary-foreground relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-3xl dark:from-white/10"></div>
            </div>
            
            {/* Premium Typography - Theme Adaptive */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold gradient-text leading-tight">
                Welcome Back
              </h1>
              <p className="text-muted-foreground text-lg font-medium">Sign in to your premium account</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Premium Form - Theme Adaptive */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            {/* Premium Email Field - Theme Adaptive */}
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
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      : 'focus:ring-primary/20 group-hover:border-primary/50'
                  }`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300">
                  <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-focus-within:from-primary/5 group-focus-within:via-primary/3 group-focus-within:to-primary/5 transition-all duration-500 -z-10"></div>
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center space-x-2 font-medium">
                  <span className="text-destructive">⚠️</span>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Premium Password Field - Theme Adaptive */}
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
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      : 'focus:ring-primary/20 group-hover:border-primary/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-all duration-300 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-focus-within:from-primary/5 group-focus-within:via-primary/3 group-focus-within:to-primary/5 transition-all duration-500 -z-10"></div>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center space-x-2 font-medium">
                  <span className="text-destructive">⚠️</span>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Premium Submit Button - Theme Adaptive */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-5 mt-8 font-bold text-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
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

          {/* Premium Divider - Theme Adaptive */}
          <div className="relative flex items-center my-8">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 px-6 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm rounded-full border border-border font-medium">
              Or continue with
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Premium Google Login - Theme Adaptive */}
          <button
            onClick={() => window.open(`${config.baseUrl}/auth/google`, "_self")}
            type="button"
            className="btn-secondary w-full py-4 border-2 border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-500 transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-3 group relative overflow-hidden"
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-primary/5 transition-all duration-500 rounded-2xl"></div>
            
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg relative z-10">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="relative z-10 font-bold">Continue with Google</span>
          </button>

          {/* Enhanced Registration Section */}
          <div className="space-y-4 pt-6">
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">
                  Or
                </span>
              </div>
            </div>

            {/* Registration Button */}
            <Link to="/register" replace>
              <button 
                type="button"
                className="w-full group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500"></div>
                
                <div className="relative flex items-center justify-center space-x-3">
                  <User className="w-5 h-5" />
                  <span>Create New Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </Link>

            {/* Additional info */}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account? 
              <span className="text-primary font-semibold"> Join for free!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
