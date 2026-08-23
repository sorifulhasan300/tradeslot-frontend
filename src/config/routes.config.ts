import {
  LayoutDashboard,
  Calendar,
  MapPin,
  CreditCard,
  CalendarCheck,
  Search,
  HelpCircle,
  ShieldCheck,
  Users,
} from "lucide-react";

export type UserRole = "TRADER" | "CUSTOMER" | "PLATFORM_ADMIN" | "ADMIN";

export const ROLES = {
  TRADER: "TRADER" as UserRole,
  CUSTOMER: "CUSTOMER" as UserRole,
  PLATFORM_ADMIN: "PLATFORM_ADMIN" as UserRole,
  ADMIN: "ADMIN" as UserRole,
} as const;

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

export interface RouteMeta {
  title: string;
  breadcrumbs: string[];
  allowedRoles: UserRole[];
}

// Base default routes per role
export const TRADER_DEFAULT_ROUTE = "/dashboard";
export const CUSTOMER_DEFAULT_ROUTE = "/customer/dashboard";
export const ADMIN_DEFAULT_ROUTE = "/admin/dashboard";

// Platform Admin-specific navigation links
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Executive Dashboard", href: "/admin/dashboard", icon: ShieldCheck, roles: ["PLATFORM_ADMIN", "ADMIN"] },
  { label: "Trader Network", href: "/admin/traders", icon: Users, roles: ["PLATFORM_ADMIN", "ADMIN"] },
  { label: "Booking Audit", href: "/admin/bookings", icon: Calendar, roles: ["PLATFORM_ADMIN", "ADMIN"] },
  { label: "Revenue Audit", href: "/admin/revenue", icon: CreditCard, roles: ["PLATFORM_ADMIN", "ADMIN"] },
];

// Trader-specific navigation links
export const TRADER_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["TRADER"] },
  { label: "Bookings & Schedule", href: "/dashboard/bookings", icon: Calendar, roles: ["TRADER"] },
  { label: "Work Zone Coverage", href: "/dashboard/work-area", icon: MapPin, roles: ["TRADER"] },
  { label: "Payouts & Stripe", href: "/dashboard/payouts", icon: CreditCard, roles: ["TRADER"] },
];

// Customer-specific navigation links
export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { label: "My Bookings", href: "/customer/dashboard", icon: CalendarCheck, roles: ["CUSTOMER"] },
  { label: "Find & Book Trader", href: "/book", icon: Search, roles: ["CUSTOMER", "TRADER", "PLATFORM_ADMIN"] },
  { label: "Support / Simulator", href: "/simulator", icon: HelpCircle, roles: ["CUSTOMER", "TRADER", "PLATFORM_ADMIN"] },
];

// Protected route collections for RBAC checks
export const ADMIN_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/traders",
  "/admin/bookings",
  "/admin/revenue",
];

export const TRADER_ROUTES = [
  "/dashboard",
  "/dashboard/trader",
  "/dashboard/bookings",
  "/dashboard/work-area",
  "/dashboard/payouts",
  "/dashboard/schedule",
  "/dashboard/earnings",
  "/trader",
];

export const CUSTOMER_ROUTES = [
  "/customer",
  "/customer/dashboard",
  "/dashboard/customer",
  "/dashboard/my-bookings",
  "/dashboard/find-traders",
  "/bookings",
  "/profile",
];

export const SHARED_PROTECTED_ROUTES = [
  "/book",
  "/simulator",
];

export const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/register",
];

// Centralized route metadata and permissions
export const ROUTE_CONFIG: Record<string, RouteMeta> = {
  "/admin/dashboard": {
    title: "Platform Executive Dashboard",
    breadcrumbs: ["Home", "Admin", "Dashboard"],
    allowedRoles: ["PLATFORM_ADMIN", "ADMIN"],
  },
  "/admin/traders": {
    title: "Trader Network Management",
    breadcrumbs: ["Home", "Admin", "Trader Network"],
    allowedRoles: ["PLATFORM_ADMIN", "ADMIN"],
  },
  "/admin/bookings": {
    title: "System-wide Booking Audit",
    breadcrumbs: ["Home", "Admin", "Booking Audit"],
    allowedRoles: ["PLATFORM_ADMIN", "ADMIN"],
  },
  "/admin/revenue": {
    title: "Platform Revenue & Transaction Audit",
    breadcrumbs: ["Home", "Admin", "Revenue Audit"],
    allowedRoles: ["PLATFORM_ADMIN", "ADMIN"],
  },
  "/dashboard": {
    title: "Trader Overview",
    breadcrumbs: ["Home", "Dashboard", "Overview"],
    allowedRoles: ["TRADER"],
  },
  "/dashboard/bookings": {
    title: "Bookings & Schedule",
    breadcrumbs: ["Home", "Dashboard", "Bookings"],
    allowedRoles: ["TRADER"],
  },
  "/dashboard/work-area": {
    title: "Work Zone Coverage",
    breadcrumbs: ["Home", "Dashboard", "Work Area"],
    allowedRoles: ["TRADER"],
  },
  "/dashboard/payouts": {
    title: "Payouts & Stripe",
    breadcrumbs: ["Home", "Dashboard", "Payouts"],
    allowedRoles: ["TRADER"],
  },
  "/customer/dashboard": {
    title: "My Bookings & Overview",
    breadcrumbs: ["Home", "Customer", "Dashboard"],
    allowedRoles: ["CUSTOMER"],
  },
  "/book": {
    title: "Find & Book Trader",
    breadcrumbs: ["Home", "Book"],
    allowedRoles: ["CUSTOMER", "TRADER", "PLATFORM_ADMIN"],
  },
  "/simulator": {
    title: "Support & Webhook Simulator",
    breadcrumbs: ["Home", "Simulator"],
    allowedRoles: ["CUSTOMER", "TRADER", "PLATFORM_ADMIN"],
  },
};

