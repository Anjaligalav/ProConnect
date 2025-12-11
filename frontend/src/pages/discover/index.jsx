import React from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashBoardLayout'
import { useEffect,useState } from 'react'
import { useSelector,useDispatch } from 'react-redux'
import { getAllUsers } from '@/config/redux/action/authAction'
import styles from "./style.module.css";
import { BASE_URL } from '@/config/index';
import { useRouter } from 'next/router';




export default function DiscoverPage() {
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    useEffect(() => {
        if(!authState.all_profiles_fetched){
            dispatch(getAllUsers({token:localStorage.getItem("token")}))
        }
    },[])
    const router = useRouter();
  return (
    <UserLayout>
          <DashboardLayout>
            <div>
              <h1>Discoverpage</h1>
              <div className={styles.allUserProfile}>
                {authState.all_profiles_fetched && authState.all_users.map((user,index) => {
                  return (
                    <div onClick={() => {
                      router.push(`/view_profile/${user.userId.username}`);
                    }} className={styles.userCard} key={index}>
                      <img className={styles.userCardImage} src={user.userId.profilePicture} alt="" />
                      <div>
                        <h1>{user.userId.name}</h1>
                        <p>{user.userId.email}</p>
                      </div>
                    </div>
                  )
                })}

              </div>
            </div>
            
          </DashboardLayout>
          
    </UserLayout>
        
  )
}
