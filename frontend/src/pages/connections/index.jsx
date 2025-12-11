import React, { useEffect } from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashBoardLayout'
import { useDispatch, useSelector } from 'react-redux';
import { getMyConnectionRequests, acceptConnectionRequest, getAboutUser } from '@/config/redux/action/authAction';
import styles from "./style.module.css"
import { useRouter } from 'next/router';

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  
  const currentUser = authState.user; 
  // Safety: Agar connectionRequest undefined hai to empty array maano
  const connectionList = authState.connectionRequest || []; 

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if(token) {
        // 1. Hamesha Connection Requests fetch karo (Refresh hone par bhi)
        dispatch(getMyConnectionRequests({ token }));
        
        // 2. Agar User Data Redux mein nahi hai, toh fetch karo
        if(!authState.user) {
            console.log("Fetching User Data..."); // Debugging ke liye
            dispatch(getAboutUser({ token }));
        }
    } else {
        // Agar token hi nahi hai, Login par bhej do
        router.push("/login");
    }
  }, [dispatch]); // Dependency mein dispatch daalo (Best Practice)

  // --- SHORTCUT: Agar User Load ho raha hai ---
  if (!currentUser) {
     return (
        <UserLayout>
           <DashboardLayout>
              <div style={{padding: "50px", textAlign: "center"}}>
                 <h3>Loading Profile...</h3>
                 <p style={{fontSize: "12px", color: "gray"}}>Please wait while we fetch your data</p>
              </div>
           </DashboardLayout>
        </UserLayout>
     );
  }

  // --- FILTERS ---

  // 1. Received (Jo mujhe aayi hain)
  const receivedRequests = connectionList.filter(
      (req) => req.status === null && req.connectionId?._id === currentUser._id
  );

  // 2. Sent (Jo maine bheji hain)
  const sentRequests = connectionList.filter(
      (req) => req.status === null && req.userId?._id === currentUser._id
  );

  // 3. Network (Dost)
  const myNetwork = connectionList.filter(
      (req) => req.status === true
  );

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          {/* --- Section 1: RECEIVED --- */}
          {receivedRequests.length > 0 && <h4>Received Requests</h4>}
          {receivedRequests.map((request, index) => (
              <div key={index} className={styles.userCard}>
                 <div className={styles.userInfo}>
                    <img src={request.userId?.profilePicture || "/default.png"} alt="" className={styles.profilePicture} />
                    <div>
                        <h1>{request.userId?.name}</h1>
                        <p style={{fontSize:"0.8rem"}}>Request from @{request.userId?.username}</p>
                    </div>
                 </div>
                 <button onClick={() => {
                    dispatch(acceptConnectionRequest({ 
                        token: localStorage.getItem("token"), 
                        connectionId: request._id, 
                        action: "accept" 
                    }))
                    .then(() => {
                        // Instant Refresh
                        dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
                    });
                 }} className={styles.connectedButton}>Accept</button>
              </div>
          ))}

          {/* --- Section 2: SENT (PENDING) --- */}
          {sentRequests.length > 0 && <h4>Sent Requests (Pending)</h4>}
          {sentRequests.map((request, index) => (
              <div key={index} className={styles.userCard} style={{opacity: 0.7, backgroundColor: "#f9f9f9"}}>
                 <div className={styles.userInfo}>
                    <img src={request.connectionId?.profilePicture || "/default.png"} alt="" className={styles.profilePicture} />
                    <div>
                        <h1>{request.connectionId?.name}</h1>
                        <p style={{fontSize:"0.8rem"}}>Request Sent to @{request.connectionId?.username}</p>
                    </div>
                 </div>
                 <button className={styles.connectedButton} disabled style={{backgroundColor: "gray", cursor: "not-allowed"}}>Pending</button>
              </div>
          ))}

          {/* --- Section 3: MY NETWORK --- */}
          {myNetwork.length > 0 && <h4>My Network</h4>}
          {myNetwork.map((request, index) => {
                 // Logic to find Friend
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

          {/* --- Section 4: EMPTY STATE (Agar kuch nahi hai) --- */}
          {receivedRequests.length === 0 && sentRequests.length === 0 && myNetwork.length === 0 && (
              <div style={{textAlign: "center", marginTop: "50px"}}>
                  <h3>No Connections Yet</h3>
                  <button onClick={() => router.push("/discover")} style={{marginTop:"10px", padding:"10px 20px", cursor:"pointer"}}>Go to Discover</button>
              </div>
          )}

        </div>
      </DashboardLayout>
    </UserLayout>
  );
}