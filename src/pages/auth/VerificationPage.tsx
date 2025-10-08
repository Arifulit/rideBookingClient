import { Link, useLocation } from "react-router-dom";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";

interface VerificationState {
  email?: string;
  message?: string;
}

export function VerificationPage() {
  const location = useLocation();
  const state = location.state as VerificationState;

  const email = state?.email || "";
  const message = state?.message || "Please check your email for verification instructions.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>

          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Verify Your Email
            </h1>
            <p className="text-gray-600 text-lg">
              {message}
            </p>
          </div>

          {/* Email Display */}
          {email && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">{email}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-4 text-gray-600">
            <p>
              We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
            </p>
            <div className="text-sm space-y-2">
              <p>Don't see the email? Check your:</p>
              <ul className="list-disc list-inside text-left space-y-1 ml-4">
                <li>Spam or junk folder</li>
                <li>Promotions tab (Gmail)</li>
                <li>All mail folder</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              Resend Verification Email
            </button>

            <Link
              to="/login"
              state={{ email }}
              className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>

          {/* Contact Support */}
          <div className="text-sm text-gray-500">
            <p>
              Still having trouble?{" "}
              <Link to="/support" className="text-blue-600 hover:underline font-semibold">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}