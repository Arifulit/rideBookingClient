// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSlot,
// } from "@/components/ui/input-otp";
// import { cn } from "@/lib/utils";
// import {
//   useSendOtpMutation,
//   useVerifyOtpMutation,
// } from "@/redux/features/auth/auth.api";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Dot } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useLocation, useNavigate } from "react-router";
// import { toast } from "sonner";
// import z from "zod";

// const FormSchema = z.object({
//   pin: z.string().min(6, {
//     message: "Your one-time password must be 6 characters.",
//   }),
// });

// export default function Verify() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [email] = useState(location.state);
//   const [confirmed, setConfirmed] = useState(false);
//   const [sendOtp] = useSendOtpMutation();
//   const [verifyOtp] = useVerifyOtpMutation();
//   const [timer, setTimer] = useState(5);
//   const [loading, setLoading] = useState(false); // ✅ Add loading state

//   const form = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//     defaultValues: {
//       pin: "",
//     },
//   });

//     // Send OTP
//   const handleSendOtp = async () => {
//     if (!email) {
//       toast.error("Email not found");
//       return;
//     }

//     const toastId = toast.loading("Sending OTP...");
//     try {
//       setLoading(true);
//       const res: any = await sendOtp({ email }).unwrap();
//       console.log("OTP Response:", res);

//       if (res?.success) {
//         toast.success("✅ OTP sent successfully!", { id: toastId });
//         setConfirmed(true);
//         setTimer(30); // countdown 30 seconds before resend
//       } else {
//         toast.error(res?.message || "❌ Failed to send OTP", { id: toastId });
//       }
//     } catch (error: any) {
//       console.error("OTP Error:", error);
//       toast.error(error?.data?.message || "❌ Something went wrong", {
//         id: toastId,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Verify OTP
//   const onSubmit = async (data: z.infer<typeof FormSchema>) => {
//     const toastId = toast.loading("Verifying OTP...");

//     const userInfo = {
//       email,
//       otp: data.pin,
//     };

//     try {
//       const res = await verifyOtp(userInfo).unwrap();

//       if (res.success) {
//         toast.success("OTP Verified 🎉", { id: toastId });
//         setConfirmed(true);
//         // navigate("/dashboard"); // Uncomment if you want to redirect
//       } else {
//         toast.error(res.message || "OTP verification failed", { id: toastId });
//       }
//     } catch (err: any) {
//       console.error("Verify OTP Error:", err);
//       toast.error(err?.data?.message || "Verification failed", { id: toastId });
//     }
//   };

//   // Timer countdown
//   useEffect(() => {
//     if (!email || !confirmed) return;

//     const timerId = setInterval(() => {
//       setTimer((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);

//     return () => clearInterval(timerId);
//   }, [email, confirmed]);

//   return (
//     <div className="grid place-content-center h-screen">
//       {confirmed ? (
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-xl">Verify your email address</CardTitle>
//             <CardDescription>
//               Please enter the 6-digit code we sent to <br /> {email}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Form {...form}>
//               <form
//                 id="otp-form"
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-6"
//               >
//                 <FormField
//                   control={form.control}
//                   name="pin"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>One-Time Password</FormLabel>
//                       <FormControl>
//                         <InputOTP maxLength={6} {...field}>
//                           <InputOTPGroup>
//                             <InputOTPSlot index={0} />
//                           </InputOTPGroup>
//                           <InputOTPGroup>
//                             <InputOTPSlot index={1} />
//                           </InputOTPGroup>
//                           <InputOTPGroup>
//                             <InputOTPSlot index={2} />
//                           </InputOTPGroup>
//                           <Dot />
//                           <InputOTPGroup>
//                             <InputOTPSlot index={3} />
//                           </InputOTPGroup>
//                           <InputOTPGroup>
//                             <InputOTPSlot index={4} />
//                           </InputOTPGroup>
//                           <InputOTPGroup>
//                             <InputOTPSlot index={5} />
//                           </InputOTPGroup>
//                         </InputOTP>
//                       </FormControl>
//                       <FormDescription>
//                         <Button
//                           onClick={handleSendOtp}
//                           type="button"
//                           variant="link"
//                           disabled={timer !== 0 || loading}
//                           className={cn("p-0 m-0", {
//                             "cursor-pointer": timer === 0 && !loading,
//                             "text-gray-500": timer !== 0 || loading,
//                           })}
//                         >
//                           Resend OTP: {timer}
//                         </Button>
//                       </FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </form>
//             </Form>
//           </CardContent>
//           <CardFooter className="flex justify-end">
//             <Button form="otp-form" type="submit" disabled={loading}>
//               {loading ? "Verifying..." : "Submit"}
//             </Button>
//           </CardFooter>
//         </Card>
//       ) : (
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-xl">Verify your email address</CardTitle>
//             <CardDescription>
//               We will send you an OTP at <br /> {email}
//             </CardDescription>
//           </CardHeader>
//           <CardFooter className="flex justify-end">
//             <Button
//               onClick={handleSendOtp}
//               className="w-[300px]"
//               disabled={loading || timer !== 0}
//             >
//               {loading ? "Sending..." : "Confirm"}
//             </Button>
//           </CardFooter>
//         </Card>
//       )}
//     </div>
//   );
// }


