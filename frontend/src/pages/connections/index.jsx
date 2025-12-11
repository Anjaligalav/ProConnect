import React, { useEffect } from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashBoardLayout'
import { useDispatch, useSelector } from 'react-redux';
import { getMyConnectionRequests, acceptConnectionRequest, getAboutUser } from '@/config/redux/action/authAction'; // getAboutUser import kiya
import styles from "./style.module.css"
import { useRouter } from 'next/router';

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  
  const currentUser = authState.user; 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(token) {
        // 1. Connections Lao
        dispatch(getMyConnectionRequests({ token }));
        
        // 2. Loading Fix: Agar User Data nahi hai, toh fetch karo
        if(!authState.user) {
            dispatch(getAboutUser({ token }));
        }
    }
  }, []);

  // Safety Check
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

  // --- FILTERS ---
  
  // 1. Request MUJHE aayi hai (Main Receiver hu)
  const receivedRequests = authState.connectionRequest.filter(
      (req) => req.status === null && req.connectionId?._id === currentUser._id
  );

  // 2. Request MAINE bheji hai (Main Sender hu) -- NEW
  const sentRequests = authState.connectionRequest.filter(
      (req) => req.status === null && req.userId?._id === currentUser._id
  );

  // 3. Dost ban chuke hain (Accepted)
  const myNetwork = authState.connectionRequest.filter(
      (req) => req.status === true
  );

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          {/* --- PART 1: RECEIVED REQUESTS (Accept Button) --- */}
          <h4>Received Requests</h4>
          {receivedRequests.length === 0 ? (
             <p style={{color: "gray", fontSize: "0.9rem"}}>No new requests received.</p>
          ) : (
             receivedRequests.map((request, index) => (
              <div key={index} className={styles.userCard}>
                 <div className={styles.userInfo}>
                    <img src={request.userId?.profilePicture || "/default.png"} alt="" className={styles.profilePicture} />
                    <div>
                        <h1>{request.userId?.name}</h1>
                        <p style={{fontSize:"0.8rem"}}>{request.userId?.username} • Sent you a request</p>
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

          {/* --- PART 2: SENT REQUESTS (Sirf dekhne ke liye) --- */}
          <h4>Sent Requests (Pending)</h4>
          {sentRequests.length === 0 ? (
             <p style={{color: "gray", fontSize: "0.9rem"}}>No pending sent requests.</p>
          ) : (
             sentRequests.map((request, index) => (
              <div key={index} className={styles.userCard} style={{opacity: 0.7}}>
                 <div className={styles.userInfo}>
                    {/* Yahan ConnectionId (Jisko bheja) dikhayenge */}
                    <img src={request.connectionId?.profilePicture || "/default.png"} alt="" className={styles.profilePicture} />
                    <div>
                        <h1>{request.connectionId?.name}</h1>
                        <p style={{fontSize:"0.8rem"}}>Request Sent to {request.connectionId?.username}</p>
                    </div>
                 </div>
                 <button className={styles.connectedButton} disabled style={{backgroundColor: "gray", cursor: "default"}}>Pending</button>
              </div>
            ))
          )}

          {/* --- PART 3: MY NETWORK --- */}
          {myNetwork.length > 0 && (
            <>
              <h4>My Network</h4>
              {myNetwork.map((request, index) => {
                 const isSender = request.userId?._id === currentUser._id;
                 const friend = isSender ? request.connectionId : request.userId;

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
            </>
          )}

        </div>
      </DashboardLayout>
    </UserLayout>
  );
}