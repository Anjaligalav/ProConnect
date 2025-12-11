import React, { useEffect } from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashBoardLayout'
import { useDispatch } from 'react-redux';
import { getMyConnectionRequests, acceptConnectionRequest } from '@/config/redux/action/authAction';
import { useSelector } from 'react-redux';
import styles from "./style.module.css"
import { BASE_URL } from '@/config/index';
import { useRouter } from 'next/router';

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  
  // Current Logged In User ka data chahiye compare karne ke liye
  // Maan lijiye authState.user mein logged in user stored hai
  const currentUser = authState.user; 

  useEffect(() => {
    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          {/* --- PART 1: PENDING REQUESTS (Sirf wo dikhao jo MUJHE aayi hain) --- */}
          <h4>My Connections (Requests)</h4>
          {authState.connectionRequest.filter((request) => request.status === null && request.connectionId._id === currentUser._id).map((request, index) => {
            return (
              <div key={index} className={styles.userCard}>
                 {/* Yahan Sender (userId) hi dikhana hai kyunki request aayi hai */}
                 <div className={styles.userInfo}>
                    <img src={request.userId.profilePicture} alt="" className={styles.profilePicture} />
                    <div>
                        <h1>{request.userId.name}</h1>
                        <p>{request.userId.email}</p>
                    </div>
                 </div>
                 <button onClick={() => {
                    // FIX: Accept karne ke baad list REFRESH karo
                    dispatch(acceptConnectionRequest({ 
                        token: localStorage.getItem("token"), 
                        connectionId: request._id, 
                        action: "accept" 
                    }))
                    .then(() => {
                        // Instant Update ke liye wapas fetch karo
                        dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
                    });
                 }} className={styles.connectedButton}>Accept</button>
              </div>
            );
          })}

          {/* --- PART 2: MY NETWORK (Accepted - Dono taraf) --- */}
          <h4>My Network</h4>
          {authState.connectionRequest.filter((request) => request.status === true).map((request, index) => {
             
             // LOGIC: Pata karo Dost kaun hai (Jo Main NAHI hu)
             const isSender = request.userId._id === currentUser._id;
             const friend = isSender ? request.connectionId : request.userId;

             return (
               <div onClick={() => router.push(`/view_profile/${friend.username}`)} key={index} className={styles.userCard}>
                 <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                   <div className={styles.profilePicture}>
                     <img src={friend.profilePicture} alt="" />
                   </div>
                   <div className={styles.userInfo}>
                     <h1>{friend.name}</h1>
                     <p>{friend.email}</p>
                   </div>
                 </div>
               </div>
             );
          })}

        </div>
      </DashboardLayout>
    </UserLayout>
  );
}