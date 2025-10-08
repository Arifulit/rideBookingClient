import { RouteObject } from "react-router-dom";
import { ISidebarItem } from "@/types";

export const generateRoutes = (sidebarItems: ISidebarItem[]): RouteObject[] => {
  const routes: RouteObject[] = [];

  sidebarItems.forEach((section) => {
    section.items.forEach((item) => {
      if (item.component && item.url) {
        // Extract the path from the URL (remove the prefix like /admin or /user)
        const pathParts = item.url.split('/');
        const path = pathParts[pathParts.length - 1];
        
        routes.push({
          path: path,
          Component: item.component,
        });
      }
    });
  });

  return routes;
};