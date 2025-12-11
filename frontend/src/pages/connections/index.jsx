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

  // --- FIX 1: SAFETY CHECK (CRASH ROKNE KE LIYE) ---
  // Agar user load nahi hua, toh aage mat badho
  if (!currentUser) {
     return (
        <UserLayout>
           <DashboardLayout>
              <div style={{padding: "20px", textAlign: "center"}}>
                 <h3>Loading...</h3>
              </div>
           </DashboardLayout>
        </UserLayout>
     );
  }

  // Filters
  const pendingRequests = authState.connectionRequest.filter(
      (req) => req.status === null && req.connectionId?._id === currentUser._id
  );

  const myNetwork = authState.connectionRequest.filter(
      (req) => req.status === true
  );

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          {/* --- PART 1: PENDING REQUESTS --- */}
          <h4>My Connections (Requests)</h4>
          
          {pendingRequests.length === 0 ? (
             <p style={{color: "gray"}}>No Connection Request Pending</p>
          ) : (
             pendingRequests.map((request, index) => (
              <div key={index} className={styles.userCard}>
                 <div className={styles.userInfo}>
                    {/* ? ka use kiya taaki crash na ho */}
                    <img src={request.userId?.profilePicture} alt="" className={styles.profilePicture} />
                    <div>
                        <h1>{request.userId?.name}</h1>
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
            ))
          )}

          {/* --- PART 2: MY NETWORK (Sirf tab dikhao jab dost hon) --- */}
          {myNetwork.length > 0 && (
            <>
              <h4>My Network</h4>
              {myNetwork.map((request, index) => {
                 // Pata karo dost kaun hai
                 const isSender = request.userId?._id === currentUser._id;
                 const friend = isSender ? request.connectionId : request.userId;

                 if (!friend) return null; // Safety

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
            </>
          )}

        </div>
      </DashboardLayout>
    </UserLayout>
  );
}