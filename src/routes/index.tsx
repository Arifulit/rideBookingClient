import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
// Layouts
import App from "@/App";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { withAuth } from "@/utils/withAuth";
// Constants & Utils

import { generateRoutes } from "@/utils/generateRoutes";
import { adminSidebarItems } from "./adminSidebarItems";
import { userSidebarItems } from "./userSidebarItems";
import About from "@/pages/public/About";
import Features from "@/pages/public/Features";
import Contact from "@/pages/public/Contact";
import FAQ from "@/pages/public/FAQ";
import { LoginForm } from "@/modules/auth/Login";
import { RegisterForm } from "@/modules/auth/Register";
import Verify from "@/pages/public/Verify";
import Unauthorized from "@/pages/status/Unauthorized";
import PaymentSuccess from "@/pages/Payment/PaymentSuccess";
import PaymentFail from "@/pages/Payment/PaymentFail";
import NotFound from "@/pages/status/NotFound";
import Home from "@/pages/public/Home";
import { driverSidebarItems } from "./driverSidebarItems";
import RiderDetails from '@/pages/driver/RiderDetails';


// Router configuration using createBrowserRouter
export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        element: (
          <Home />
        ),
      },
      {
        path: "about",
        element: (
          <About />
        ),
      },
      {
        path: "features",
        element: (
          <Features />
        ),
      },
      {
        path: "contact",
        element: (
          <Contact />
        ),
      },
      {
        path: "faq",
        element: (
          <FAQ />
        ),
      },
    ],
  },

  // Authentication Routes
  {
    path: "/login",
    element: (
      <LoginForm />
    ),
  },
  {
    path: "/register",
    element: (
      <RegisterForm />
    ),
  },
  {
    path: "/verify",
    element: (
      <Verify />
    ),
  },

  // Admin Routes
  {
    path: "/admin",
    Component: withAuth(DashboardLayout, "admin"),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      ...generateRoutes(adminSidebarItems),
    ],
  },
  // Driver Routes
  {
    path: "/driver",
    Component: withAuth(DashboardLayout, "driver"),
    children: [
      { index: true, element: <Navigate to="/driver/dashboard" replace /> },
      ...generateRoutes(driverSidebarItems),
  { path: 'riders/:id', Component: RiderDetails },
    ],
  },
  // User/Rider Routes
  {
    path: "/rider",
    Component: withAuth(DashboardLayout, "rider"),
    children: [
      { index: true, element: <Navigate to="/rider/dashboard" replace /> },
      ...generateRoutes(userSidebarItems),
    ],
  },
  // Alternative User Route (redirects to rider)
  {
    path: "/user",
    Component: withAuth(DashboardLayout, "rider"), 
    children: [
      { index: true, element: <Navigate to="/rider/dashboard" replace /> },
      ...generateRoutes(userSidebarItems),
    ],
  },


  // Status Routes
  {
    path: "/unauthorized",
    element: (
      <Unauthorized />
    ),
  },

  // Payment Routes
  {
    path: "/payment/success",
    element: (
      <PaymentSuccess />
    ),
  },
  {
    path: "/payment/fail",
    element: (
      <PaymentFail />
    ),
  },

  // Catch-all route
  {
    path: "*",
    element: (
      <NotFound />
    ),
  },
]);
