import {
  BarChart3,
  Building2,
  Home,
  FileText,
  Printer,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  Briefcase,
  PlusCircle,
  Clock,
  Gauge,
  KeyRound,
} from "lucide-react";

export const adminNavigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Printers", href: "/printers", icon: Printer },
  { label: "Employees", href: "/organization/members", icon: UsersRound },
  { label: "Customers", href: "/employee/customers", icon: UserRound },
  { label: "Orders", href: "/employee/queue", icon: Briefcase },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const employeeNavigationItems = [
  { label: "Connected Printer", href: "/employee/printers", icon: Printer },
  { label: "Print Queue", href: "/employee/queue", icon: Gauge },
  { label: "OTP Verification", href: "/employee/queue", icon: KeyRound },
  { label: "Job History", href: "/employee/assigned", icon: Clock },
];

export const customerNavigationItems = [
  { label: "New Order", href: "/customer/jobs/new", icon: PlusCircle },
  { label: "My Orders", href: "/customer", icon: Briefcase },
  { label: "Profile", href: "/customer/profile", icon: UserRound },
];

export const baseNavigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Customer", href: "/customer", icon: UserRound },
  { label: "Employee", href: "/employee", icon: Printer },
  { label: "Organization", href: "/organization", icon: Building2 },
  { label: "Members", href: "/organization/members", icon: UsersRound },
  { label: "Roles", href: "/organization/roles", icon: ShieldCheck },
  { label: "Printers", href: "/printers", icon: Printer },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: UserRound },
] as const;

