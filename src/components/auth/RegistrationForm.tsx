/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
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
  Calendar,
  Palette,
  Hash,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { loginSuccess } from "@/redux/features/auth/authSlice";

// Validation Schema
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long")
      .trim(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(254, "Email address is too long")
      .refine(
        (email) => {
          const domain = email.split("@")[1]?.toLowerCase();
          return domain && (domain.includes(".") || ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"].includes(domain));
        },
        { message: "Please enter a valid email with a proper domain" }
      )
      .transform((email) => email.trim().toLowerCase()),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^[+]?[\d\s\-()]+$/, "Please enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    role: z.enum(["rider", "driver"], { message: "Please select a role" }),
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
  .refine((data) => data.role !== "driver" || !!data.licenseNumber?.trim(), {
    message: "License number is required for drivers",
    path: ["licenseNumber"],
  })
  .refine((data) => data.role !== "driver" || !!data.vehicleMake?.trim(), {
    message: "Vehicle make is required for drivers",
    path: ["vehicleMake"],
  })
  .refine((data) => data.role !== "driver" || !!data.vehicleModel?.trim(), {
    message: "Vehicle model is required for drivers",
    path: ["vehicleModel"],
  })
  .refine(
    (data) => {
      if (data.role !== "driver") return true;
      const year = typeof data.vehicleYear === "string" ? parseInt(data.vehicleYear) : data.vehicleYear;
      return year && year >= 1990 && year <= new Date().getFullYear() + 1;
    },
    { message: "Please enter a valid vehicle year (1990-current)", path: ["vehicleYear"] }
  )
  .refine((data) => data.role !== "driver" || !!data.vehicleColor?.trim(), {
    message: "Vehicle color is required for drivers",
    path: ["vehicleColor"],
  })
  .refine((data) => data.role !== "driver" || !!data.plateNumber?.trim(), {
    message: "Plate number is required for drivers",
    path: ["plateNumber"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;
type CheckStatus = "idle" | "checking" | "available" | "taken";

export function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState<"rider" | "driver">("rider");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Uniqueness check states
  const [emailStatus, setEmailStatus] = useState<CheckStatus>("idle");
  const [licenseStatus, setLicenseStatus] = useState<CheckStatus>("idle");
  const [plateStatus, setPlateStatus] = useState<CheckStatus>("idle");

  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "";

  // Debounce timers
  const emailTimer = useRef<number | null>(null);
  const licenseTimer = useRef<number | null>(null);
  const plateTimer = useRef<number | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (emailTimer.current) window.clearTimeout(emailTimer.current);
      if (licenseTimer.current) window.clearTimeout(licenseTimer.current);
      if (plateTimer.current) window.clearTimeout(plateTimer.current);
    };
  }, []);

  // Check uniqueness function
  async function checkUnique(field: "email" | "licenseNumber" | "plateNumber", value?: string) {
    if (!value || !value.toString().trim()) return { available: true };

    try {
      const base = API_BASE.replace(/\/$/, "");
      const url = `${base}/auth/check-unique?field=${encodeURIComponent(field)}&value=${encodeURIComponent(
        value.toString().trim()
      )}`;

      const res = await fetch(url);

      if (!res.ok) {
        return { available: true }; // Fallback to server enforcement
      }

      const json = await res.json();
      return { available: !!json.available, message: json.message };
    } catch (error) {
      return { available: true };
    }
  }

  // Email uniqueness check
  const scheduleEmailCheck = (value?: string) => {
    if (emailTimer.current) window.clearTimeout(emailTimer.current);
    const v = value?.toString().trim();

    if (!v || !v.includes("@")) {
      setEmailStatus("idle");
      clearErrors("email");
      return;
    }

    setEmailStatus("checking");

    emailTimer.current = window.setTimeout(async () => {
      const res = await checkUnique("email", v);
      if (res.available) {
        setEmailStatus("available");
        clearErrors("email");
      } else {
        setEmailStatus("taken");
        setError("email", {
          type: "server",
          message: "This email is already registered. Please use a different email.",
        });
      }
    }, 600);
  };

  // License number uniqueness check
  const scheduleLicenseCheck = (value?: string) => {
    if (licenseTimer.current) window.clearTimeout(licenseTimer.current);
    const v = value?.toString().trim();

    if (!v) {
      setLicenseStatus("idle");
      clearErrors("licenseNumber");
      return;
    }

    setLicenseStatus("checking");

    licenseTimer.current = window.setTimeout(async () => {
      const res = await checkUnique("licenseNumber", v);
      if (res.available) {
        setLicenseStatus("available");
        clearErrors("licenseNumber");
      } else {
        setLicenseStatus("taken");
        setError("licenseNumber", {
          type: "server",
          message: "This license number is already registered. Please use a different license number.",
        });
      }
    }, 600);
  };

  // Plate number uniqueness check
  const schedulePlateCheck = (value?: string) => {
    if (plateTimer.current) window.clearTimeout(plateTimer.current);
    const v = value?.toString().trim();

    if (!v) {
      setPlateStatus("idle");
      clearErrors("plateNumber");
      return;
    }

    setPlateStatus("checking");

    plateTimer.current = window.setTimeout(async () => {
      const res = await checkUnique("plateNumber", v);
      if (res.available) {
        setPlateStatus("available");
        clearErrors("plateNumber");
      } else {
        setPlateStatus("taken");
        setError("plateNumber", {
          type: "server",
          message: "This plate number is already registered. Please use a different plate number.",
        });
      }
    }, 600);
  };

  // Fill test data for driver
  const fillDriverTestData = () => {
    const driverData = {
      firstName: "Test",
      lastName: "Driver",
      phone: "01700000000",
      password: "12345678",
      confirmPassword: "12345678",
      role: "driver" as const,
      licenseNumber: `LIC${Date.now()}`,
      vehicleMake: "Toyota",
      vehicleModel: "Corolla",
      vehicleYear: "2020",
      vehicleColor: "White",
      plateNumber: `DHA-${Math.floor(Math.random() * 9000) + 1000}`,
    };

    Object.entries(driverData).forEach(([key, value]) => {
      setValue(key as keyof RegisterFormData, value);
    });

    setSelectedRole("driver");
    toast.success("Driver test data filled! Please enter your email address.");

    setTimeout(() => {
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
        emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const onSubmit = async (data: RegisterFormData) => {
    // Client driver-specific checks
    if (data.role === "driver") {
      const lic = data.licenseNumber?.trim() ?? "";
      const plate = data.plateNumber?.trim() ?? "";
      if (lic && plate && lic === plate) {
        setError("plateNumber", { type: "server", message: "License number and plate number must be different." });
        return;
      }
      const driverValidation = {
        licenseNumber: !!lic,
        vehicleMake: !!data.vehicleMake?.trim(),
        vehicleModel: !!data.vehicleModel?.trim(),
        vehicleYear: !!data.vehicleYear,
        vehicleColor: !!data.vehicleColor?.trim(),
        plateNumber: !!plate,
      };
      const missing = Object.entries(driverValidation).filter(([, ok]) => !ok).map(([k]) => k);
      if (missing.length) {
        toast.error(`Missing required fields: ${missing.join(", ")}`);
        return;
      }
    }

    // Final pre-checks to avoid surprise 409
    setEmailStatus("checking");
    const emailRes = await checkUnique("email", data.email);
    if (!emailRes.available) {
      setEmailStatus("taken");
      setError("email", { type: "server", message: "This email is already registered. Please use a different email." });
      toast.error("Email is already registered");
      return;
    }
    setEmailStatus("available");

    if (data.role === "driver") {
      setLicenseStatus("checking");
      const licRes = await checkUnique("licenseNumber", data.licenseNumber);
      if (!licRes.available) {
        setLicenseStatus("taken");
        setError("licenseNumber", { type: "server", message: "This license number is already registered." });
        toast.error("License number is already registered");
        return;
      }
      setLicenseStatus("available");

      setPlateStatus("checking");
      const plateRes = await checkUnique("plateNumber", data.plateNumber);
      if (!plateRes.available) {
        setPlateStatus("taken");
        setError("plateNumber", { type: "server", message: "This plate number is already registered." });
        toast.error("Plate number is already registered");
        return;
      }
      setPlateStatus("available");
    }

    const payload: any = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email,
      password: data.password,
      phone: data.phone.trim(),
      role: data.role,
    };

    if (data.role === "driver") {
      const year = typeof data.vehicleYear === "string" ? parseInt(data.vehicleYear) : data.vehicleYear;
      payload.licenseNumber = data.licenseNumber?.trim();
      payload.vehicleInfo = {
        make: data.vehicleMake?.trim(),
        model: data.vehicleModel?.trim(),
        year: Number(year),
        color: data.vehicleColor?.trim(),
        plateNumber: data.plateNumber?.trim(),
      };
    }

    try {
      const response = await register(payload).unwrap();

      // Auto-login if tokens + user returned
      if (response?.tokens && response?.user) {
        dispatch(
          loginSuccess({
            user: response.user,
            tokens: {
              accessToken: response.tokens.accessToken,
              refreshToken: response.tokens.refreshToken || "",
              expiresIn: response.tokens.expiresIn || 3600,
              tokenType: response.tokens.tokenType || "Bearer",
            },
            rememberMe: false,
          })
        );
        toast.success(`Welcome, ${response.user.firstName || response.user.email}!`);
        const role = (response.user.role || "rider").toLowerCase();
        if (role === "driver") navigate("/driver/dashboard", { replace: true });
        else if (role === "admin") navigate("/admin/dashboard", { replace: true });
        else navigate("/rider/dashboard", { replace: true });
        return;
      }

      if (response?.requiresVerification) {
        toast.success("Account created. Please verify your email.");
        navigate("/verify", { state: { email: data.email } });
        return;
      }

      toast.success("Account created successfully.");
      navigate("/verify", { state: { email: data.email } });
    } catch (error: any) {
      // Normalize server response
      const status = error?.status ?? error?.originalStatus ?? error?.response?.status;
      const serverData = error?.data ?? error?.response ?? error?.error ?? {};
      const serverMessage = (serverData && (serverData.message || serverData.msg)) || error?.message || "";

      // Handle duplicate / unique constraint errors (Mongo E11000, 409, backend message)
      if (
        status === 409 ||
        /E11000|duplicate key|duplicate|already.*registered|already.*exist|unique/i.test(String(serverMessage)) ||
        (serverData && typeof serverData === "object" && (serverData.keyValue || serverData.code === 11000))
      ) {
        let handled = false;

        if (serverData?.keyValue && typeof serverData.keyValue === "object") {
          const key = Object.keys(serverData.keyValue)[0];
          const fieldMsg = serverData.message || `${key} already exists`;

          if (/plate|plateNumber/i.test(key)) {
            setPlateStatus("taken");
            setError("plateNumber", { type: "server", message: fieldMsg || "Plate number already exists" });
            toast.error(fieldMsg || "Plate number already exists");
            handled = true;
          } else if (/license/i.test(key)) {
            setLicenseStatus("taken");
            setError("licenseNumber", { type: "server", message: fieldMsg || "License number already exists" });
            toast.error(fieldMsg || "License number already exists");
            handled = true;
          } else if (/email/i.test(key)) {
            setEmailStatus("taken");
            setError("email", { type: "server", message: fieldMsg || "Email already exists" });
            toast.error(fieldMsg || "Email already exists");
            handled = true;
          } else {
            toast.error(String(fieldMsg));
            handled = true;
          }
        }

        if (!handled) {
          const msg = String(serverMessage || "");
          if (/plate|plateNumber/i.test(msg)) {
            setPlateStatus("taken");
            setError("plateNumber", { type: "server", message: msg || "Plate number already exists" });
            toast.error(msg || "Plate number already exists");
            handled = true;
          } else if (/license/i.test(msg)) {
            setLicenseStatus("taken");
            setError("licenseNumber", { type: "server", message: msg || "License number already exists" });
            toast.error(msg || "License number already exists");
            handled = true;
          } else if (/email/i.test(msg)) {
            setEmailStatus("taken");
            setError("email", { type: "server", message: msg || "Email already exists" });
            toast.error(msg || "Email already exists");
            handled = true;
          } else {
            toast.error(msg || "Duplicate entry detected");
            handled = true;
          }
        }

        return;
      }

      // Validation errors (400/422)
      if (status === 400 || status === 422) {
        if (serverData && typeof serverData === "object" && serverData.errors) {
          const errs: any = serverData.errors;
          if (errs.email) setError("email", { type: "server", message: errs.email });
          if (errs.licenseNumber) setError("licenseNumber", { type: "server", message: errs.licenseNumber });
          if (errs.plateNumber) setError("plateNumber", { type: "server", message: errs.plateNumber });
          toast.error(serverData.message || "Validation failed. Please check fields.");
          return;
        }
        toast.error(serverMessage || "Invalid registration data. Please check your information.");
        return;
      }

      // Network or other server errors
      if (!navigator.onLine) {
        toast.error("No internet connection. Please check your network.");
        return;
      }

      if (status >= 500) {
        toast.error("Server error. Please try again later.");
        return;
      }

      toast.error(serverMessage || "Registration failed. Please try again.");
      // eslint-disable-next-line no-console
      console.error("Unhandled registration error detail:", { status, serverData, serverMessage });
    }
  };

  // Status indicator component
  const StatusIndicator = ({ status }: { status: CheckStatus }) => {
    if (status === "checking") {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    if (status === "available") {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (status === "taken") {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return null;
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
          <form
            onSubmit={(e) => {
              handleSubmit(onSubmit)(e);
            }}
            className="space-y-6"
          >
            {/* ...existing code for inputs (firstName, lastName, email, phone, role, driver fields, password, confirm) ... */}
            {/* Name Fields */}
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
                    errors.firstName ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-purple-500"
                  }`}
                />
                {errors.firstName && <p className="text-sm text-red-600">⚠️ {errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Last Name</label>
                <input
                  {...registerField("lastName")}
                  placeholder="Uddin"
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 ${
                    errors.lastName ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-purple-500"
                  }`}
                />
                {errors.lastName && <p className="text-sm text-red-600">⚠️ {errors.lastName.message}</p>}
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
                    onChange: (e) => scheduleEmailCheck(e.target.value),
                  })}
                  type="email"
                  placeholder="rahim@gmail.com"
                  className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 pr-12 ${
                    errors.email
                      ? "border-red-300 focus:border-red-500"
                      : emailStatus === "available"
                      ? "border-green-300 focus:border-green-500"
                      : emailStatus === "taken"
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <StatusIndicator status={emailStatus} />
                  {emailStatus === "idle" && <Mail className="h-5 w-5 text-gray-400" />}
                </div>
              </div>
              {errors.email && <p className="text-sm text-red-600">⚠️ {errors.email.message}</p>}
              {!errors.email && emailStatus === "available" && <p className="text-sm text-green-600">✓ Email is available</p>}
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
                  errors.phone ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                }`}
              />
              {errors.phone && <p className="text-sm text-red-600">⚠️ {errors.phone.message}</p>}
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
                    setSelectedRole("rider");
                    setValue("role", "rider");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedRole === "rider" ? "border-blue-500 bg-blue-50 shadow-lg" : "border-gray-200 bg-white/50 hover:border-blue-300"
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${selectedRole === "rider" ? "bg-blue-500" : "bg-gray-300"}`}>
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
                    setSelectedRole("driver");
                    setValue("role", "driver");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedRole === "driver" ? "border-green-500 bg-green-50 shadow-lg" : "border-gray-200 bg-white/50 hover:border-green-300"
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${selectedRole === "driver" ? "bg-green-500" : "bg-gray-300"}`}>
                      <Car className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Driver</p>
                      <p className="text-xs text-gray-600">Provide rides</p>
                    </div>
                  </div>
                </button>
              </div>
              <input {...registerField("role")} type="hidden" />
            </div>

            {/* Driver-specific fields */}
            {selectedRole === "driver" && (
              <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-green-700 font-semibold">
                    <Shield className="h-5 w-5" />
                    <span>Driver Information</span>
                  </div>
                  <button
                    type="button"
                    onClick={fillDriverTestData}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    Fill Test Data
                  </button>
                </div>

                {/* License Number */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">License Number *</label>
                  <div className="relative">
                    <input
                      {...registerField("licenseNumber", {
                        onChange: (e) => scheduleLicenseCheck(e.target.value),
                      })}
                      placeholder="DL12345678"
                      className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 pr-12 ${
                        errors.licenseNumber
                          ? "border-red-300 focus:border-red-500"
                          : licenseStatus === "available"
                          ? "border-green-300 focus:border-green-500"
                          : licenseStatus === "taken"
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <StatusIndicator status={licenseStatus} />
                      {licenseStatus === "idle" && <Shield className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                  {errors.licenseNumber && <p className="text-sm text-red-600">⚠️ {errors.licenseNumber.message}</p>}
                  {!errors.licenseNumber && licenseStatus === "available" && <p className="text-sm text-green-600">✓ License number is available</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Vehicle Make *</label>
                    <input {...registerField("vehicleMake")} placeholder="Honda" className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 ${errors.vehicleMake ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`} />
                    {errors.vehicleMake && <p className="text-sm text-red-600">⚠️ {errors.vehicleMake.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Vehicle Model *</label>
                    <input {...registerField("vehicleModel")} placeholder="Civic" className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 ${errors.vehicleModel ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`} />
                    {errors.vehicleModel && <p className="text-sm text-red-600">⚠️ {errors.vehicleModel.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Year *</span>
                    </label>
                    <input {...registerField("vehicleYear")} type="number" placeholder="2021" className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 ${errors.vehicleYear ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`} />
                    {errors.vehicleYear && <p className="text-sm text-red-600">⚠️ {errors.vehicleYear.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Palette className="h-4 w-4" />
                      <span>Color *</span>
                    </label>
                    <input {...registerField("vehicleColor")} placeholder="Black" className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 ${errors.vehicleColor ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`} />
                    {errors.vehicleColor && <p className="text-sm text-red-600">⚠️ {errors.vehicleColor.message}</p>}
                  </div>
                </div>

                {/* Plate Number */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>Plate Number *</span>
                  </label>
                  <div className="relative">
                    <input
                      {...registerField("plateNumber", {
                        onChange: (e) => schedulePlateCheck(e.target.value),
                      })}
                      placeholder="Chittagong-5678"
                      className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 pr-12 ${
                        errors.plateNumber
                          ? "border-red-300 focus:border-red-500"
                          : plateStatus === "available"
                          ? "border-green-300 focus:border-green-500"
                          : plateStatus === "taken"
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <StatusIndicator status={plateStatus} />
                      {plateStatus === "idle" && <Hash className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                  {errors.plateNumber && <p className="text-sm text-red-600">⚠️ {errors.plateNumber.message}</p>}
                  {!errors.plateNumber && plateStatus === "available" && <p className="text-sm text-green-600">✓ Plate number is available</p>}
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
                    errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-purple-500"
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600">⚠️ {errors.password.message}</p>}
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
                    errors.confirmPassword ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-purple-500"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600">⚠️ {errors.confirmPassword.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          <div className="space-y-4 pt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-2 text-gray-500 font-medium">
                  Already have an account?
                </span>
              </div>
            </div>
            <Link to="/login" replace>
              <button
                type="button"
                className="w-full group relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <Lock className="w-5 h-5" />
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </Link>
            <p className="text-center text-sm text-gray-600">
              Have an account? <span className="text-purple-600 font-semibold">Sign in now!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;