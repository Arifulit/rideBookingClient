// import Bookings from "@/pages/User/Bookings";
import { ISidebarItem } from "@/types";
import { User, Car, Info } from "lucide-react";
import { lazy } from "react";

const RiderDashboard = lazy(() => import("@/pages/rider/RiderDashboard"));
const BookRide = lazy(() => import("@/pages/rider/BookRide"));
// const Bookings = lazy(() => import("@/pages/user/Bookings"));
const RideDetails = lazy(() => import("@/pages/shared/RideDetails"));
const RiderProfile = lazy(() => import("@/pages/rider/RiderProfile"));

export const userSidebarItems: ISidebarItem[] = [
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
        title: "Profile",
        url: "/rider/profile",
        icon: User,
        component: RiderProfile,
      },
      // {
      //   title: "My Bookings",
      //   url: "/rider/bookings",
      //   icon: ClipboardList,
      //   component: Bookings,
      // },
      {
        title: "Ride Details",
        url: "/rider/rides/details",
        icon: Info,
        component: RideDetails,
      },
    ],
  },
];
