import React from 'react'
import styles from "./style.module.css"
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashBoardLayout'
import { getAboutUser } from '@/config/redux/action/authAction'
import { useEffect, useState } from 'react'
import { BASE_URL, clientServer } from '@/config/index'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { getAllPosts } from '@/config/redux/action/postAction'
import { current } from '@reduxjs/toolkit'

export default function ProfilePage() {
  
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const router = useRouter();

  const [userProfile,setUserProfile] = useState(authState.User);
  const [userPosts,setUserPosts] = useState([]);

  const [isModalOpen,setIsModalOpen] = useState(false);

  const [inputData, setInputData] = useState({company:"",position:"",years:""});

  const handleWorkInputChange = (e) => {
    
    const {name,value} = e.target;

    setInputData({...inputData,[name]:value});
  }

  useEffect(()=>{
    dispatch(getAboutUser({token:localStorage.getItem("token")}));
    dispatch(getAllPosts({token:localStorage.getItem("token")}));
  },[])
  
  useEffect(()=>{
    

    if(authState.User !== undefined){
      setUserProfile(authState.User);
      let post = postState.posts.filter((post) => {
        return post.userId?.username === authState.User.userId.username; 
      })
      setUserPosts(post);
    }
    
      
  },[authState.User,postState.posts])

  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture",file);
    formData.append("token",localStorage.getItem("token"));
    const res = await clientServer.post(`/upload_profile_picture`,formData,{
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    dispatch(getAboutUser({token:localStorage.getItem("token")}));
  }


  const updateProfileData = async() =>{
    const request = await clientServer.post(`/user_update`,{
      token:localStorage.getItem("token"),
      name:userProfile.userId.name
    });

    const response = await clientServer.post(`/update_profile_data`,{
      token:localStorage.getItem("token"),
      bio:userProfile.bio,
      currentPost:userProfile.currentPost,
      pastWork:userProfile.pastWork,
      education:userProfile.education
    });

    dispatch(getAboutUser({token:localStorage.getItem("token")}));
  }
  
  return (
    <UserLayout>
      <DashboardLayout>
      {authState.User && authState.User.userId && userProfile &&
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <label htmlFor='profilePictureUpload' className={styles.backDrop_overlay}>
              <p>Edit</p>
            </label>
            <input onChange={(e) => updateProfilePicture(e.target.files[0])} hidden type="file" id="profilePictureUpload" />
              <img src={userProfile.userId.profilePicture} alt="" />
            
          </div>

          <div className={styles.profileContainerDetails}>
            <div style={{display:"flex",gap:"0.7rem"}}>
              
              <div style={{flex:"0.75"}}>
                
                <div style={{display:"flex",width:"fit-content",alignItems:"center",gap:"1.2rem"}}>
                  <input className={styles.nameEdit} type="text" value={userProfile.userId.name} onChange={(e)=>{
                    setUserProfile({...userProfile,userId:{...userProfile.userId,name:e.target.value}});
                  }} />
                  <p style={{color:"gray"}}>@{userProfile.userId.username}</p> 
                </div>

                

                <div>
                  <textarea
                    value={userProfile.bio}
                    onChange={(e) => {
                      setUserProfile({...userProfile,bio:e.target.value});
                    }}
                    rows={Math.max(3,Math.ceil(userProfile.bio.length/50))}
                    style={{width:"100%"}}
                  />
                </div>
              
              </div>

              
              
              <div style={{flex:"0.25"}}>
                <h3>Recent Activity</h3>
                {userPosts.map((post) => {
                  return(
                    <div key={post._id} className={styles.posCard}>
                        <div className={styles.recentActivityCard}>
                          {post.media !== "" && (
                            <img className={styles.recentActivityMedia} src={post.media} alt="" />
                          )}
                          <p className={styles.recentActivityText}>{post.body}</p>
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

                <button className={styles.addWordButton} onClick={() => {
                    setIsModalOpen(true);
                }}>Add Work</button>
                
            </div>
          </div>

          {userProfile != authState.User && 
          <div onClick={() => updateProfileData()} className={styles.ConnectButton}>
            Update Profile
          </div>
          }

        </div>
        }

        {
            isModalOpen &&

            <div 
            onClick={()=>{
              setIsModalOpen(false);
            }}
            className={styles.commentsContainer}>
                <div 
                onClick={(e)=>{
                  e.stopPropagation();
                }}
                className={styles.allCommentsContainer}>
                  <input onChange={handleWorkInputChange} name='company' className={styles.inputField} type='text' placeholder='Enter Company' />
                  <input onChange={handleWorkInputChange} name='position' className={styles.inputField} type='text' placeholder='Enter Position' />
                  <input onChange={handleWorkInputChange} name='years' className={styles.inputField} type='number' placeholder='Years' />
                
                  <div onClick={()=>{
                    setUserProfile({...userProfile,pastWork:[...userProfile.pastWork,inputData]});
                    setIsModalOpen(false);
                  }} className={styles.ConnectButton}> Add Work</div>
                </div>
            </div>
          }
      </DashboardLayout>
    </UserLayout>
  )
}
