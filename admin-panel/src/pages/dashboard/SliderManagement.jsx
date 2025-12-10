import React, { useEffect, useState } from "react";
import { json } from "react-router-dom";



const SliderManagement = () => {
  const [sliders,setSliders] =useState([])
  const [showModal, setShowModal] = useState(false);
    const [editingSlider, setEditingSlider] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
     const [orgId, setOrgId] = useState(JSON.parse(localStorage.getItem('user')).org_id);

const [formData, setFormData] = useState({
  title: "",
  orgid: "",
  description: "",
  image: null
});
const [preview, setPreview] = useState("");
  const getAllSliders = async()=>{
    let data = await  fetch(`http://localhost:5000/api/slider/${orgId}`, {
        method: 'GET',
       })
       
       const response= await data.json();
       if(response.success){
         setSliders(response.sliders)
       }
       
  }


   const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

   const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, WebP, GIF)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Store file for upload
      setFormData(prev => ({
        ...prev,
        image_url: file
      }));
    }
  };
   const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      
    }));
  };


   const resetForm = () => {
    setFormData({
      title: '',
     
      description: '',
     
      imagefile: '',
     
    });
    setImagePreview(null);
    setEditingSlider(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      
      // Append all form data
      submitData.append('title', formData.title);
     
      submitData.append('description', formData.description);
      
      
      // Append image file if selected
      if (formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      const url = editingSlider 
        ? `http://localhost:5000/api/slider/edit-slider/${editingSlider.banner_id}`
        : 'http://localhost:5000/api/slider/add-slider';
      
      const method = editingSlider ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Post ${editingSlider ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        resetForm();
        getAllSliders();
      } else {
        alert(result.message || 'Error saving post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    }
  };

  const handleEdit = (slide) => {
  setEditingSlider(slide);
  
  // Fix for tags parsing
  



  setFormData({
    title: slide.title,
    description: slide.description,
    
    featured_image: slide.image_url || '',
    
  });
  setImagePreview(slide.image_url || null);
  setShowModal(true);
};

   const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image_url: '',
      imageFile: null
    }));
  };

  const handleDeleteSlide = async(slideId)=>{
     if (!confirm('Are you sure you want to delete this slide?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/slider/delete-slider/${slideId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Slide deleted successfully!');
        setSliders(prev => prev.filter(slide => slide.banner_id !== slideId));
      } else {
        alert(result.message || 'Error deleting post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  }
  
  useEffect(()=>{
    const storedUser = localStorage.getItem('user')
    if(storedUser){
      let data = JSON.parse(storedUser)
      setOrgId(data.org_id)
    }
   getAllSliders() 
   
  },[orgId])
  return (
    <>
    <div className="mt-12">
      <div className="mb-4 rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Slider Management</h2>
        <div className="mb-4">
          <button  onClick={() => {
              resetForm();
              setShowModal(true);
            }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add New Slide
          </button>
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4">
        {
          sliders.map((item)=>(
           
          <div className="border rounded-lg p-4">
            <img src={item.image_url} alt="Slide 1" className="w-full h-32 object-cover rounded mb-2" />
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
            <div className="mt-2 flex space-x-2">
              <button onClick={()=>{handleEdit(item)}} className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
              <button onClick={()=>{handleDeleteSlide(item.banner_id)}} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
            </div>
          </div>
          ))
        }
        </div>
        
      </div>
    </div>
     {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingSlider ? 'Edit Slider' : 'Add New Slider'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-48 h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="featured_image"
                      />
                      <label
                        htmlFor="featured_image"
                        className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 inline-flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose Image
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        JPEG, PNG, WebP, GIF • Max 5MB
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                 
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

               

                


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                 
                </div>

               

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingSlider ? 'Update Slider' : 'Create New Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SliderManagement;