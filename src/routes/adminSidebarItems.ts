
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProfile from "@/pages/admin/AdminProfile";
import RideManagement from "@/pages/admin/RideManagement";
import RideOversight from "@/pages/admin/RideOversight";
import UserManagement from "@/pages/admin/UserManagement";
import { ISidebarItem } from "@/types";
import { lazy } from "react";

const Analytics = lazy(() => import("@/pages/admin/Analytics"));


export const adminSidebarItems: ISidebarItem[] = [
  {
    title: "Admin Dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        component: AdminDashboard,
      },
      {
        title: "Analytics",
        url: "/admin/analytics",
        component: Analytics,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users Management",
        url: "/admin/users",
        component: UserManagement,
      },
      {
        title: "Rides Management",
        url: "/admin/rides",
        component: RideManagement,
      },
      {
        title: "Ride Oversight",
        url: "/admin/ride-oversight",
        component: RideOversight,
      },
      {
        title: "Profile",
        url: "/admin/profile",
        component: AdminProfile,
      },
    ],
  },
];
