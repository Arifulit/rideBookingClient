import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAuthTokens } from "@/redux/store";

/**
 * Small utility component that logs auth tokens to the console whenever they change.
 * Useful for debugging after login (admin/driver/rider).
 */
export default function AuthTokenLogger() {
  const tokens = useSelector(selectAuthTokens);

  useEffect(() => {
    if (!tokens) {
      console.log("🔐 AuthTokenLogger: no tokens present in redux state");
      return;
    }

    try {
      console.log("🔐 AuthTokenLogger: Detected updated auth tokens in Redux:");
      console.log("  • Access Token:", tokens.accessToken);
      console.log("  • Refresh Token:", tokens.refreshToken);
      console.log("  • Token Type:", tokens.tokenType);
      console.log("  • Expires In:", tokens.expiresIn);

      // Also verify localStorage presence (some code persists to localStorage)
      const storedAccess = localStorage.getItem('accessToken') || localStorage.getItem('token') || null;
      const storedRefresh = localStorage.getItem('refreshToken') || null;

      console.log("🔍 AuthTokenLogger: Verifying stored tokens in localStorage:");
      console.log("  • Stored Access Token:", storedAccess);
      console.log("  • Stored Refresh Token:", storedRefresh);
    } catch (err) {
      console.error("AuthTokenLogger: failed to read tokens for logging", err);
    }
  }, [tokens]);

  return null;
}
