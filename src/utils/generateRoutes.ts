import { RouteObject } from "react-router-dom";
import { ISidebarItem } from "@/types";

export const generateRoutes = (sidebarItems: ISidebarItem[]): RouteObject[] => {
  const routes: RouteObject[] = [];

  sidebarItems.forEach((section) => {
    section.items.forEach((item) => {
      if (item.component && item.url) {
        // Extract the path from the URL (remove the prefix like /admin or /user)
        const pathParts = item.url.split('/').filter(Boolean);
        const last = pathParts[pathParts.length - 1];

        // Special-case 'details' pages: register a param route so
        // URLs like '/rider/rides/123' resolve to the details component.
        let routePath = last;
        if (last === 'details' && pathParts.length >= 2) {
          // Use the parent segment plus a parameter, e.g. 'rides/:rideId'
          const parent = pathParts[pathParts.length - 2];
          routePath = `${parent}/:rideId`;
        }

        routes.push({
          path: routePath,
          Component: item.component,
        });
      }
    });
  });

  return routes;
};