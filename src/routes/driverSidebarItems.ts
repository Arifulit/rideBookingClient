import { Truck, ClipboardList, User} from "lucide-react";
import { ISidebarItem } from "@/types";
import DriverDashboard from "@/pages/driver/DriverDashboard";
import DriverRides from "@/pages/driver/DriverRides";
import DriverProfile from "@/pages/driver/DriverProfile";

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
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "/users/profile",
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
