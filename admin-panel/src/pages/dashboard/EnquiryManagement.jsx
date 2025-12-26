import { Delete, DeleteIcon, Edit2, Eye, LucideDelete, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [viewEnquiry, setViewEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing  , setIsEditing] = useState(null);
  const [orgId, setOrgId] = useState(JSON.parse(localStorage.getItem('user')).org_id);

  const [form, setForm] = useState({
    name: "",
    mobile_no: "",
    followup_date:"",
    remark: "",
    address:"",
    source:"",
    query:"",
    
  });
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Fetch enquiries from backend
  const fetchEnquiries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/enquiry/${orgId}`);
      const data = await res.json();
      console.log(data)
      setEnquiries(data.enquiry);
    } catch (err) {
      console.error("Error fetching enquiries", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if(storedUser){
      let data = JSON.parse(storedUser)
      console.log(data.org_id)
      setOrgId(data.org_id)
    }
    fetchEnquiries();
  }, []);

  // Handle form input change
  // const handleChange = (e) => {
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };
   const handleChange = (e) => {
    const { name, value } = e.target;
     const updatedValue =
    name === "name"
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;
    setForm(prev => ({ ...prev, [name]: updatedValue }));
  };



  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let URL = isEditing? `${API_BASE_URL}/enquiry/update/${isEditing}`: `${API_BASE_URL}/enquiry/create-enquiry/${orgId}`
      let method = isEditing?'PUT':'POST'
      const res = await fetch(URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
       isEditing? toast.success("Enquiry Updated successfully"):toast.success("Enquiry added successfully")
        fetchEnquiries(); // refresh list
        setIsModalOpen(false);
        setIsEditing(null)
        setForm({name: "",
    mobile_no: "",
    followup_date:"",
    remark: "",
    address:"",
    source:"",
    query:"", });
      }
    } catch (err) {
      console.error("Error adding enquiry", err);
    }
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this enquiry?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_BASE_URL}/enquiry/delete/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (res.ok) {
      // Remove from UI without refresh
      setEnquiries((prev) => prev.filter((item) => item.enquiry_id !== id));

      toast.success('Enquiry delete successfully')
    } else {
      toast.error("Something error ")
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};


const handleEdit = async(enquiry)=>{
  setIsEditing(enquiry.enquiry_id)
  setIsModalOpen(true)
  setForm({
    name: enquiry.name,
    mobile_no: enquiry.mobile_no,
    followup_date:enquiry.followup_date,
    
    address:enquiry.address,
    source:enquiry.source,
    query:enquiry.query,
    
  })
}

const handleAddEnquiry = async()=>{
   setIsModalOpen(true)
   setIsEditing(null)
   setForm({
    name: "",
    mobile_no: "",
    followup_date:"",
    remark: "",
    address:"",
    source:"",
    query:"",
   })
}

  return (
    <>
    <ToastContainer />
    <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Enquiry Management</h2>

        <button
          onClick={handleAddEnquiry}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow"
        >
          + Add Enquiry
        </button>
      </div>

     
     <div className="mt-6 space-y-4">
  {enquiries?.length > 0 ? (
    <div className="overflow-x-auto">
      <table
        className="min-w-full divide-y divide-gray-200"
      >
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">S.No.</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Enquiry Date</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Number</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Query</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Followup Date</th>
            
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {enquiries?.map((item,i) => (
            <tr  className="hover:bg-gray-50 transition-colors" key={item.enquiry_id}>
              <td className='py-2 px-2 text-left'>{i+1}</td>
              <td className="py-2 px-2 text-left ">{new Date(item.created_at).toLocaleDateString()}</td>
              <td className='py-2 px-2 text-left'>{item.name}</td>
              <td className='py-2 px-2 text-left'> {item.mobile_no}</td>
              <td className='py-2 px-2 text-left'> {item.query}</td>
              <td className='py-2 px-2 text-left'>  {new Date(item.followup_date).toLocaleDateString()}</td>
             
              
             
              <td className='items-center'>
            <div className="flex items-center justify-center gap-2">
                       <button
                          onClick={() => setViewEnquiry(item)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Order"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-green-800 transition-colors"
                          title="Edit Order"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.enquiry_id)}
                          title="Delete Order"
                        >
                          <Trash2 className="text-red-600 hover:text-red-800 transition-colors" />
                        </button>
                      </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
  ) : (
    <p className="text-center text-gray-500">No enquiries found</p>
  )}
</div>



      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 w-full flex justify-center items-center z-50">
  <div className="bg-white w-full max-w-5xl p-6 rounded-xl shadow-lg">
    <h3 className="text-xl font-semibold mb-4">{isEditing?'Update Enquiry':'Create Enquiry'}</h3>

    <form className="space-y-4">
      {/* GRID LAYOUT - 4 COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="User Name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value.charAt(0).toUpperCase()+e.target.value.slice(1) }))}
            className="w-full px-3 py-2  border-gray-700 border-2 dark rounded-lg"
          />
        </div>
          <div>
              <label className="block text-sm font-medium">
              
              Phone
              </label>
              <input
              type="tel"
                inputMode="numeric"             // Mobile numeric keyboard
                pattern="\d{10}"
                maxLength={10}
                minLength={10}
                placeholder="Phone Number"
                value={form.mobile_no}
                onChange={(e) => {
                   const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric
                    setForm(prev => ({ ...prev, mobile_no: value }));
                }}
                  className="w-full px-3 py-2 border-black border-2 rounded-lg"
                  
                  />
                </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full px-3 py-2 border-black border-2 rounded-lg"
          />
        </div>
            
        {/* Expense Date */}
        <div>
          <label className="block text-sm font-medium">Followup Date</label>
          <input
            type="date"
            name="followup_date"
            value={form.followup_date}
            onChange={handleChange}
            placeholder="Followup Date"
            className="w-full px-3 py-2 border-black border-2 rounded-lg"
          />
        </div>

        {/* Category */}
        

        {/* Product / Service */}
       

         <div>
          <label className="block text-sm font-medium">Source</label>
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            placeholder="Source"
            className="w-full px-3 py-2 border-black border-2 rounded-lg"
          >
            <option value="">Select</option>
            <option value="Social Media">Social Media</option>
            <option value="Google">Google</option>
            <option value="Bussiness Supplier">Bussiness Supplier</option>
            <option value="Friends">Friends</option>
            <option value="Walking">Walking</option>
            <option value="Others">Others</option>
          </select>
        </div>
        

       
        

      </div>

      {/* Description - Full Width */}
      <div>
        <label className="block text-sm font-medium">Query</label>
        <textarea
          name="query"
          placeholder="Query"
          value={form.query}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-black border-2 rounded-lg"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          {isEditing?'Update':'Create'}
        </button>

        <button
          type="button"
          onClick={() => setIsModalOpen(null)}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>
      )}
    </div>

    {
      viewEnquiry&& <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* MODAL */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={()=>setViewEnquiry(null)}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* HEADER */}
        <h2 className="text-xl font-bold mb-4">Enquiry Details</h2>

        {/* CONTENT */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-800">Name</p>
            <p className="font-medium">{viewEnquiry.name}</p>
          </div>

          <div>
            <p className="text-gray-800">Mobile No</p>
            <p className="font-medium">{viewEnquiry.mobile_no}</p>
          </div>

          <div>
            <p className="text-gray-800">Source</p>
            <p className="font-medium">{viewEnquiry.source}</p>
          </div>

          <div>
            <p className="text-gray-800">Address</p>
            <p className="font-medium">{viewEnquiry.address}</p>
          </div>

          <div>
            <p className="text-gray-800">Follow-up Date</p>
            <p className="font-medium">
              {new Date(viewEnquiry.followup_date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-gray-800">Created At</p>
            <p className="font-medium">
              {new Date(viewEnquiry.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* QUERY */}
        <div className="mt-4">
          <p className="text-gray-700 text-sm">Query</p>
          <p className="bg-gray-100 rounded-lg p-3 text-sm">
            {viewEnquiry.query || "-"}
          </p>
        </div>

        

        {/* FOOTER */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={()=>setViewEnquiry(null)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    }
    </>
  );
};

export default EnquiryManagement;
