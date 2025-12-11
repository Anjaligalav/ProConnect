import React, { useEffect } from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashBoardLayout'
import { useDispatch } from 'react-redux';
import { getMyConnectionRequests, acceptConnectionRequest } from '@/config/redux/action/authAction';
import { useSelector } from 'react-redux';
import styles from "./style.module.css"
import { useRouter } from 'next/router';

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  
  const currentUser = authState.user; 

  useEffect(() => {
    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
  }, []);

  // --- FIX 1: AGAR USER LOAD NAHI HUA, TOH WAIT KARO (CRASH MAT KARO) ---
  if (!currentUser) {
    return (
        <UserLayout>
            <DashboardLayout>
                <div style={{padding: "20px", textAlign: "center"}}>
                    <h3>Loading Profile...</h3>
                </div>
            </DashboardLayout>
        </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          {/* --- PART 1: PENDING REQUESTS --- */}
          <h4>My Connections (Requests)</h4>
          
          {authState.connectionRequest.length === 0 && <p>No pending requests.</p>}

          {authState.connectionRequest
            .filter((request) => 
                // FIX 2: Optional Chaining (?.) lagaya taaki crash na ho
                request.status === null && 
                request.connectionId?._id === currentUser?._id
            )
            .map((request, index) => {
            return (
              <div key={index} className={styles.userCard}>
                 <div className={styles.userInfo}>
                    {/* Safety check for image */}
                    <img 
                        src={request.userId?.profilePicture || "/default.png"} 
                        alt="" 
                        className={styles.profilePicture} 
                    />
                    <div>
                        <h1>{request.userId?.name || "Unknown User"}</h1>
                        <p>{request.userId?.email}</p>
                    </div>
                 </div>
                 <button onClick={() => {
                    dispatch(acceptConnectionRequest({ 
                        token: localStorage.getItem("token"), 
                        connectionId: request._id, 
                        action: "accept" 
                    }))
                    .then(() => {
                        dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
                    });
                 }} className={styles.connectedButton}>Accept</button>
              </div>
            );
          })}

          {/* --- PART 2: MY NETWORK --- */}
          <h4>My Network</h4>
          
          {authState.connectionRequest
            .filter((request) => request.status === true)
            .map((request, index) => {
             
             // LOGIC: Pata karo Dost kaun hai
             // FIX 3: Safety Checks yahan bhi lagaye
             const isSender = request.userId?._id === currentUser?._id;
             const friend = isSender ? request.connectionId : request.userId;

             // Agar friend data populate nahi hua (Deleted user), toh card mat dikhao
             if (!friend) return null;

             return (
               <div onClick={() => router.push(`/view_profile/${friend.username}`)} key={index} className={styles.userCard}>
                 <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                   <div className={styles.profilePicture}>
                     <img src={friend.profilePicture || "/default.png"} alt="" />
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