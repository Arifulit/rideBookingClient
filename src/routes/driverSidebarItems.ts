import { Truck, ClipboardList, User} from "lucide-react";
import { ISidebarItem } from "@/types";
import DriverDashboard from "@/pages/driver/DriverDashboard";
import DriverRides from "@/pages/driver/DriverRides";
import DriverProfile from "@/pages/driver/DriverProfile";
import RidersList from "@/pages/driver/RidersList";

export const driverSidebarItems: ISidebarItem[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/driver/dashboard",
        icon: Truck,
        component: DriverDashboard,
      },
      {
        title: "My Rides",
        url: "/driver/rides",
        icon: ClipboardList,
        component: DriverRides,
      },
      {
        title: "All Riders",
        url: "/driver/riders",
        icon: User,
        component: RidersList,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "/driver/profile",
        icon: User,
        component: DriverProfile,
      },
      // {
      //   title: "Settings",
      //   url: "/driver/settings",
      //   icon: Settings,
      //   component: DriverSettings,
      // },
    ],
  },
];
