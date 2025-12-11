import React, { useEffect } from 'react';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashBoardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { getMyConnectionRequests, acceptConnectionRequest, getAboutUser } from '@/config/redux/action/authAction';
import styles from "./style.module.css";
import { useRouter } from 'next/router';

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  
  const currentUser = authState.User; 
  const connectionList = authState.connectionRequest || []; 

  const getMyUserId = () => {
      if (!currentUser) return null;
      if (currentUser.userId?._id) return currentUser.userId._id;
      if (currentUser._id) return currentUser._id;
      return null;
  };

  const myId = getMyUserId();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(token) {
        dispatch(getMyConnectionRequests({ token }));
        if(!authState.User) {
            dispatch(getAboutUser({ token }));
        }
    } else {
        router.push("/login");
    }
  }, [dispatch]);

  // FILTERS
  const receivedRequests = connectionList.filter(
      (req) => req.status === null && String(req.connectionId?._id) === String(myId)
  );

  const sentRequests = connectionList.filter(
      (req) => req.status === null && String(req.userId?._id) === String(myId)
  );

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
                        <h1>{request.userId?.name || "Unknown"}</h1>
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

          {/* --- PART 2: SENT REQUESTS --- */}
          {sentRequests.length > 0 && <h4>Sent Requests (Pending)</h4>}
          {sentRequests.map((request, index) => (
              <div key={index} className={styles.userCard}>
                 <div className={styles.userInfo}>
                    <img src={request.connectionId?.profilePicture || "/default.png"} alt="" className={styles.profilePicture} />
                    <div>
                        <h1>{request.connectionId?.name || "Unknown"}</h1>
                        <p style={{fontSize:"0.8rem"}}>Request Sent to @{request.connectionId?.username}</p>
                    </div>
                 </div>
                 <button className={styles.connectedButton} disabled>Pending</button>
              </div>
          ))}

          {/* --- PART 3: MY NETWORK (FIXED LAYOUT) --- */}
          {myNetwork.length > 0 && <h4>My Network</h4>}
          {myNetwork.map((request, index) => {
                 const isSender = String(request.userId?._id) === String(myId);
                 const friend = isSender ? request.connectionId : request.userId;

                 if (!friend) return null;

                 return (
                   <div onClick={() => router.push(`/view_profile/${friend.username}`)} key={index} className={styles.userCard}>
                     {/* Yahan maine structure ko waisa hi banaya hai jaisa Received Request ka hai */}
                     <div className={styles.userInfo}>
                       <img src={friend.profilePicture || "/default.png"} alt="" className={styles.profilePicture} />
                       <div>
                         <h1>{friend.name}</h1>
                         <p>{friend.email}</p>
                       </div>
                     </div>
                   </div>
                 );
          })}

          {/* --- EMPTY STATE --- */}
          {myId && receivedRequests.length === 0 && sentRequests.length === 0 && myNetwork.length === 0 && (
              <div style={{textAlign: "center", marginTop: "40px"}}>
                  <h3>No Connections Yet</h3>
                  <button onClick={() => router.push("/discover")} style={{marginTop:"10px", padding:"10px 20px", background: "#0073b1", color: "white", border: "none", borderRadius: "5px", cursor:"pointer"}}>Discover People</button>
              </div>
          )}

        </div>
      </DashboardLayout>
    </UserLayout>
  );
}