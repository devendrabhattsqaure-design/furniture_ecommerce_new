import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyRupeeIcon,
  BanknotesIcon,
  ClockIcon,
  CubeIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  // TrendingUpIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, EyeIcon } from "@heroicons/react/24/solid";
import { StatisticsChart } from "@/widgets/charts";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom CardFooter component (to avoid conflict)
const CustomCardFooter = ({ children, className }) => {
  return (
    <div className={`border-t border-blue-gray-50 p-4 ${className}`}>
      {children}
    </div>
  );
};

// Statistics Card Component
export function StatisticsCard({ color, icon, title, value, footer }) {
  return (
    <Card>
      <CardBody className="flex justify-between p-4">
        <div>
          <Typography variant="small" className="font-normal text-blue-gray-600">
            {title}
          </Typography>
          <Typography variant="h4" color="blue-gray">
            {value}
          </Typography>
        </div>
        <div className={`rounded-full p-3 ${color}`}>
          {icon}
        </div>
      </CardBody>
      {footer && (
        <CustomCardFooter>
          {footer}
        </CustomCardFooter>
      )}
    </Card>
  );
}

export function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBills, setRecentBills] = useState([]);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [billCountData, setBillCountData] = useState([]);
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchDashboardData();
    fetchRecentBills();
    fetchDailySalesChart();
    fetchBillCountChart();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/business-report?report_type=today`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
      } else {
        toast.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bills?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setRecentBills(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching recent bills:', error);
    }
  };

  const fetchDailySalesChart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/business-report/sales-trend?period=daily`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDailySalesData(result.data.trend || []);
      }
    } catch (error) {
      console.error('Error fetching sales trend:', error);
    }
  };

  const fetchBillCountChart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bills/statistics?period=week`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        // Prepare data for Website View chart (bill count per day)
        if (result.data) {
          // We'll create sample data since bill count per day might not be directly available
          // In real implementation, you'd have an API endpoint for daily bill counts
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const sampleBillCounts = days.map(day => ({
            day,
            count: Math.floor(Math.random() * 20) + 5 // Sample data
          }));
          setBillCountData(sampleBillCounts);
        }
      }
    } catch (error) {
      console.error('Error fetching bill statistics:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyFull = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Statistics Cards Data (Dynamic)
  const statisticsCardsData = dashboardData ? [
    {
      color: "bg-gradient-to-tr from-green-600 to-green-400",
      icon: <CurrencyRupeeIcon className="h-6 w-6 text-white" />,
      title: "Today's Income",
      value: formatCurrency(dashboardData.summary?.today?.total_sales || 0),
      footer: (
        <Typography className="font-normal text-blue-gray-600">
          <strong className="text-green-500">Today</strong>
          &nbsp;Total sales
        </Typography>
      ),
    },
    {
      color: "bg-gradient-to-tr from-blue-600 to-blue-400",
      icon: <BanknotesIcon className="h-6 w-6 text-white" />,
      title: "Monthly Income",
      value: formatCurrency(dashboardData.summary?.monthly?.total_sales || 0),
      footer: (
        <Typography className="font-normal text-blue-gray-600">
          <strong className="text-blue-500">This Month</strong>
          &nbsp;Total sales
        </Typography>
      ),
    },
    {
      color: "bg-gradient-to-tr from-orange-600 to-orange-400",
      icon: <ClockIcon className="h-6 w-6 text-white" />,
      title: "Total Dues",
      value: formatCurrency(dashboardData.summary?.dues?.total_due_amount || 0),
      footer: (
        <Typography className="font-normal text-blue-gray-600">
          <strong className="text-orange-500">
            {dashboardData.summary?.dues?.total_due_bills || 0} bills
          </strong>
          &nbsp;Outstanding
        </Typography>
      ),
    },
    {
      color: "bg-gradient-to-tr from-purple-600 to-purple-400",
      icon: <CubeIcon className="h-6 w-6 text-white" />,
      title: "Total Customers",
      value: dashboardData.summary?.customers?.total_customers || 0,
      footer: (
        <Typography className="font-normal text-blue-gray-600">
          <strong className="text-purple-500">
            {dashboardData.summary?.customers?.new_customers || 0} new
          </strong>
          &nbsp;customers this month
        </Typography>
      ),
    },
  ] : [];

  // Statistics Charts Data (Dynamic)
  const statisticsChartsData = [
    {
      color: "white",
      title: "Daily Sales",
      description: "Last 7 days sales performance",
      
      chart: {
        type: "line",
        height: 220,
        series: [
          {
            name: "Sales (₹)",
            data: dailySalesData.slice(0, 7).reverse().map(item => 
              parseFloat(item.total_sales) || 0
            ),
          },
        ],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
          title: {
            show: "",
          },
          dataLabels: {
            enabled: false,
          },
          colors: ["#020617"],
          stroke: {
            lineCap: "round",
            curve: "smooth",
          },
          markers: {
            size: 0,
          },
          xaxis: {
            axisTicks: {
              show: false,
            },
            axisBorder: {
              show: false,
            },
            labels: {
              style: {
                colors: "#616161",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: 400,
              },
            },
            categories: dailySalesData.slice(0, 7).reverse().map(item => 
              new Date(item.period).toLocaleDateString('en-IN', { weekday: 'short' })
            ),
          },
          yaxis: {
            labels: {
              style: {
                colors: "#616161",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: 400,
              },
              formatter: (value) => `₹${value.toLocaleString('en-IN')}`,
            },
          },
          grid: {
            show: true,
            borderColor: "#dddddd",
            strokeDashArray: 5,
            xaxis: {
              lines: {
                show: true,
              },
            },
            padding: {
              top: 5,
              right: 20,
            },
          },
          fill: {
            opacity: 0.8,
          },
          tooltip: {
            theme: "dark",
            y: {
              formatter: (val) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            },
          },
        },
      },
    },
    {
      color: "white",
      title: "Stock Overview",
      description: "Product stock levels",
      
      chart: {
        type: "bar",
        height: 220,
        series: [
          {
            name: "Stock",
            data: [45, 78, 32, 89, 54, 67, 23, 90],
          },
        ],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
          title: {
            show: "",
          },
          dataLabels: {
            enabled: false,
          },
          colors: ["#16a34a"],
          plotOptions: {
            bar: {
              columnWidth: "40%",
              borderRadius: 2,
            },
          },
          xaxis: {
            axisTicks: {
              show: false,
            },
            axisBorder: {
              show: false,
            },
            labels: {
              style: {
                colors: "#616161",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: 400,
              },
            },
            categories: [
              "Chairs",
              "Tables",
              "Sofas",
              "Beds",
              "Cabinets",
              "Desks",
              "Stools",
              "Shelves"
            ],
          },
          yaxis: {
            labels: {
              style: {
                colors: "#616161",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: 400,
              },
            },
          },
          grid: {
            show: true,
            borderColor: "#dddddd",
            strokeDashArray: 5,
            xaxis: {
              lines: {
                show: true,
              },
            },
            padding: {
              top: 5,
              right: 20,
            },
          },
          fill: {
            opacity: 0.8,
          },
          tooltip: {
            theme: "dark",
          },
        },
      },
    },
    {
      color: "white",
      title: "Website Views",
      description: "Daily bill creation count",
      
      chart: {
        type: "line",
        height: 220,
        series: [
          {
            name: "Bills Created",
            data: billCountData.map(item => item.count),
          },
        ],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
          title: {
            show: "",
          },
          dataLabels: {
            enabled: false,
          },
          colors: ["#9333ea"],
          stroke: {
            lineCap: "round",
            curve: "smooth",
          },
          markers: {
            size: 0,
          },
          xaxis: {
            axisTicks: {
              show: false,
            },
            axisBorder: {
              show: false,
            },
            labels: {
              style: {
                colors: "#616161",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: 400,
              },
            },
            categories: billCountData.map(item => item.day),
          },
          yaxis: {
            labels: {
              style: {
                colors: "#616161",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: 400,
              },
            },
          },
          grid: {
            show: true,
            borderColor: "#dddddd",
            strokeDashArray: 5,
            xaxis: {
              lines: {
                show: true,
              },
            },
            padding: {
              top: 5,
              right: 20,
            },
          },
          fill: {
            opacity: 0.8,
          },
          tooltip: {
            theme: "dark",
          },
        },
      },
    },
  ];

  
  const topSellingProducts = dashboardData?.top_products?.slice(0, 5) || [];


  const ordersOverviewData = recentBills.slice(0, 5).map((bill, index) => ({
    icon: ShoppingBagIcon,
    color: bill.payment_status === 'paid' ? "text-green-500" : 
           bill.payment_status === 'pending' ? "text-red-500" : "text-orange-500",
    title: `Bill #${bill.bill_number}`,
    description: `${bill.customer_name} - ${formatCurrencyFull(bill.total_amount)}`,
    status: bill.payment_status,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Statistics Cards */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ color, icon, title, value, footer }) => (
          <StatisticsCard
            key={title}
            color={color}
            icon={icon}
            title={title}
            value={value}
            footer={footer}
          />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            
          />
        ))}
      </div>
      
      {/* Bottom Section: Top Products & Recent Bills */}
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Top Selling Products Table */}
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Top Selling Products
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>Top 5</strong> this month
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>View All Products</MenuItem>
                <MenuItem>Export Data</MenuItem>
                <MenuItem>Refresh</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            {topSellingProducts.length > 0 ? (
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Product", "SKU", "Category", "Quantity Sold", "Revenue"].map(
                      (el) => (
                        <th
                          key={el}
                          className="border-b border-blue-gray-50 py-3 px-6 text-left"
                        >
                          <Typography
                            variant="small"
                            className="text-[11px] font-medium uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {topSellingProducts.map(
                    ({ product_name, sku, category_name, total_quantity_sold, total_revenue }, key) => {
                      const className = `py-3 px-5 ${
                        key === topSellingProducts.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;

                      return (
                        <tr key={product_name}>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <Avatar
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(product_name)}&background=random`}
                                alt={product_name}
                                size="sm"
                              />
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {product_name}
                              </Typography>
                            </div>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {sku || 'N/A'}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {category_name || 'Uncategorized'}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {total_quantity_sold}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-green-600 font-bold"
                            >
                              {formatCurrency(total_revenue)}
                            </Typography>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <InboxIcon className="h-12 w-12 text-blue-gray-300 mx-auto mb-4" />
                <Typography color="blue-gray" className="mb-2">
                  No sales data available
                </Typography>
                <Typography variant="small" className="text-blue-gray-500">
                  Start selling to see top products here
                </Typography>
              </div>
            )}
          </CardBody>
        </Card>
        
        {/* Recent Bills Card */}
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Recent Bills
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>{recentBills.length}</strong> bills today
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {ordersOverviewData.length > 0 ? (
              ordersOverviewData.map(
                ({ icon, color, title, description, status }, key) => (
                  <div key={title} className="flex items-start gap-4 py-3">
                    <div
                      className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                        key === ordersOverviewData.length - 1
                          ? "after:h-0"
                          : "after:h-4/6"
                      }`}
                    >
                      {React.createElement(icon, {
                        className: `!w-5 !h-5 ${color}`,
                      })}
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="block font-medium"
                        >
                          {title}
                        </Typography>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === 'paid' ? 'bg-green-100 text-green-800' :
                          status === 'pending' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {status}
                        </span>
                      </div>
                      <Typography
                        as="span"
                        variant="small"
                        className="text-xs font-medium text-blue-gray-500"
                      >
                        {description}
                      </Typography>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="text-center py-8">
                <ShoppingBagIcon className="h-10 w-10 text-blue-gray-300 mx-auto mb-3" />
                <Typography color="blue-gray" className="mb-1">
                  No recent bills
                </Typography>
                <Typography variant="small" className="text-blue-gray-500">
                  Create your first bill to see it here
                </Typography>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="font-normal text-blue-gray-600">
                  Average Bill Value
                </Typography>
                <Typography variant="h4" color="blue-gray" className="mt-1">
                  {formatCurrency(dashboardData?.summary?.monthly?.average_bill_value || 0)}
                </Typography>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-tr from-cyan-600 to-cyan-400">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <Typography variant="small" className="font-normal text-blue-gray-600 mt-4">
              <span className="text-green-500">+2.5%</span> from last month
            </Typography>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="font-normal text-blue-gray-600">
                  Total Customers
                </Typography>
                <Typography variant="h4" color="blue-gray" className="mt-1">
                  {dashboardData?.summary?.customers?.total_customers || 0}
                </Typography>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-tr from-pink-600 to-pink-400">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <Typography variant="small" className="font-normal text-blue-gray-600 mt-4">
              <span className="text-green-500">+{dashboardData?.summary?.customers?.new_customers || 0}</span> new this month
            </Typography>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="font-normal text-blue-gray-600">
                  Bills Collected
                </Typography>
                <Typography variant="h4" color="blue-gray" className="mt-1">
                  {formatCurrency(dashboardData?.summary?.monthly?.total_collected || 0)}
                </Typography>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-tr from-amber-600 to-amber-400">
                <BanknotesIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <Typography variant="small" className="font-normal text-blue-gray-600 mt-4">
              <span className="text-green-500">
                {dashboardData?.summary?.monthly?.total_collected > 0 ? 
                  Math.round((dashboardData.summary.monthly.total_collected / dashboardData.summary.monthly.total_sales) * 100) : 0}%
              </span> collection rate
            </Typography>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;