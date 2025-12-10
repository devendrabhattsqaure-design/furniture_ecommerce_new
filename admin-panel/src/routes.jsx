// admin-panel/src/routes.js
import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UsersIcon,
  CubeIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
  ShoppingBagIcon, 
  CalendarDaysIcon,
  EyeIcon,
  CreditCardIcon,
  PlusIcon,
  ReceiptPercentIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

// Import all management components
import UserManagement from "@/pages/dashboard/UserManagement";
import OrganizationManagement from "@/pages/dashboard/OrganizationManagement";
import BillingManagement from "@/pages/dashboard/BillingManagement/index.jsx";
import BillCreate from "@/pages/dashboard/BillingManagement/BillCreate";
import BillView from "@/pages/dashboard/BillingManagement/BillView";
import AttendanceManagement from "./pages/dashboard/AttendanceManagement";
import ProductManagement from "@/pages/dashboard/ProductManagement";
import BlogManagement from "@/pages/dashboard/BlogManagement";
import SliderManagement from "@/pages/dashboard/SliderManagement";
import CategoryManagement from "@/pages/dashboard/CategoryManagement";
import BusinessReport from "@/pages/dashboard/BusinessReport";
import OrderManagement from "@/pages/dashboard/OrderManagement";
import UserDetailsPage from "./pages/dashboard/UserDetailsPage";
import EnquiryManagement from "./pages/dashboard/EnquiryManagement";
import ExpenseManagement from "./pages/dashboard/ExpenseManagement";
import StockManagement from "./pages/dashboard/StockManagement";
import QuotationManagement from "./pages/dashboard/QuotationManagement";


const icon = {
  className: "w-5 h-5 text-inherit",
};

// Function to get user role from localStorage
const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role;
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const isSuperAdmin = () => {
  const role = getUserRole();
  return role === 'super_admin';
};

const isAdmin = () => {
  const role = getUserRole();
  return role === 'admin';
};

// Function to check if user has access to specific feature
const hasAccess = (requiredRole) => {
  const userRole = getUserRole();
  if (requiredRole === 'super_admin') {
    return userRole === 'super_admin';
  }
  if (requiredRole === 'admin') {
    return userRole === 'admin' || userRole === 'super_admin'||userRole==='manager';
  }
  return true; // For other roles or no specific requirement
};

// Super Admin ONLY pages
const superAdminPages = [
  {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
  {
    icon: <UserCircleIcon {...icon} />,
    name: "profile",
    path: "/profile",
    element: <Profile />,
    requiredRole: 'super_admin',
  },
  {
    icon: <BuildingOfficeIcon {...icon} />,
    name: "organization management",
    path: "/organization-management",
    element: <OrganizationManagement />,
    requiredRole: 'super_admin',
  },
  {
    icon: <InformationCircleIcon {...icon} />,
    name: "notifications",
    path: "/notifications",
    element: <Notifications />,
    requiredRole: 'super_admin',
  },
];

// Admin pages (regular admin access)
const adminPages = [

  {
    icon: <HomeIcon {...icon} />,
    name: "dashboard",
    path: "/home",
    element: <Home />,
  },
  {
    icon: <UsersIcon {...icon} />,
    name: "employee management",
    path: "/employee-management",
    element: <UserManagement />,
    requiredRole: 'admin'||'manager',
  },
  {
    icon: <DocumentTextIcon {...icon} />,
    name: "blog",
    path: "/blog",
    element: <BlogManagement />,
  },
  {
    icon: <PhotoIcon {...icon} />,
    name: "slider",
    path: "/slider",
    element: <SliderManagement />,
  },
  {
    icon: <TagIcon {...icon} />,
    name: "category management",
    path: "/category-management",
    element: <CategoryManagement />,
  },
  {
    icon: <CubeIcon {...icon} />,
    name: "product management",
    path: "/product-management",
    element: <ProductManagement />,
  },
  {
    icon: <TableCellsIcon {...icon} />,
    name: "tables",
    path: "/tables",
    element: <Tables />,
  },
  {
    icon: <ShoppingBagIcon {...icon} />,
    name: "order management",
    path: "/order-management",
    element: <OrderManagement />,
    requiredRole: 'admin'||'manager',
  },
  {
    icon: <CalendarDaysIcon {...icon} />,
    name: "attendance management",
    path: "/attendance-management",
    element: <AttendanceManagement />,
    requiredRole: 'admin'||'manager',
  },
  {
    icon: <CreditCardIcon {...icon} />,
    name: "billing management",
    path: "/billing-management",
    element: <BillingManagement />,
    requiredRole: 'admin'||'manager',
  },
  {
    icon: <CreditCardIcon {...icon} />,
    name: "business report",
    path: "/business-report",
    element: <BusinessReport />,
    requiredRole: 'admin'||'manager',
  },
   {
    icon: <InformationCircleIcon {...icon} />,
    name: "quotation",
    path: "/quotation",
    element: <QuotationManagement />,
  },
  {
    icon: <InformationCircleIcon {...icon} />,
    name: "stocks",
    path: "/stocks",
    element: <StockManagement />,
  },
  {
    icon: <InformationCircleIcon {...icon} />,
    name: "enquiry",
    path: "/enquiry",
    element: <EnquiryManagement />,
  },
   {
    icon: <InformationCircleIcon {...icon} />,
    name: "expense",
    path: "/expense",
    element: <ExpenseManagement />,
  },

  
  
];

// Hidden pages (not in sidebar)
const hiddenPages = [
  // Create Bill Page
  {
    icon: <PlusIcon {...icon} />,
    name: "Create Bill",
    path: "/billing-management/create",
    element: <BillCreate />,
    hideFromSidebar: true,
  },
  // View Bill Page
  {
    icon: <ReceiptPercentIcon {...icon} />,
    name: "View Bill",
    path: "/billing-management/:id",
    element: <BillView />,
    hideFromSidebar: true,
  },
  // User Details Page
  {
    icon: <EyeIcon {...icon} />,
    name: "user details",
    path: "/users/:userId", 
    element: <UserDetailsPage />,
    hideFromSidebar: true,
  },
];

// Combine pages based on user role
const getDashboardPages = () => {
  const userRole = getUserRole();
  let pages = [];
  
  if (userRole === 'super_admin') {
    // Super admin gets ONLY: profile, organization management, and notifications
    pages = [...superAdminPages];
  } else if (userRole === 'admin'||userRole === 'manager') {
    // Admin gets all admin pages (except super admin pages)
    pages = [...adminPages];
  } else {
    // Regular users or no role - show basic pages (optional)
    pages = [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
    ];
  }
  
  // Always add hidden pages (they're not shown in sidebar)
  pages = [...pages, ...hiddenPages];
  
  return pages;
};

export const routes = [
  {
    layout: "dashboard",
    pages: getDashboardPages(),
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
export { getUserRole, hasAccess };