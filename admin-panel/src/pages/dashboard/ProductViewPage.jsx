import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

const ProductViewPage = () => {
  const [product,setProduct] = useState({})
  const [viewQr,setViewQr] = useState(null)

    const params = useParams()
    let {id} =params
     const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=600,height=600");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            img {
              width: 250px;
              height: 250px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    let getProduct = async()=>{
      let res = await fetch(`${API_BASE_URL}/products/${id}`)
      let data = await res.json()
      console.log(data)
      setProduct(data.data)
      setActiveImage(data.data.images[0].image_url)
    }
     const images = product.images || [];
  const [activeImage, setActiveImage] = useState(
   
  );
    useEffect(()=>{
      getProduct()
    },[])
  return (
     <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT – IMAGE */}
        <div>
            <div>
          {/* Main Image */}
          <div className="border rounded-xl overflow-hidden">
            {activeImage ? (
              <img
                src={activeImage}
                alt="Product"
                className="w-full h-96 object-center "
              />
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-100">
                No Image
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img.image_url}
                  alt={`thumb-${index}`}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2
                    ${
                      activeImage === img.image_url
                        ? "border-blue-500"
                        : "border-gray-200"
                    }
                  `}
                />
              ))}
            </div>
          )}
        </div>

          {/* BADGES */}
          <div className="flex flex-wrap gap-2 mt-4">
            {product.is_featured === 1 && (
              <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                Featured
              </span>
            )}
            {product.is_new_arrival === 1 && (
              <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
                New
              </span>
            )}
            {product.is_bestseller === 1 && (
              <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-600">
                Bestseller
              </span>
            )}
            {product.is_on_sale === 1 && (
              <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600">
                On Sale
              </span>
            )}
            {product.stock_status !== "in_stock" && (
              <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                Out of Stock
              </span>
            )}
          </div>
<div className=" mt-8 flex items-center gap-8 overflow-hidden">
            <div>
              <img
                onClick={()=>setViewQr(product.qr_code)}
                src={product.qr_code}
                alt="Product"
                className="w-24 h-24 object-center "
              />
              <p className='text-sm text-gray-600 text-center'>Click to print</p>
              </div>
            <div>
            <img
            onClick={()=>setViewQr(product.barcode)}
                src={product.barcode}
                alt="Product"
                className="w-20 h-20 object-center "
              />
               <p className='text-sm   text-gray-600 text-center'>Click to print</p>
               </div>
          </div>
          
        </div>

        {/* RIGHT – DETAILS */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{product.product_name}</h1>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>

          {/* PRICE */}
          <div className="flex items-center gap-4">
            <span className="text-2xl font-semibold text-green-600">
              ₹{product.price}
            </span>
            {product.compare_price && (
              <span className="line-through text-gray-400">
                ₹{product.compare_price}
              </span>
            )}
          </div>

          {/* BASIC INFO */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><b>Brand:</b> {product.brand || "-"}</p>
            <p><b>Category:</b> {product.category_name}</p>
            <p><b>Material:</b> {product.material || "-"}</p>
            <p><b>Color:</b> {product.color || "-"}</p>
            <p><b>Stock Qty:</b> {product.stock_quantity}</p>
            <p><b>Low Stock:</b> {product.low_stock_threshold}</p>
            <p><b>Vendor ID:</b> {product.vendor_id}</p>
            <p><b>Status:</b> {product.is_active ? "Active" : "Inactive"}</p>
          </div>

         
             {/* DESCRIPTION */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-1">Short Description</h3>
            <p className="text-sm text-gray-600">
              {product.short_description || "No description provided"}
            </p>
          </div>
          {/* DESCRIPTION */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-sm text-gray-600">
              {product.description || "No description provided"}
            </p>
          </div>

        

         
        </div>
{
  viewQr&& <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 relative">

        {/* CLOSE */}
        <button
          onClick={()=>setViewQr(null)}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">
          Product QR Code
        </h2>

        {/* QR CODE */}
        <div ref={printRef} className="flex justify-center">
          <img src={viewQr} alt="QR Code" className="w-64 h-64" />
        </div>

        {/* PRINT BUTTON */}
        <button
          onClick={handlePrint}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Print QR Code
        </button>
      </div>
    </div>
}

      </div>
    </div>
  )

}

export default ProductViewPage
