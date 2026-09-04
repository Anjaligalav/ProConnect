import { BASE_URL, clientServer } from '@/config';
import DashboardLayout from '@/layout/DashBoardLayout';
import UserLayout from '@/layout/UserLayout';
import { useSearchParams } from 'next/navigation'
import React, { use } from 'react'
import { useEffect } from 'react'
import styles from "./style.module.css"
import { userAgent } from 'next/server';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { getConnectionRequests,getMyConnectionRequests,sendConnectionRequest } from '@/config/redux/action/authAction';

export default function ViewProfilePage({userProfile}) {

  const router = useRouter();
  const postState = useSelector((state) => state.post);
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const[userPosts,setUserPosts] = useState([]);

  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);

  const [isConnectionNull, setIsConnectionNull] = useState(true);
  const getUserPost = async () => {
    await dispatch(
      getAllPosts({
        token: localStorage.getItem("token"),
      })
    );
    await dispatch(
      getConnectionRequests({
        token: localStorage.getItem("token"),
      })
    );

    await dispatch(
      getMyConnectionRequests({
        token: localStorage.getItem("token"),
      })
    )

  }

  useEffect(() => {
    let post = postState.posts.filter((post) => {
      return post.userId?.username === router.query.username; 
    })
    setUserPosts(post);
  }, [postState.posts]);

  useEffect(() => {

    if(authState.connections.some(user => user.connectionId?._id === userProfile.userId._id)) {
      setIsCurrentUserInConnection(true);

      if(authState.connections.find(user => user.connectionId?._id === userProfile.userId._id).status === true) {
        setIsConnectionNull(false);
      }
    }


    if(authState.connectionRequest.some(user => user.userId?._id === userProfile.userId._id)) {
      setIsCurrentUserInConnection(true);

      if(authState.connectionRequest.find(user => user.userId?._id === userProfile.userId._id).status === true) {
        setIsConnectionNull(false);
      }
    }
  }, [authState.connections,authState.connectionRequest]);


  useEffect(() => {
    getUserPost();
  }, []);

  const searchParams = useSearchParams();
  useEffect(() => {
    console.log("from View");
  },[searchParams]);


  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img className={styles.backDrop} src={userProfile.userId.profilePicture} alt="" />
          </div>

          <div className={styles.profileContainerDetails}>
            <div className={styles.profileContainer__flex}>
              
              <div style={{flex:"0.8"}}>
                
                <div style={{display:"flex",width:"fit-content",alignItems:"center",gap:"1.2rem"}}>
                  <h2>{userProfile.userId.name}</h2> 
                  <p style={{color:"gray"}}>@{userProfile.userId.username}</p> 
                </div>

                <div style={{display:"flex",alignItems:"center",gap:"1.2rem"}}>
                  {isCurrentUserInConnection?
                  <button className={styles.connectedButton}> {isConnectionNull? "Pending" : "Connected"}</button>
                  :
                  <button onClick={()=>{
                    dispatch(sendConnectionRequest({token:localStorage.getItem("token"),connectionId:userProfile.userId._id}));
                  }} className={styles.connectButton}>Connect</button>
                  }

                  <div onClick={async() =>{
                    const response = await clientServer.get(`/user_download_resume?id=${userProfile.userId._id}`);
                    window.open(`${BASE_URL}/${response.data.message}`,"_blank");
                  }} style={{cursor:"pointer"}}>
                  <svg style={{width:"1.2rem"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
</svg>

                  </div>
                </div>

                <div>
                  <p>{userProfile.bio}</p>
                </div>
              
              </div>

              
              
              <div style={{flex:"0.2"}}>
                <h3>Recent Activity</h3>
                {userPosts.map((post) => {
                  return(
                    <div key={post._id} className={styles.posCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContainer}>
                          {post.media !== ""?
                          <img className={styles.card_profile} src={post.media} alt="" />:
                          <div style={{width:"3.4rem",height:"3.4rem"}}></div>}

                          <p>{post.body}</p>
                        </div>
                      </div>
                    </div> 
                  )
                })}
              </div>
            
            
            </div>
          </div>

          <div className={styles.workHistory}>
            <h4>Work History</h4>
            <div className={styles.workHistoryContainer}>
                {
                  userProfile.pastWork.map((work,index) => {
                    return(
                      <div key={index} className={styles.workHistoryCard}>
                        <p style={{fontWeight:"bold",display:"flex",gap:"0.8rem",alignItems:"center"}}>{work.company} - {work.position}</p>
                        <p>{work.years}</p>
                      </div>
                    )
                  })
                }
            </div>
          </div>

        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export async function getServerSideProps(context){
  console.log("from server"); 
  console.log(context.query.username); 

  const request = await clientServer.get(`/user/get_profile_based_on_username`,{
    params:{
      username:context.query.username
    }
  });

  const response = await request.data;
  console.log(response);
  return {
        props: {userProfile:request.data.userProfile}
    }
}