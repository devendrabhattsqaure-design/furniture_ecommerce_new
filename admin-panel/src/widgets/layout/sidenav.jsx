// admin-panel/src/widgets/layout/sidenav.jsx
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { 
  XMarkIcon, 
  ChevronDownIcon,
  ChevronRightIcon 
} from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Typography,
  Collapse,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useState } from "react";
import { Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const { user, organization, logout } = useAuth();
  const [openSections, setOpenSections] = useState({
    management: false,
    reports: false,
    content: false,
  });

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  // Organize sidebar items into categories
  const organizeSidebarItems = () => {
    if (!routes || routes.length === 0 || !routes[0]?.pages) {
      return { directLinks: [], categories: {} };
    }

    const visiblePages = routes[0].pages.filter(page => !page.hideFromSidebar);
    
    // Only 3 dropdown categories
    const categories = {
      management: {
        title: "Management",
        icon: <UsersIcon className="w-4 h-4" />,
        pages: visiblePages.filter(page => page.category === "management")
      },
      reports: {
        title: "Reports & Analytics",
        icon: <ChartBarIcon className="w-4 h-4" />,
        pages: visiblePages.filter(page => page.category === "reports")
      },
      content: {
        title: "Content",
        icon: <DocumentTextIcon className="w-4 h-4" />,
        pages: visiblePages.filter(page => page.category === "content")
      }
    };

    // Direct links (not in dropdowns)
    const directLinks = visiblePages.filter(page => page.category === "direct");

    return { directLinks, categories };
  };

  const { directLinks, categories } = organizeSidebarItems();

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
        <Link to="/dashboard/home" className="py-4 px-6 flex items-center gap-3">
          {/* Organization Logo */}
          <div className="flex-shrink-0">
            {organization?.org_logo ? (
              <img 
                src={organization.org_logo} 
                alt={organization.org_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : organization?.isSuperAdmin ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {organization?.org_name?.charAt(0) || "O"}
                </span>
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
              {organization?.org_name || "Organization"}
            </Typography>
            {user && (
              <Typography
                variant="small"
                color={sidenavType === "dark" ? "white" : "black"}
                className="truncate text-xs"
              >
                {user.full_name || user.email}
              </Typography>
            )}
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-4">
        {/* Direct Links (always visible, no dropdown) */}
        {directLinks.length > 0 && (
          <div className="space-y-1">
            {directLinks.map(({ icon, name, path }) => (
              <NavLink key={name} to={`/dashboard${path}`} end={path === "/home"}>
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
                    className="flex items-center gap-3 px-3 py-2.5 capitalize text-sm w-full justify-start rounded-lg"
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
            ))}
          </div>
        )}

       

        {/* =========== DROPDOWN 2: Reports & Analytics =========== */}
        {categories.reports.pages.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => toggleSection('reports')}
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                sidenavType === "dark" 
                  ? "hover:bg-gray-700 text-gray-300" 
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>
                  <ChartBarIcon className="w-4 h-4" />
                </span>
                <Typography
                  variant="small"
                  className="font-semibold uppercase text-xs"
                >
                  Reports & Analytics
                </Typography>
              </div>
              {openSections.reports ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>

            <Collapse open={openSections.reports}>
              <ul className="mt-1 ml-2 space-y-1">
                {categories.reports.pages.map(({ icon, name, path }) => (
                  <li key={name}>
                    <NavLink to={`/dashboard${path}`}>
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
        )}

        {/* =========== DROPDOWN 3: Content =========== */}
        {categories.content.pages.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => toggleSection('content')}
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                sidenavType === "dark" 
                  ? "hover:bg-gray-700 text-gray-300" 
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>
                  <DocumentTextIcon className="w-4 h-4" />
                </span>
                <Typography
                  variant="small"
                  className="font-semibold uppercase text-xs"
                >
                  Content
                </Typography>
              </div>
              {openSections.content ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>

            <Collapse open={openSections.content}>
              <ul className="mt-1 ml-2 space-y-1">
                {categories.content.pages.map(({ icon, name, path }) => (
                  <li key={name}>
                    <NavLink to={`/dashboard${path}`}>
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
        )}
         {/* =========== DROPDOWN 1: Management =========== */}
        {categories.management.pages.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => toggleSection('management')}
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                sidenavType === "dark" 
                  ? "hover:bg-gray-700 text-gray-300" 
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>
                  <UsersIcon className="w-4 h-4" />
                </span>
                <Typography
                  variant="small"
                  className="font-semibold uppercase text-xs"
                >
                   Master Management
                </Typography>
              </div>
              {openSections.management ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>

            <Collapse open={openSections.management}>
              <ul className="mt-1 ml-2 space-y-1">
                {categories.management.pages.map(({ icon, name, path }) => (
                  <li key={name}>
                    <NavLink to={`/dashboard${path}`}>
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
        )}
      </div>

      
    </aside>
  );
}

// Icon components
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

const ChartBarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
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

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;