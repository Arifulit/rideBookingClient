/* eslint-disable @typescript-eslint/no-unused-vars */
// import Bookings from "@/pages/User/Bookings";
import RideHistory from "@/pages/rider/RideHistory";
import { ISidebarItem } from "@/types";
import { User, Car, Info } from "lucide-react";
import { lazy } from "react";

const RiderDashboard = lazy(() => import("@/pages/rider/RiderDashboard"));
const BookRide = lazy(() => import("@/pages/rider/BookRide"));
// const Bookings = lazy(() => import("@/pages/user/Bookings"));
// const RideDetails = lazy(() => import("@/pages/shared/RideDetails"));
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
      //  {
      //   title: "Ride Details",
      //   url: "/rides/all-riders",
      //   icon: Info,
      //   component: RideDetails,
      //   hidden: true, // Add this if your sidebar supports hiding items
      // },
    ],
  },
];
