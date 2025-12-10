import { Clock, FileDown, Filter, Package } from "lucide-react";
import React, { useEffect, useState } from "react";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(null);
  const [totalCategory, setTotalCategory] = useState(null);
  const [minimum, setTotalMinimum] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lessStockData, setLessStockData] = useState([]);
  const [orgId, setOrgId] = useState(JSON.parse(localStorage.getItem('user')).org_id);


  const [filters, setFilters] = useState({
    category: "",
    minQty: "",
    maxQty: ""
  });

  const fetchCategories = async () => {
    const res = await fetch(`http://localhost:5000/api/stocks/categories/${orgId}`);
    const data = await res.json();
    console.log(data)
    setCategoryList(data.categories);
  };

  const fetchProducts = async () => {
    const { category, minQty, maxQty } = filters;

    const res = await fetch(
      `http://localhost:5000/api/stocks/${orgId}?page=${page}&category=${category}&minQty=${minQty}&maxQty=${maxQty}`
    );

    const data = await res.json();
    setTotalCategory(data.totalCategory)
    setTotalProducts(data.totalProducts)
    setProducts(data.data[0]);
    setTotalPage(data.totalPages);
    setTotalMinimum(data.minimumStock)
  };

  const handleLessStock = async()=>{
    const res = await fetch(
      `http://localhost:5000/api/stocks/less-stock/${orgId}`
    );

    const data = await res.json();
    console.log(data)
    setLessStockData(data.data)
    setShowModal(true)

  }

  useEffect(() => {
    let id = JSON.parse(localStorage.getItem('user')).org_id
      setOrgId(id)
    fetchCategories();
    fetchProducts();
  }, [page]);

  useEffect(() => {

    setPage(1);
    fetchProducts();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* Stats Cards */}
      <div className="mb-8 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Orders */}
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="p-6 text-right">
            <p className="text-sm text-gray-600 font-medium">Total Products</p>
            <h4 className="text-3xl font-bold text-gray-900">{totalProducts}</h4>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-yellow-600 to-yellow-400 text-white shadow-yellow-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="p-6 text-right">
            <p className="text-sm text-gray-600 font-medium">Total Category</p>
            <h4 className="text-3xl font-bold text-gray-900">{totalCategory}</h4>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-red-600 to-red-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <FileDown className="w-6 h-6 text-white" />
          </div>
          <div onClick={handleLessStock} className="p-6 text-right">
            <p className="text-sm text-gray-600 font-medium">Less Stock</p>
            <h4 className="text-3xl font-bold text-gray-900">{minimum}</h4>
          </div>
        </div>

      
      </div>
      <div className="bg-white p-4  shadow-md overflow-hidden">
        
      <h2 className="text-2xl font-bold text-gray-800">Product Stock Report</h2>

      {/* Filter Section */}
      <div className="mt-4 flex flex-wrap gap-2">
         <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                     
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 items-center ">
        <select
          className="border p-2 rounded"
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
        >
          <option value="">All Categories</option>
          {categoryList.map((cat) => (
            
            <option key={cat.category_id} value={cat.category_id}>
              {cat.category_name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Qty"
          className="border p-2 rounded w-32"
          value={filters.minQty}
          onChange={(e) =>
            setFilters({ ...filters, minQty: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Max Qty"
          className="border p-2 rounded w-32"
          value={filters.maxQty}
          onChange={(e) =>
            setFilters({ ...filters, maxQty: e.target.value })
          }
        />

        <button
          className="bg-gray-300 px-4 p-2 rounded"
          onClick={() =>
            setFilters({ category: "", minQty: "", maxQty: "" })
          }
        >
          Clear Filters
        </button>
        </div>
      </div>
</div>
      {/* Products Table */}
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">{p.product_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{p.category_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{p.stock_quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center items-center gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPage}
        </span>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={page === totalPage}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* Less Stock Modal */}
      {
        showModal?
         <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] md:w-[60%] rounded-xl shadow-lg p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Less Products Table</h2>
          <button
            className="px-3 py-1 rounded bg-red-500 text-white"
            onClick={()=>setShowModal(false)}
          >
            X
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[400px] overflow-y-auto"><div>
           <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {lessStockData.map((p) => (
            <tr key={p.product_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">{p.product_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{p.category_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{p.stock_quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div></div>
      </div>
    </div>
        
        :null
      }
    </div>
  );
};

export default ProductPage;