/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/features/auth/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dot } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { useLocation } from "react-router-dom";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

/**
 * Email Verification Component
 * Handles OTP verification for user email validation
 */
export default function Verify() {
  const location = useLocation();
  const email = location.state?.email || null;

  // Debug: Log the email to console
  console.log("🔍 Verify Component - Email from state:", email);
  console.log("🔍 Verify Component - Full location state:", location.state); 
  
  // Component state
  const [confirmed, setConfirmed] = useState(false);
  const [timer, setTimer] = useState(0);
  
  // API mutations
  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  // Send OTP
  const handleSendOtp = async () => {
    if (!email) {
      toast.error("❌ Email not found. Please go back to registration.");
      return;
    }

    console.log("📧 Sending OTP to email:", email);
    const toastId = toast.loading("Sending OTP...");
    
    try {
      const res = await sendOtp({ email: email }).unwrap();
      console.log("✅ OTP Response:", res);

      if (res?.success) {
        toast.success("✅ OTP sent successfully!", { id: toastId });
        setConfirmed(true);
        setTimer(30); // 30 sec countdown for resend
      } else {
        toast.error(res?.message || "❌ Failed to send OTP", { id: toastId });
      }
    } catch (error: any) {
      console.error("OTP Error:", error);
      
      let errorMessage = "❌ Something went wrong";
      
      if (error?.status === 404) {
        errorMessage = "❌ Endpoint not found. Please check your backend configuration or try registering again.";
      } else if (error?.data?.message === 'User not found') {
        errorMessage = "❌ User not found. Please register first before verification.";
      } else if (error?.data?.message) {
        errorMessage = `❌ ${error.data.message}`;
      } else if (error?.message) {
        errorMessage = `❌ ${error.message}`;
      }
      
      toast.error(errorMessage, { id: toastId });
      
      // Additional debugging info
      console.error("🔍 Full error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
        email: email
      });
    } finally {
      // Loading handled by toast
    }
  };

  // Verify OTP
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const toastId = toast.loading("Verifying OTP...");

    const userInfo = {
      email,
      otp: data.pin,
    };

    try {
      const res = await verifyOtp(userInfo).unwrap();

      if (res.success) {
        toast.success("OTP Verified 🎉", { id: toastId });
        setConfirmed(true);
        // navigate("/dashboard"); // Uncomment to redirect after verification
      } else {
        toast.error(res.message || "OTP verification failed", { id: toastId });
      }
    } catch (err: any) {
      console.error("Verify OTP Error:", err);
      toast.error(err?.data?.message || "Verification failed", { id: toastId });
    }
  };

  // Timer countdown for Resend OTP
  useEffect(() => {
    if (!confirmed) return;

    const timerId = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [confirmed]);

  return (
    <div className="grid place-content-center h-screen">
      {confirmed ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Verify your email address</CardTitle>
            <CardDescription>
              Please enter the 6-digit code we sent to <br /> {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                id="otp-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                          </InputOTPGroup>
                          <InputOTPGroup>
                            <InputOTPSlot index={1} />
                          </InputOTPGroup>
                          <InputOTPGroup>
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <Dot />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                          <InputOTPGroup>
                            <InputOTPSlot index={4} />
                          </InputOTPGroup>
                          <InputOTPGroup>
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        <Button
                          onClick={handleSendOtp}
                          type="button"
                          variant="link"
                        >
                          Resend OTP: {timer > 0 ? timer : "Send Again"}
                        </Button>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button form="otp-form" type="submit">
              Submit
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Verify your email address</CardTitle>
            <CardDescription>
              We will send you an OTP at <br /> {email}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end">
            {/* Confirm button will send OTP */}
            <Button onClick={handleSendOtp} className="w-[300px]">
              Confirm
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
