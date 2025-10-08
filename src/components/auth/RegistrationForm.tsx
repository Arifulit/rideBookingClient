/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Users, 
  Car, 
  Shield, 
  Calendar, 
  Palette, 
  Hash,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus
} from "lucide-react";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/features/auth/authSlice";

// Validation schema
const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    role: z.enum(["rider", "driver"], {
      message: "Please select a role",
    }),
    licenseNumber: z.string().optional(),
    vehicleMake: z.string().optional(),
    vehicleModel: z.string().optional(),
    vehicleYear: z.number().optional(),
    vehicleColor: z.string().optional(),
    plateNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "driver") {
        return data.licenseNumber && data.licenseNumber.length > 0;
      }
      return true;
    },
    {
      message: "License number is required for drivers",
      path: ["licenseNumber"],
    }
  );

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState<"rider" | "driver">("rider");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "rider",
      licenseNumber: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: undefined,
      vehicleColor: "",
      plateNumber: "",
    },
  });

  // Watch role changes
  // const watchRole = watch("role");

 const onSubmit = async (data: RegisterFormData) => {
  console.log("� ===== DRIVER REGISTRATION DEBUG START =====");
  console.log("�🔄 RegistrationForm (modules): Starting registration process");
  console.log("📝 Form Data Received:", {
    ...data,
    password: "[HIDDEN]",
    confirmPassword: "[HIDDEN]"
  });

  // Validate driver-specific fields before proceeding
  if (data.role === "driver") {
    console.log("🚗 Driver Registration Detected - Validating vehicle info...");
    
    const driverValidation = {
      licenseNumber: !!data.licenseNumber?.trim(),
      vehicleMake: !!data.vehicleMake?.trim(),
      vehicleModel: !!data.vehicleModel?.trim(),
      vehicleYear: !!data.vehicleYear && data.vehicleYear > 0,
      vehicleColor: !!data.vehicleColor?.trim(),
      plateNumber: !!data.plateNumber?.trim()
    };
    
    console.log("🔍 Driver Field Validation:", driverValidation);
    
    const missingFields = Object.entries(driverValidation)
      .filter(([, isValid]) => !isValid)
      .map(([field]) => field);
      
    if (missingFields.length > 0) {
      console.error("❌ Missing Required Driver Fields:", missingFields);
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return; // Stop registration if validation fails
    }
    
    console.log("✅ All driver fields validated successfully");
  }

  const payload: any = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: data.role,
  };

  if (data.role === "driver") {
    payload.licenseNumber = data.licenseNumber;
    payload.vehicleInfo = {
      make: data.vehicleMake,
      model: data.vehicleModel,
      year: Number(data.vehicleYear), // Ensure it's a number
      color: data.vehicleColor,
      plateNumber: data.plateNumber,
    };
    
    console.log("� Driver-Specific Payload Added:");
    console.log("🆔 License Number:", payload.licenseNumber);
    console.log("🚙 Vehicle Info:", payload.vehicleInfo);
  }

  console.log("📦 Final Registration Payload:", { 
    ...payload, 
    password: "[HIDDEN]" 
  });

  try {
    console.log("🌐 Making API Call to /auth/register...");
    const response = await register(payload).unwrap();
    
    console.log("✅ ===== REGISTRATION SUCCESS =====");
    console.log("✅ RegistrationForm (modules): Registration success response:", response);
    console.log("👤 User Created:", response.user ? {
      id: response.user.id,
      name: `${response.user.firstName} ${response.user.lastName}`,
      email: response.user.email,
      role: response.user.role
    } : "No user data");
    console.log("🔑 Tokens Provided:", response.tokens ? {
      hasAccessToken: !!response.tokens.accessToken,
      hasRefreshToken: !!response.tokens.refreshToken,
      tokenType: response.tokens.tokenType
    } : "No tokens provided");
    console.log("📧 Verification Required:", response.requiresVerification ? "YES" : "NO");
    
    // Check if backend returned tokens immediately (auto-login scenario)
    if (response.tokens && response.tokens.accessToken && response.user) {
      console.log("🔐 RegistrationForm (modules): Tokens received - performing auto-login");
      console.log("🔄 RegistrationForm (modules): Auto-login user:", { 
        userId: response.user.id, 
        userRole: response.user.role,
        hasAccessToken: !!response.tokens.accessToken 
      });
      
      // Dispatch loginSuccess to store user and tokens
      dispatch(loginSuccess({ 
        user: response.user, 
        tokens: {
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken || '',
          expiresIn: response.tokens.expiresIn || 3600,
          tokenType: response.tokens.tokenType || 'Bearer'
        },
        rememberMe: false 
      }));
      
      // Role-based redirect after successful registration + auto-login
      const userRole = response.user.role?.toLowerCase() || "rider";
      const successMessage = `Welcome, ${response.user.firstName}! Your ${data.role === 'driver' ? 'Driver' : 'Rider'} account is now active!`;
      
      console.log(`🎯 RegistrationForm (modules): Auto-login successful, redirecting ${userRole} to dashboard`);
      
      if (userRole === "admin") {
        toast.success(`✅ ${successMessage}`);
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "driver") {
        toast.success(`✅ ${successMessage}`);
        navigate("/driver/dashboard", { replace: true });
      } else {
        toast.success(`✅ ${successMessage}`);
        navigate("/rider/dashboard", { replace: true });
      }
    } else if (response.requiresVerification) {
      // Email verification required
      console.log("📧 RegistrationForm (modules): Email verification required");
      toast.success(`${data.role === 'driver' ? 'Driver' : 'Rider'} account created! Please verify your email.`);
      navigate("/verify", { state: { email: data.email } });
    } else {
      // Standard registration success without immediate tokens
      console.log("ℹ️ RegistrationForm (modules): Registration completed, no auto-login");
      toast.success(`${data.role === 'driver' ? 'Driver' : 'Rider'} account created successfully!`);
      navigate("/verify", { state: { email: data.email } });
    }
  } catch (error: any) {
    console.log("❌ ===== REGISTRATION FAILED =====");
    console.error("❌ RegistrationForm (modules): Registration error:", error);
    console.error("🔍 Error Details:");
    console.error("📊 Status Code:", error?.status);
    console.error("📝 Error Data:", error?.data);
    console.error("💬 Error Message:", error?.message);
    console.error("🌐 Original Error:", error?.originalStatus);
    
    // Check if it's a network/connection error
    if (!error?.status && !error?.data) {
      console.error("🌐 Possible Network Error - Check backend connection");
    }
    
    // Enhanced error handling with driver-specific messages
    let errorMessage = "Registration failed. Please try again.";
    
    if (error?.status === 409) {
      errorMessage = "An account with this email already exists. Please try logging in.";
    } else if (error?.status === 400) {
      if (error?.data?.message?.includes('vehicle') || error?.data?.message?.includes('license')) {
        errorMessage = `Driver registration failed: ${error.data.message}`;
        console.error("🚗 Driver-specific validation error detected");
      } else {
        errorMessage = error?.data?.message || "Invalid registration data. Please check your information.";
      }
    } else if (error?.status === 422) {
      errorMessage = "Validation failed. Please check all required fields.";
      if (data.role === "driver") {
        errorMessage += " Make sure all vehicle information is completed.";
      }
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
    toast.error(errorMessage);
    console.log("❌ ===== END REGISTRATION ERROR =====");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-gray-600 mt-2">Join our ride-sharing community</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={(e) => {
            console.log("🎯 Form Submit Event Triggered");
            console.log("⚡ Current form values:", watch());
            console.log("💾 Selected Role State:", selectedRole);
            handleSubmit(onSubmit)(e);
          }} className="space-y-6">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <span>First Name</span>
                </label>
                <input
                  {...registerField("firstName")}
                  placeholder="Rahim"
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 ${
                    errors.firstName
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">⚠️ {errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Last Name</label>
                <input
                  {...registerField("lastName")}
                  placeholder="Uddin"
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 ${
                    errors.lastName
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">⚠️ {errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Email Address</span>
              </label>
              <div className="relative">
                <input
                  {...registerField("email")}
                  type="email"
                  placeholder="rahim@gmail.com"
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">⚠️ {errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span>Phone Number</span>
              </label>
              <input
                {...registerField("phone")}
                type="tel"
                placeholder="+8801XXXXXXXXX"
                className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 ${
                  errors.phone
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-green-500'
                }`}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">⚠️ {errors.phone.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Users className="h-4 w-4 text-indigo-600" />
                <span>Choose Your Role</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    console.log("🚗 Rider button clicked!");
                    setSelectedRole("rider");
                    setValue("role", "rider");
                    console.log("✅ Set role to 'rider'");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedRole === "rider"
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white/50 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedRole === "rider" ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Rider</p>
                      <p className="text-xs text-gray-600">Book rides</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    console.log("🚚 Driver button clicked!");
                    setSelectedRole("driver");
                    setValue("role", "driver");
                    console.log("✅ Set role to 'driver'");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedRole === "driver"
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 bg-white/50 hover:border-green-300'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedRole === "driver" ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <Car className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Driver</p>
                      <p className="text-xs text-gray-600">Provide rides</p>
                    </div>
                  </div>
                </button>
              </div>
              <input
                {...registerField("role")}
                type="hidden"
              />
            </div>

            {/* Driver-specific fields */}
            {selectedRole === "driver" && (
              <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <div className="flex items-center space-x-2 text-green-700 font-semibold">
                  <Shield className="h-5 w-5" />
                  <span>Driver Information</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">License Number</label>
                  <input
                    {...registerField("licenseNumber")}
                    placeholder="DL12345678"
                    className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 ${
                      errors.licenseNumber
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-green-500'
                    }`}
                  />
                  {errors.licenseNumber && (
                    <p className="text-sm text-red-600">⚠️ {errors.licenseNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Vehicle Make</label>
                    <input
                      {...registerField("vehicleMake")}
                      placeholder="Honda"
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Vehicle Model</label>
                    <input
                      {...registerField("vehicleModel")}
                      placeholder="Civic"
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Year</span>
                    </label>
                    <input
                      {...registerField("vehicleYear")}
                      type="number"
                      placeholder="2021"
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Palette className="h-4 w-4" />
                      <span>Color</span>
                    </label>
                    <input
                      {...registerField("vehicleColor")}
                      placeholder="Black"
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>Plate Number</span>
                  </label>
                  <input
                    {...registerField("plateNumber")}
                    placeholder="Chittagong-5678"
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Lock className="h-4 w-4 text-purple-600" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  {...registerField("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 pr-12 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">⚠️ {errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  {...registerField("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 pr-12 ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">⚠️ {errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all duration-300"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}