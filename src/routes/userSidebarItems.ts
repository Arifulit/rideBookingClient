

import RideHistory from "@/pages/rider/RideHistory";
import { User, Car, Info } from "lucide-react";
import { lazy } from "react";

const RiderDashboard = lazy(() => import("@/pages/rider/RiderDashboard"));
const BookRide = lazy(() => import("@/pages/rider/BookRide"));
const RiderProfile = lazy(() => import("@/pages/rider/RiderProfile"));

export const userSidebarItems = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/rider/dashboard",
        icon: User,
        component: RiderDashboard,
      },
      {
        title: "Book a Ride",
        url: "/rider/book-ride",
        icon: Car,
        component: BookRide,
      },
    
      {
        title: "Ride History",
        url: "/rider/rides/history",
        icon: Info,
        component: RideHistory,
      },
      {
        title: "Profile",
        url: "/rider/profile",
        icon: User,
        component: RiderProfile,
      },
  
    ],
  },
];
