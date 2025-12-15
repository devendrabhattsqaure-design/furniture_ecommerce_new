// admin-panel/src/routes.js
import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
 
  
  ChatBubbleLeftRightIcon,
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
  ChartBarIcon,
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
import VendorManagement from "./pages/dashboard/VendorManagement";

import VendorViewPage from "./pages/dashboard/VendorViewPage";
import ProductViewPage from "./pages/dashboard/ProductViewPage";


const icon = {
  className: "w-5 h-5 text-inherit",
};

// Get all routes based on user role
export const getRoutes = (user) => {
  const userRole = user?.role;
  
  // Define all possible routes with categories
  const allRoutes = {
    // Direct Links (no dropdown)
    dashboard: {
      icon: <HomeIcon {...icon} />,
      name: "dashboard",
      path: "/home",
      element: <Home />,
      show: true,
      category: "direct",
    },
     enquiry: {
     icon: <ChatBubbleLeftRightIcon {...icon} />
,
      name: "enquiry",
      path: "/enquiry",
      element: <EnquiryManagement />,
      show: true,
      category: "direct", // Changed from reports to direct
    },
    billingManagement: {
      icon: <CreditCardIcon {...icon} />,
      name: "billing management",
      path: "/billing-management",
      element: <BillingManagement />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "direct", // Changed from management to direct
    },
     orderManagement: {
      icon: <ShoppingBagIcon {...icon} />,
      name: "order management",
      path: "/order-management",
      element: <OrderManagement />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "direct", // Changed from management to direct
    },
    
    expense: {
      icon: <ReceiptPercentIcon {...icon} />,
      name: "expense",
      path: "/expense",
      element: <ExpenseManagement />,
      show: true,
      category: "direct", // Changed from reports to direct
    },
    vendor: {
      icon: <ReceiptPercentIcon {...icon} />,
      name: "vendor",
      path: "/vendor",
      element: <VendorManagement />,
      show: true,
      category: "direct", // Changed from reports to direct
    },
    
    quotation: {
     icon: <DocumentTextIcon {...icon} />,
      name: "quotation",
      path: "/quotation",
      element: <QuotationManagement />,
      show: true,
      category: "direct", // Changed from reports to direct
    },
    
    
    // profile: {
    //   icon: <UserCircleIcon {...icon} />,
    //   name: "profile",
    //   path: "/profile",
    //   element: <Profile />,
    //   show: true,
    //   category: "direct",
    // },
    
   
    
    
    
   
    
    // tables: {
    //   icon: <TableCellsIcon {...icon} />,
    //   name: "tables",
    //   path: "/tables",
    //   element: <Tables />,
    //   show: ['admin', 'manager', 'super_admin'].includes(userRole),
    //   category: "direct", 
    // },
    
    // Super Admin ONLY pages (direct links)
    organizationManagement: {
      icon: <BuildingOfficeIcon {...icon} />,
      name: "organization management",
      path: "/organization-management",
      element: <OrganizationManagement />,
      show: userRole === 'super_admin',
      category: "direct",
    },
    
    notifications: {
      icon: <InformationCircleIcon {...icon} />,
      name: "notifications",
      path: "/notifications",
      element: <Notifications />,
      show: userRole === 'super_admin',
      category: "direct",
    },
    
    // ==================== DROPDOWN 1: Management ====================
    employeeManagement: {
      icon: <UsersIcon {...icon} />,
      name: "employee management",
      path: "/employee-management",
      element: <UserManagement />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "management",
    },
    
    attendanceManagement: {
      icon: <CalendarDaysIcon {...icon} />,
      name: "attendance management",
      path: "/attendance-management",
      element: <AttendanceManagement />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "management",
    },
    
    categoryManagement: {
      icon: <TagIcon {...icon} />,
      name: "category management",
      path: "/category-management",
      element: <CategoryManagement />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "management", // Changed from content to management
    },
    
    productManagement: {
      icon: <CubeIcon {...icon} />,
      name: "product management",
      path: "/product-management",
      element: <ProductManagement />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "management", // Changed from content to management
    },
    
    // ==================== DROPDOWN 2: Reports & Analytics ====================
    businessReport: {
      icon: <ChartBarIcon {...icon} />,
      name: "business report",
      path: "/business-report",
      element: <BusinessReport />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "reports",
    },
    
    stocks: {
      icon: <InformationCircleIcon {...icon} />,
      name: "stocks",
      path: "/stocks",
      element: <StockManagement />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "reports",
    },
    
    // ==================== DROPDOWN 3: Content ====================
    blog: {
      icon: <DocumentTextIcon {...icon} />,
      name: "blog",
      path: "/blog",
      element: <BlogManagement />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "content",
    },
    
    slider: {
      icon: <PhotoIcon {...icon} />,
      name: "slider",
      path: "/slider",
      element: <SliderManagement />,
      show: ['admin', 'manager', 'super_admin'].includes(userRole),
      category: "content",
    },
  };

  // Filter routes based on user role
  return Object.values(allRoutes).filter(route => route.show);
};

// Hidden routes (not in sidebar)
export const hiddenRoutes = [
  {
    icon: <PlusIcon {...icon} />,
    name: "Create Bill",
    path: "/billing-management/create",
    element: <BillCreate />,
    hideFromSidebar: true,
  },
  {
    icon: <ReceiptPercentIcon {...icon} />,
    name: "View Bill",
    path: "/billing-management/:id",
    element: <BillView />,
    hideFromSidebar: true,
  },

  {
    icon: <EyeIcon {...icon} />,
    name: "user details",
    path: "/users/:userId", 
    element: <UserDetailsPage />,
    hideFromSidebar: true,
  },
  {
    icon: <InformationCircleIcon {...icon} />,
    name: "vendorpage",
    path: "/vendor/:id",
    element: <VendorViewPage />,
  },
   {
    icon: <InformationCircleIcon {...icon} />,
    name: "productviewpage",
    path: "/product-management/:id",
    element: <ProductViewPage />,
  },
];

// Auth routes
export const authRoutes = [
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
];

// For backward compatibility with existing code
export const routes = (user) => [
  {
    layout: "dashboard",
    pages: [...getRoutes(user), ...hiddenRoutes],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: authRoutes,
  },
];

export default routes;