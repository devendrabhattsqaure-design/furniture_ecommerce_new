import React, { useEffect, useState } from "react";

const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orgId, setOrgId] = useState(JSON.parse(localStorage.getItem('user')).org_id);

  const [form, setForm] = useState({
    name: "",
    mobile_no: "",
    followup_date:"",
    remark: "",
    org_id:""
  });

  // Fetch enquiries from backend
  const fetchEnquiries = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/enquiry/${orgId}`);
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
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/api/enquiry/create-enquiry/${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Enquiry added successfully!");
        fetchEnquiries(); // refresh list
        setIsModalOpen(false);
        setForm({ name: "", org_id: orgId, mobile_no: "", remark: "" });
      }
    } catch (err) {
      console.error("Error adding enquiry", err);
    }
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this enquiry?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:5000/api/enquiry/delete/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (res.ok) {
      // Remove from UI without refresh
      setEnquiries((prev) => prev.filter((item) => item.enquiry_id !== id));

      alert("Enquiry deleted successfully!");
    } else {
      alert(data.message || "Failed to delete enquiry");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};


  return (
    <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Enquiry Management</h2>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow"
        >
          + Add Enquiry
        </button>
      </div>

     
     <div className="mt-6 space-y-4">
  {enquiries.length > 0 ? (
    enquiries.map((item) => (
      <div
        key={item.id}
        className="w-full bg-white  shadow-md rounded-lg p-4 border"
      >
        {/* FIRST ROW — NAME + MOBILE (left) | DATE + DELETE (right) */}
        <div className="flex justify-between items-center">
          
          {/* LEFT SIDE */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <p className="text-lg font-semibold">{item.name}</p>
            <p className="text-gray-700">
              📞 <span className="font-medium">{item.mobile_no}</span>
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            Created At -
            <span className="text-sm text-gray-500">
              
              {new Date(item.created_at ).toLocaleDateString()}
            </span>

            
          </div>

        </div>

        {/* SECOND ROW — REMARK */}
        <div className="text-sm text-gray-700 overflow-auto">
          Follow up -
      {new Date(item.followup_date).toLocaleDateString()}
        </div>
        <p className="mt-3 text-gray-700 break-words whitespace-pre-wrap overflow-hidden ">
          📝 {item.remark}
        </p>

      </div>
    ))
  ) : (
    <p className="text-center text-gray-500">No enquiries found</p>
  )}
</div>



      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add Enquiry</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
                required
              />

             

              <input
                type="text"
                name="mobile_no"
                placeholder="mobile_no"
                value={form.mobile_no}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
              <input
                type="date"
                name="followup_date"
                placeholder="Followup_date"
                value={form.followup_date}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />


              <textarea
                name="remark"
                placeholder="remark"
                value={form.remark}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
                rows={3}
              />

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryManagement;
