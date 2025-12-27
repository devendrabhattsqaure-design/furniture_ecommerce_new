import React from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

export function Notifications() {
  
     const {fetchNotifications,notifications} = useAuth()
   const [orgId, setOrgId] = useState(JSON.parse(localStorage.getItem('user')).org_id);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleDelete = async(id)=>{
  let res = await axios.put(`${API_BASE_URL}/notifications/delete/${id}`)
  let data = res.data
  if(data.success){
    // toast.success('')
    fetchNotifications(orgId)
  }
}

  useEffect(() => {
    fetchNotifications(orgId);
    // console.log(notifications)
   
  }, []);
  const [showAlerts, setShowAlerts] = React.useState({
    blue: true,
    green: true,
    orange: true,
    red: true,
  });
  const [showAlertsWithIcon, setShowAlertsWithIcon] = React.useState({
    blue: true,
    green: true,
    orange: true,
    red: true,
  });
  const alerts = ["gray", "green", "orange", "red"];

  return (
    <>
    <ToastContainer autoClose="1000" />
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            Alerts
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4 bg-gray-300">
          {notifications?.map((item) => (
            <div
              
              className="bg-orange-800 w-full p-4 border rounded-md"
           
            >
              <div  className="flex w-full justify-between  items-center ">
                <div className="flex flex-col ">
              <h4 className="text-gray-900">{item.title}</h4>
              
             <p className="text-white text-sm"> {item.message}</p>
                </div>
               <X onClick={()=>handleDelete(item.id)} className="text-black cursor-pointer"/>
              </div>
             
            </div>
          ))}
        </CardBody>
      </Card>
      <Card>
       
         
      </Card>
    </div>
    </>
    
   
  );
}

export default Notifications;