/**
 * Safely parse user role from cookies (JSON user cookie or JWT token)
 */
export function parseUserRoleFromCookies(
  userCookie?: string | null,
  tokenCookie?: string | null
): UserRole | null {
  if (userCookie) {
    try {
      const decoded = decodeURIComponent(userCookie);
      const parsed = JSON.parse(decoded);
      if (parsed?.role) {
        const r = String(parsed.role).toUpperCase();
        if (r === "TRADER" || r === "CUSTOMER" || r === "PLATFORM_ADMIN" || r === "ADMIN") return r as UserRole;
      }
    } catch {
      if (userCookie.toUpperCase().includes("PLATFORM_ADMIN") || userCookie.toUpperCase().includes("ADMIN")) return "PLATFORM_ADMIN";
      if (userCookie.toUpperCase().includes("TRADER")) return "TRADER";
      if (userCookie.toUpperCase().includes("CUSTOMER")) return "CUSTOMER";
    }
  }

  if (tokenCookie && tokenCookie.includes(".")) {
    try {
      const parts = tokenCookie.split(".");
      if (parts.length === 3) {
        const payloadStr = typeof atob === "function" 
          ? atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')) 
          : Buffer.from(parts[1], "base64").toString("utf8");
        const payload = JSON.parse(payloadStr);
        const r = (payload.role || payload.user?.role)?.toUpperCase();
        if (r === "TRADER" || r === "CUSTOMER" || r === "PLATFORM_ADMIN" || r === "ADMIN") return r as UserRole;
      }
    } catch {
      // Ignore JWT parse failure
    }
  }

  return null;
}

/**
 * Check if path belongs strictly to admin portal
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

/**
 * Check if path belongs strictly to customer portal
 */
export function isCustomerRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/customer") ||
    pathname.startsWith("/dashboard/customer") ||
    pathname.startsWith("/dashboard/my-bookings") ||
    pathname.startsWith("/dashboard/find-traders") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/profile")
  );
}

/**
 * Check if path belongs strictly to trader portal
 */
export function isTraderRoute(pathname: string): boolean {
  if (isCustomerRoute(pathname) || isAdminRoute(pathname)) {
    return false;
  }
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/trader") ||
    pathname.startsWith("/work-area") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/payouts")
  );
}

/**
 * Check if path is a protected route requiring authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  if (isAdminRoute(pathname) || isCustomerRoute(pathname) || isTraderRoute(pathname)) {
    return true;
  }
  return SHARED_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Validate if a given pathname is allowed for the specified user role.
 */
export function isRouteAllowedForRole(pathname: string, role?: string | null): boolean {
  if (!role) return false;
  const normalizedRole = role.toUpperCase() as UserRole;

  if (isAdminRoute(pathname)) {
    return normalizedRole === "PLATFORM_ADMIN" || normalizedRole === "ADMIN";
  }

  if (isCustomerRoute(pathname)) {
    return normalizedRole === "CUSTOMER";
  }

  if (isTraderRoute(pathname)) {
    return normalizedRole === "TRADER";
  }

  const config = ROUTE_CONFIG[pathname];
  if (config) {
    return config.allowedRoles.includes(normalizedRole);
  }

  if (SHARED_PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    return true;
  }

  return true;
}

/**
 * Get default home route for user role
 */
export function getDefaultRedirectForRole(role?: string | null): string {
  if (!role) return "/login";
  const r = role.toUpperCase();
  if (r === "PLATFORM_ADMIN" || r === "ADMIN") return ADMIN_DEFAULT_ROUTE;
  return r === "CUSTOMER" ? CUSTOMER_DEFAULT_ROUTE : TRADER_DEFAULT_ROUTE;
}
