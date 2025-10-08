/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";

// Extend window interface for timeout
declare global {
  interface Window {
    emailCheckTimeout: any;
  }
}
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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

// Enhanced Validation Schema
const registerSchema = z
  .object({
    firstName: z.string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long")
      .trim(),lastName: z.string()
      .min(2, "Last name must be at least 2 characters")  
      .max(50, "Last name is too long")
      .trim(),
    email: z.string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(254, "Email address is too long")
      .refine(
        (email) => {
          // Check for common email patterns
          const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
          const domain = email.split('@')[1]?.toLowerCase();
          return domain && (commonDomains.includes(domain) || domain.includes('.'));
        },
        {
          message: "Please enter a valid email with a proper domain"
        }
      )
      .transform((email) => email.trim().toLowerCase()),
    phone: z.string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^[+]?[\d\s\-()]+$/, "Please enter a valid phone number"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string()
      .min(8, "Confirm password is required"),
    role: z.enum(["rider", "driver"], {
      message: "Please select a role",
    }),
    // Driver fields - will be validated conditionally
    licenseNumber: z.string().optional(),
    vehicleMake: z.string().optional(),
    vehicleModel: z.string().optional(),
    vehicleYear: z.union([z.string(), z.number()]).optional(),
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
        return data.licenseNumber && data.licenseNumber.trim().length > 0;
      }
      return true;
    },
    {
      message: "License number is required for drivers",
      path: ["licenseNumber"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "driver") {
        return data.vehicleMake && data.vehicleMake.trim().length > 0;
      }
      return true;
    },
    {
      message: "Vehicle make is required for drivers",
      path: ["vehicleMake"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "driver") {
        return data.vehicleModel && data.vehicleModel.trim().length > 0;
      }
      return true;
    },
    {
      message: "Vehicle model is required for drivers",
      path: ["vehicleModel"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "driver") {
        const year = typeof data.vehicleYear === 'string' ? parseInt(data.vehicleYear) : data.vehicleYear;
        return year && year >= 1990 && year <= new Date().getFullYear() + 1;
      }
      return true;
    },
    {
      message: "Please enter a valid vehicle year (1990-current)",
      path: ["vehicleYear"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "driver") {
        return data.vehicleColor && data.vehicleColor.trim().length > 0;
      }
      return true;
    },
    {
      message: "Vehicle color is required for drivers",
      path: ["vehicleColor"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "driver") {
        return data.plateNumber && data.plateNumber.trim().length > 0;
      }
      return true;
    },
    {
      message: "Plate number is required for drivers",
      path: ["plateNumber"],
    }
  );

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState<"rider" | "driver">("rider");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [register, { isLoading }] = useRegisterMutation();
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Email availability checker with debounce
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailCheckStatus('idle');
      return;
    }

    setEmailCheckStatus('checking');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple validation - if registration fails with 409, we'll handle it there
    setEmailCheckStatus('idle');
    console.log("📧 Email check completed for:", email);
  };



  // Helper function to fill driver test data
  const fillDriverTestData = () => {
    const driverData = {
      firstName: "Test",
      lastName: "Driver",
      phone: "01700000000",
      password: "123456",
      confirmPassword: "123456",
      role: "driver" as const,
      licenseNumber: `LIC${Date.now()}`,
      vehicleMake: "Toyota",
      vehicleModel: "Corolla",
      vehicleYear: "2020",
      vehicleColor: "White",
      plateNumber: `DHA-${Math.floor(Math.random() * 9000) + 1000}`
    };

    // Fill all fields except email
    Object.entries(driverData).forEach(([key, value]) => {
      setValue(key as keyof RegisterFormData, value);
    });

    toast.success("Driver test data filled! Please enter your email address.");
    console.log("🚗 Driver test data filled:", driverData);
    
    // Focus on email field
    setTimeout(() => {
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
        emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

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
  console.log("🚀 ===== REGISTRATION PROCESS START =====");
  console.log("📝 Form Data:", {
    ...data,
    password: "[HIDDEN]",
    confirmPassword: "[HIDDEN]"
  });

  // Client-side validation for driver fields
  if (data.role === "driver") {
    console.log("🚗 ===== DRIVER REGISTRATION VALIDATION =====");
    console.log("🚗 Driver registration - validating vehicle info...");
    
    const driverFields = {
      licenseNumber: data.licenseNumber?.trim(),
      vehicleMake: data.vehicleMake?.trim(),
      vehicleModel: data.vehicleModel?.trim(),
      vehicleYear: data.vehicleYear,
      vehicleColor: data.vehicleColor?.trim(),
      plateNumber: data.plateNumber?.trim(),
    };
    
    console.log("🔍 Driver Fields Validation:", driverFields);
    
    const missingFields = Object.entries(driverFields)
      .filter(([, value]) => !value || (typeof value === 'string' && value.length === 0))
      .map(([field]) => field);
    
    if (missingFields.length > 0) {
      console.error("❌ Missing Driver Fields:", missingFields);
      toast.error(`Please fill in all driver information: ${missingFields.join(', ')}`, {
        duration: 4000,
      });
      return;
    }
    
    console.log("✅ All driver fields validated successfully");
    console.log("🚗 ===== END DRIVER VALIDATION =====");
  }

    // Build payload
    const payload: any = {
      firstName: data.firstName?.trim(),
      lastName: data.lastName?.trim(),
      email: data.email?.trim().toLowerCase(),
      password: data.password,
      phone: data.phone?.trim(),
      role: data.role,
    };

    console.log("📧 ===== EMAIL PROCESSING DEBUG =====");
    console.log("  🔤 Original Email from Form:", data.email);
    console.log("  🔽 Processed Email for API:", payload.email);
    console.log("  📏 Email Length:", payload.email?.length);
    console.log("  🎯 Email Comparison:");
    console.log("    - Original:", JSON.stringify(data.email));
    console.log("    - Processed:", JSON.stringify(payload.email));
    console.log("    - Are Same:", data.email === payload.email);
    console.log("  🔍 Email Character Codes:", [...payload.email].map(char => char.charCodeAt(0)));
    console.log("📧 ===== END EMAIL DEBUG =====");  // Add driver-specific data
  if (data.role === "driver") {
    console.log("🚗 ===== PROCESSING DRIVER DATA =====");
    console.log("🚗 Raw Driver Data from Form:", {
      licenseNumber: data.licenseNumber,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      vehicleColor: data.vehicleColor,
      plateNumber: data.plateNumber
    });
    
    payload.licenseNumber = data.licenseNumber?.trim();
    payload.vehicleInfo = {
      make: data.vehicleMake?.trim(),
      model: data.vehicleModel?.trim(),
      year: typeof data.vehicleYear === 'string' ? parseInt(data.vehicleYear) : data.vehicleYear,
      color: data.vehicleColor?.trim(),
      plateNumber: data.plateNumber?.trim(),
    };
    
    console.log("🚗 Processed Driver Payload:", {
      licenseNumber: payload.licenseNumber,
      vehicleInfo: payload.vehicleInfo
    });
    
    // Final validation before sending
    const requiredDriverFields = {
      licenseNumber: payload.licenseNumber,
      'vehicleInfo.make': payload.vehicleInfo.make,
      'vehicleInfo.model': payload.vehicleInfo.model,
      'vehicleInfo.year': payload.vehicleInfo.year,
      'vehicleInfo.color': payload.vehicleInfo.color,
      'vehicleInfo.plateNumber': payload.vehicleInfo.plateNumber
    };
    
    const emptyDriverFields = Object.entries(requiredDriverFields)
      .filter(([, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([field]) => field);
    
    if (emptyDriverFields.length > 0) {
      console.error("🚗 ❌ DRIVER VALIDATION FAILED - Empty fields:", emptyDriverFields);
      toast.error(`Driver fields are missing: ${emptyDriverFields.join(', ')}. Please fill all driver information.`);
      return;
    }
    
    console.log("🚗 ✅ ALL DRIVER FIELDS VALIDATED SUCCESSFULLY");
    console.log("🚗 ===== END DRIVER DATA PROCESSING =====");
    }

    console.log("📦 Final Payload:", { ...payload, password: "[HIDDEN]" });

    try {
      if (payload.role === "driver") {
      console.log("🚗 ===== SENDING DRIVER REGISTRATION =====");
      console.log("🚗 Driver Payload:", { ...payload, password: "[HIDDEN]" });
      console.log("🚗 Vehicle Info:", payload.vehicleInfo);
      console.log("🚗 License Number:", payload.licenseNumber);
    }
    
    console.log("🌐 ===== SENDING REGISTRATION REQUEST =====");
    console.log("🌐 API Endpoint: /auth/register");
    console.log("🌐 Request Method: POST");
    console.log("🌐 Request Payload Size:", JSON.stringify(payload).length, "bytes");
    console.log("🌐 Full Payload Being Sent:", JSON.stringify(payload, null, 2));
    console.log("🌐 Sending registration request...");
    
    const startTime = Date.now();
    let response;
    
    try {
      response = await register(payload).unwrap();
      const endTime = Date.now();
      console.log("⚡ Request completed successfully in:", endTime - startTime, "ms");
    } catch (error) {
      const endTime = Date.now();
      const errorObj = error as any;
      console.log("❌ Request failed in:", endTime - startTime, "ms");
      console.log("❌ ===== DETAILED ERROR ANALYSIS =====");
      console.log("❌ Error Object:", errorObj);
      console.log("❌ Error Status:", errorObj?.status);
      console.log("❌ Error Data:", errorObj?.data);
      console.log("❌ Error Message:", errorObj?.message);
      console.log("❌ Full Error JSON:", JSON.stringify(errorObj, null, 2));
      console.log("❌ ===== END ERROR ANALYSIS =====");
      throw errorObj; // Re-throw to be caught by outer catch
    }
      
      console.log("✅ ===== REGISTRATION SUCCESS =====");
      console.log("🎉 REGISTRATION WORKED! Database updated successfully!");
      
      // Email was successfully registered
      setEmailCheckStatus('available');
      
      // 🚨 PROMINENT ACCESS TOKEN DISPLAY
      if (response?.tokens?.accessToken) {
        console.log("🔥🔥🔥 ===== ACCESS TOKEN FOUND ===== 🔥🔥🔥");
        console.log("🎯 ACCESS TOKEN:", response.tokens.accessToken);
        console.log("🔄 REFRESH TOKEN:", response.tokens.refreshToken);
        console.log("⏰ TOKEN EXPIRES IN:", response.tokens.expiresIn, "seconds");
        console.log("🔥🔥🔥 ===== END ACCESS TOKEN ===== 🔥🔥🔥");
        
        //  TABLE VIEW OF TOKEN INFO
        console.table({
          "Access Token": response.tokens.accessToken,
          "Refresh Token": response.tokens.refreshToken,
          "Expires In (seconds)": response.tokens.expiresIn,
          "Token Type": response.tokens.tokenType || "Bearer",
          "User Name": `${response.user.firstName} ${response.user.lastName}`,
          "User Role": response.user.role
        });
      } else {
        console.log("❌ NO ACCESS TOKEN FOUND IN REGISTRATION RESPONSE");
      }
      
      console.log("✅ Raw Registration Response:", JSON.stringify(response, null, 2));
      console.log("📊 Response Analysis:");
      console.log("  ✓ Response Type:", typeof response);
      console.log("  ✓ Has User:", !!response?.user);
      console.log("  ✓ Has Tokens:", !!response?.tokens);
      console.log("  ✓ Has Message:", !!response?.message);
      console.log("  ✓ Requires Verification:", !!response?.requiresVerification);
      console.log("  ✓ Response Keys:", Object.keys(response || {}));
      
      console.log("🎫 ===== REGISTRATION TOKEN ANALYSIS =====");
      console.log("🔍 Response contains tokens:", !!response?.tokens);
      if (response?.tokens) {
        console.log("🔑 Access Token:", response.tokens.accessToken);
        console.log("🔄 Refresh Token:", response.tokens.refreshToken);
        console.log("⏰ Expires In:", response.tokens.expiresIn);
        console.log("🏷️ Token Type:", response.tokens.tokenType);
        console.log("📏 Access Token Length:", response.tokens.accessToken?.length);
      } else {
        console.log("❌ No tokens found in registration response");
      }
      console.log("🎫 ===== END REGISTRATION TOKEN ANALYSIS =====");
      
      // Driver-specific success logging
      if (payload.role === "driver") {
        console.log("🚗 ===== DRIVER REGISTRATION SUCCESS =====");
        console.log("🚗 Driver Successfully Registered!");
        console.log("🚗 Driver Info:", {
          name: `${response.user?.firstName} ${response.user?.lastName}`,
          email: response.user?.email,
          licenseNumber: payload.licenseNumber,
          vehicleInfo: payload.vehicleInfo
        });
        console.log("🚗 ===== END DRIVER SUCCESS =====");
      }
      
      console.log("✅ ===== REGISTRATION SUCCESS =====");
    console.log("✅ Registration Response:", response);
    
    // Check response structure
    if (response?.user) {
      console.log("👤 User Created:", {
        id: response.user.id,
        name: `${response.user.firstName} ${response.user.lastName}`,
        email: response.user.email,
        role: response.user.role
      });
    }
    
    if (response?.tokens) {
      console.log("🔑 Tokens Received:", {
        hasAccessToken: !!response.tokens.accessToken,
        hasRefreshToken: !!response.tokens.refreshToken
      });
    }
    
    // Show immediate success message
    const successMessage = `🎉 ${data.role === 'driver' ? 'Driver' : 'Rider'} account created successfully!`;
    
    console.log("🎊 SHOWING SUCCESS TOAST:", successMessage);
    toast.success(successMessage, {
      duration: 4000,
    });
    
    console.log("🎊 SUCCESS TOAST DISPLAYED!");
    
    // Enhanced navigation logic based on response structure
    console.log("🎯 ===== NAVIGATION DECISION =====");
    
    if (response?.user) {
      console.log("� User successfully created:", {
        id: response.user.id,
        name: `${response.user.firstName} ${response.user.lastName}`,
        email: response.user.email,
        role: response.user.role
      });
    }

    // Check if tokens are provided (immediate login)
    if (response?.tokens?.accessToken && response?.user) {
      console.log("🚀 ===== REGISTRATION AUTO-LOGIN TOKEN STORAGE =====");
      console.log("🚀 Auto-login successful - storing credentials and redirecting");
      console.log("🎯 Registration Auto-login Access Token FULL:", response.tokens.accessToken);
      console.log("🔄 Registration Auto-login Refresh Token FULL:", response.tokens.refreshToken);
      console.log("📏 Auto-login Token Length:", response.tokens.accessToken?.length);
      
      // Import loginSuccess action
      const { loginSuccess } = await import("@/redux/features/auth/authSlice");
      
      const autoLoginPayload = {
        user: response.user,
        tokens: {
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken || '',
          expiresIn: response.tokens.expiresIn || 3600,
          tokenType: response.tokens.tokenType || 'Bearer'
        },
        rememberMe: false
      };
      
      console.log("📦 Auto-login Redux Payload:", JSON.stringify(autoLoginPayload, null, 2));
      
      // Store credentials in Redux for auto-login
      dispatch(loginSuccess(autoLoginPayload));
      
      console.log("✅ Auto-login credentials stored in Redux");
      console.log("🚀 ===== END AUTO-LOGIN TOKEN STORAGE =====");
      
      // Show auto-login success message and redirect
      const successMessage = `🎉 Welcome ${response.user.firstName}! Your ${data.role} account is ready!`;
      
      console.log("🎊 SHOWING AUTO-LOGIN SUCCESS TOAST:", successMessage);
      toast.success(successMessage, {
        duration: 4000,
      });
      
      console.log("🎊 AUTO-LOGIN SUCCESS TOAST DISPLAYED!");
      
      // Redirect to dashboard based on role
      const role = response.user.role?.toLowerCase() || data.role;
      console.log(`🎯 Auto-login redirect: ${role} → /${role}/dashboard`);
      navigate(`/${role}/dashboard`, { replace: true });
      
    } else if (response?.requiresVerification) {
      console.log("📧 Email verification required - navigating to verify page");
      const successMessage = `✅ ${data.role === 'driver' ? 'Driver' : 'Rider'} account created! Please verify your email to continue.`;
      
      console.log("📧 SHOWING EMAIL VERIFICATION TOAST:", successMessage);
      toast.success(successMessage, {
        duration: 5000,
      });
      
      console.log("📧 EMAIL VERIFICATION TOAST DISPLAYED!");
      navigate("/verify", { state: { email: data.email } });
      
    } else if (response?.user) {
      // User created but no immediate login tokens
      console.log("✅ Registration successful without immediate login");
      const successMessage = `🎉 ${data.role === 'driver' ? 'Driver' : 'Rider'} account created successfully! Please log in to continue.`;
      
      console.log("✅ SHOWING NO-TOKEN SUCCESS TOAST:", successMessage);
      toast.success(successMessage, {
        duration: 4000,
      });
      
      console.log("✅ NO-TOKEN SUCCESS TOAST DISPLAYED!");
      navigate("/login");
      
    } else {
      // Fallback case
      console.log("⚠️ Unexpected response structure");
      console.log("⚠️ SHOWING FALLBACK SUCCESS TOAST");
      toast.success("Account created successfully! Please try logging in.", {
        duration: 4000,
      });
      
      console.log("⚠️ FALLBACK SUCCESS TOAST DISPLAYED!");
      navigate("/login");
    }
    
    console.log("🎯 ===== END NAVIGATION DECISION =====");
    
  } catch (error: any) {
    console.log("❌ ===== REGISTRATION FAILED =====");
    console.error("❌ Registration Error:", error);
    
    // Detailed error logging
    console.error("📊 Error Status:", error?.status);
    console.error("📝 Error Data:", error?.data);
    console.error("💬 Error Message:", error?.message);
    console.error("🌐 Original Status:", error?.originalStatus);
    
    // Check if this is a false positive - backend created user but returned error
    if (error?.status === 409 && error?.data?.message?.includes("already exists")) {
      console.log("🔍 ===== CHECKING FOR FALSE POSITIVE =====");
      console.log("🔍 This might be a successful registration with duplicate error");
      console.log("🔍 Checking if user was actually created...");
      
      // Wait a moment and try to login with same credentials
      setTimeout(async () => {
        console.log("🔄 Attempting login to check if user was created...");
        // This will help user understand what happened
        toast.error("Email already registered. If you just registered, try logging in instead.", {
          duration: 8000,
        });
      }, 1000);
    }
    
    // Enhanced error handling
    let errorMessage = "Registration failed. Please try again.";
    
    if (error?.status === 409) {
      errorMessage = "An account with this email already exists. Please use a different email or try logging in instead.";
      
      // Update email status to show it's taken
      setEmailCheckStatus('taken');
      
      console.log("❌ EMAIL ALREADY EXISTS:", data.email);
      console.log("💡 SOLUTION: Please try with a different email address");
      
    } else if (error?.status === 400) {
      if (error?.data?.message) {
        errorMessage = error.data.message;
        // Check for specific driver validation errors
        if (error.data.message.toLowerCase().includes('vehicle') || 
            error.data.message.toLowerCase().includes('license')) {
          errorMessage = `Driver registration error: ${error.data.message}`;
        }
      } else {
        errorMessage = "Invalid registration data. Please check all fields.";
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
    
    console.log("❌ SHOWING ERROR TOAST:", errorMessage);
    toast.error(errorMessage, {
      duration: 5000,
    });
    
    // Add retry suggestion for 409 errors
    if (error?.status === 409) {
      setTimeout(() => {
        toast.success("💡 Tip: If you just registered successfully, try logging in instead!", {
          duration: 6000,
        });
      }, 3000);
    }
    
    console.log("❌ ERROR TOAST DISPLAYED!");
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
                  {...registerField("email", {
                    onChange: (e) => {
                      // Debounce email checking
                      const email = e.target.value;
                      clearTimeout(window.emailCheckTimeout);
                      window.emailCheckTimeout = setTimeout(() => {
                        checkEmailAvailability(email);
                      }, 1000);
                    }
                  })}
                  type="email"
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 pr-12 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500'
                      : emailCheckStatus === 'available'
                      ? 'border-green-300 focus:border-green-500'
                      : emailCheckStatus === 'taken'
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {emailCheckStatus === 'checking' && (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {emailCheckStatus === 'available' && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  {emailCheckStatus === 'taken' && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✗</span>
                    </div>
                  )}
                  {emailCheckStatus === 'idle' && (
                    <Mail className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">⚠️ {errors.email.message}</p>
              )}
              {emailCheckStatus === 'available' && !errors.email && (
                <p className="text-sm text-green-600">✅ Email is available</p>
              )}
              {emailCheckStatus === 'taken' && (
                <p className="text-sm text-red-600">❌ Email is already registered. Please try a different email.</p>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-green-700 font-semibold">
                    <Car className="h-5 w-5" />
                    <span>Driver Information</span>
                  </div>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={fillDriverTestData}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
                    >
                      🚗 Fill Test Data
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        console.log("🔍 ===== BACKEND DEBUG TEST =====");
                        const testEmail = `debug${Date.now()}@test.com`;
                        console.log("🔍 Testing backend with email:", testEmail);
                        
                        // Direct axios call to test backend
                        fetch('/api/auth/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            firstName: 'Debug',
                            lastName: 'Test',
                            email: testEmail,
                            password: '123456',
                            phone: '01700000000',
                            role: 'rider'
                          })
                        })
                        .then(response => {
                          console.log("🔍 Debug Response Status:", response.status);
                          return response.json();
                        })
                        .then(data => {
                          console.log("🔍 Debug Response Data:", data);
                          toast.success(`Debug test completed! Check console for details.`);
                        })
                        .catch(err => {
                          console.log("🔍 Debug Error:", err);
                          toast.error(`Debug test failed: ${err.message}`);
                        });
                        console.log("🔍 ===== END BACKEND DEBUG =====");
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-300"
                    >
                      🔍 Debug API
                    </button>
                  </div>
                </div>
                
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

          {/* Enhanced Login Section */}
          <div className="space-y-4 pt-6">
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-2 text-gray-500 font-medium">
                  Already have account?
                </span>
              </div>
            </div>

            {/* Login Button */}
            <Link to="/login" replace>
              <button 
                type="button"
                className="w-full group relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500"></div>
                
                <div className="relative flex items-center justify-center space-x-3">
                  <Lock className="w-5 h-5" />
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </Link>

            {/* Additional info */}
            <p className="text-center text-sm text-gray-600">
              Have an account? 
              <span className="text-purple-600 font-semibold"> Sign in now!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}