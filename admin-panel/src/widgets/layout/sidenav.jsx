import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { 
  XMarkIcon, 
  ChevronDownIcon,
  ChevronRightIcon 
} from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
  Collapse,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { getUserRole } from "@/routes";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({
    management: true, // Default open sections
    content: true,
    reports: true,
    // Add more sections as needed
  });

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  useEffect(() => {
    fetchUserOrganization();
  }, []);

  const fetchUserOrganization = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setOrganization({
            org_name: data.user.org_name || "Organization",
            org_logo: data.user.org_logo,
            org_id: data.user.org_id
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user organization:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group pages by category for better organization
  const groupPagesByCategory = (pages) => {
    const categories = {
      dashboard: {
        title: "Dashboard",
        icon: <HomeIcon className="w-4 h-4" />,
        pages: []
      },
      management: {
        title: "Management",
        icon: <UsersIcon className="w-4 h-4" />,
        pages: []
      },
      content: {
        title: "Content",
        icon: <DocumentTextIcon className="w-4 h-4" />,
        pages: []
      },
      sales: {
        title: "Sales & Orders",
        icon: <ShoppingBagIcon className="w-4 h-4" />,
        pages: []
      },
      reports: {
        title: "Reports & Analytics",
        icon: <ChartBarIcon className="w-4 h-4" />,
        pages: []
      },
      settings: {
        title: "Settings",
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        pages: []
      },
      attendance: {
        title: "Attendance",
        icon: <CalendarDaysIcon className="w-4 h-4" />,
        pages: []
      },
      billing: {
        title: "Billing",
        icon: <CreditCardIcon className="w-4 h-4" />,
        pages: []
      }
    };

    pages.forEach(page => {
      if (page.name === "dashboard") {
        categories.dashboard.pages.push(page);
      } else if (["user management", "product management", "category", "slider"].includes(page.name)) {
        categories.management.pages.push(page);
      } else if (["blog"].includes(page.name)) {
        categories.content.pages.push(page);
      } else if (["order management"].includes(page.name)) {
        categories.sales.pages.push(page);
      } else if (["business report", "tables"].includes(page.name)) {
        categories.reports.pages.push(page);
      } else if (["organization management", "profile", "notifications"].includes(page.name)) {
        categories.settings.pages.push(page);
      } else if (["attendance"].includes(page.name)) {
        categories.attendance.pages.push(page);
      } else if (["billing management"].includes(page.name)) {
        categories.billing.pages.push(page);
      }
    });

    // Filter out empty categories
    return Object.entries(categories)
      .filter(([key, category]) => category.pages.length > 0)
      .map(([key, category]) => ({
        key,
        title: category.title,
        icon: category.icon,
        pages: category.pages
      }));
  };

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100 flex flex-col`}
    >
      {/* Fixed Header */}
      <div className={`relative ${sidenavType === "dark" ? "bg-gray-800" : "bg-gray-50"} border-b border-blue-gray-50 flex-shrink-0`}>
        <Link to="/" className="py-4 px-6 flex items-center gap-3">
          {/* Organization Logo */}
          <div className="flex-shrink-0">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : organization?.org_logo ? (
              <img 
                src={organization.org_logo} 
                alt={organization.org_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          
          {/* Organization Name */}
          <div className="flex-1 min-w-0">
            <Typography
              variant="h6"
              color={sidenavType === "dark" ? "white" : "blue-gray"}
              className="font-bold truncate text-sm"
            >
              {loading ? (
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                organization?.org_name || "Organization"
              )}
            </Typography>
          </div>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
        {routes.map(({ layout, title, pages }, key) => {
          if (layout !== "dashboard") return null; // Only show dashboard routes in sidebar
          
          const groupedCategories = groupPagesByCategory(
            pages.filter(page => !page.hideFromSidebar)
          );

          return (
            <div key={key} className="space-y-2">
              {/* Render grouped categories */}
              {groupedCategories.map((category) => (
                <div key={category.key} className="mb-2">
                  {/* Category Header - Clickable */}
                  <button
                    onClick={() => toggleSection(category.key)}
                    className="flex items-center justify-between w-full p-2 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={sidenavType === "dark" ? "text-gray-300" : "text-gray-600"}>
                        {category.icon}
                      </span>
                      <Typography
                        variant="small"
                        color={sidenavType === "dark" ? "white" : "blue-gray"}
                        className="font-semibold uppercase text-xs"
                      >
                        {category.title}
                      </Typography>
                    </div>
                    {openSections[category.key] ? (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {/* Collapsible Content */}
                  <Collapse open={openSections[category.key]}>
                    <ul className="mt-1 ml-2 space-y-1">
                      {category.pages
                        .filter((page) => {
                          if (page.requiredRole) {
                            const userRole = getUserRole();
                            if (page.requiredRole === 'super_admin') {
                              return userRole === 'super_admin';
                            }
                            if (page.requiredRole === 'admin') {
                              return userRole === 'admin' || userRole === 'super_admin';
                            }
                          }
                          return true;
                        })
                        .map(({ icon, name, path }) => (
                          <li key={name}>
                            <NavLink to={`/${layout}${path}`}>
                              {({ isActive }) => (
                                <Button
                                  variant={isActive ? "gradient" : "text"}
                                  color={
                                    isActive
                                      ? sidenavColor
                                      : sidenavType === "dark"
                                      ? "white"
                                      : "blue-gray"
                                  }
                                  className="flex items-center gap-3 px-3 py-2 capitalize text-sm w-full justify-start"
                                  fullWidth
                                >
                                  <span className="flex-shrink-0 w-5 h-5">
                                    {icon}
                                  </span>
                                  <Typography
                                    color="inherit"
                                    className="font-medium capitalize text-xs truncate"
                                  >
                                    {name}
                                  </Typography>
                                </Button>
                              )}
                            </NavLink>
                          </li>
                        ))}
                    </ul>
                  </Collapse>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// Add missing icons
const HomeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const UsersIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const DocumentTextIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const ShoppingBagIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const ChartBarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const Cog6ToothIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const CalendarDaysIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
  </svg>
);

const CreditCardIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  </svg>
);

Sidenav.defaultProps = {
  brandImg: "",
  brandName: "",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;   