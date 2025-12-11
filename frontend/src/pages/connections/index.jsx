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
  
  // Data extraction with safety
  const currentUser = authState.User; 
  const connectionList = authState.connectionRequest || []; 

  // --- LOGIC FIX: Current User ID nikalne ka sahi tareeka ---
  // Kabhi user object direct hota hai, kabhi profile ke andar. Dono check kar lo.
  const currentUserId = currentUser?.userId?._id || currentUser?._id;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(token) {
        dispatch(getMyConnectionRequests({ token }));
        
        if(!authState.user) {
            dispatch(getAboutUser({ token }));
        }
    } else {
        router.push("/login");
    }
  }, [dispatch]);

  // Loading State
  if (!currentUser) {
     return (
        <UserLayout>
           <DashboardLayout>
              <div style={{padding: "50px", textAlign: "center"}}>
                 <h3>Loading Profile...</h3>
              </div>
           </DashboardLayout>
        </UserLayout>
     );
  }

  // --- MAIN LOGIC: Lists ko separate karo ---

  // 1. RECEIVED: Request muj tak aayi hai (ConnectionId == Me)
  const receivedRequests = connectionList.filter(
      (req) => req.status === null && req.connectionId?._id === currentUserId
  );

  // 2. SENT: Request maine bheji hai (UserId == Me)
  const sentRequests = connectionList.filter(
      (req) => req.status === null && req.userId?._id === currentUserId
  );

  // 3. NETWORK: Jo dost ban chuke hain (Status == true)
  const myNetwork = connectionList.filter(
      (req) => req.status === true
  );

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          {/* --- PART 1: RECEIVED REQUESTS --- */}
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
                        dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
                    });
                 }} className={styles.connectedButton}>Accept</button>
              </div>
          ))}

          {/* --- PART 2: SENT REQUESTS (Ab ye dikhega!) --- */}
          {sentRequests.length > 0 && <h4>Sent Requests (Pending)</h4>}
          {sentRequests.map((request, index) => (
              <div key={index} className={styles.userCard} style={{opacity: 0.7, backgroundColor: "#f9f9f9"}}>
                 <div className={styles.userInfo}>
                    {/* Yahan hum ConnectionId (Jisko bheja) ki photo dikhayenge */}
                    <img src={request.connectionId?.profilePicture || "/default.png"} alt="" className={styles.profilePicture} />
                    <div>
                        <h1>{request.connectionId?.name}</h1>
                        <p style={{fontSize:"0.8rem"}}>Request Sent to @{request.connectionId?.username}</p>
                    </div>
                 </div>
                 <button className={styles.connectedButton} disabled style={{backgroundColor: "gray", cursor: "default", border:"none"}}>Pending</button>
              </div>
          ))}

          {/* --- PART 3: MY NETWORK --- */}
          {myNetwork.length > 0 && <h4>My Network</h4>}
          {myNetwork.map((request, index) => {
                 const isSender = request.userId?._id === currentUserId;
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

          {/* --- EMPTY STATE --- */}
          {receivedRequests.length === 0 && sentRequests.length === 0 && myNetwork.length === 0 && (
              <div style={{textAlign: "center", marginTop: "40px"}}>
                  <h3>No Connections Yet</h3>
                  <p style={{color: "gray"}}>Go to Discover to find people.</p>
                  <button onClick={() => router.push("/discover")} style={{marginTop:"10px", padding:"10px 20px", cursor:"pointer"}}>Discover</button>
              </div>
          )}

        </div>
      </DashboardLayout>
    </UserLayout>
  );
}