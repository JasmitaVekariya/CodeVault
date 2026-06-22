import React, { useEffect } from "react";
import { useNavigate, useRoutes, useParams } from "react-router-dom";

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepo from "./components/repo/CreateRepo";
import RepositoryDetails from "./components/repo/RepoDetails";
import UpdateRepository from "./components/repo/UpdateRepo";
import CreateIssue from "./components/issue/CreateIssue";
 import IssueList from "./components/issue/issueList";
import UpdateIssue from "./components/issue/UpdateIssue";
import UpdateProfile from "./components/user/UpdateProfile";
import StarredRepos from "./components/user/stredRepo";
import Connections from "./components/connections/Connections";
import UserProfile from "./components/connections/UserProfile";
import Support from "./components/Support";
import Contact from "./components/Contact";

// Auth Context
import { useAuth } from "./authContext";
function CreateIssueWrapper() {
  const { id } = useParams();
  return <CreateIssue repositoryId={id} />;
}

const ProjectRoutes = ()=>{
    const {currentUser, setCurrentUser} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        const userIdFromStorage = localStorage.getItem("userId");

        if(userIdFromStorage && !currentUser){
            setCurrentUser(userIdFromStorage);
        }

        if(!userIdFromStorage && !["/auth", "/signup"].includes(window.location.pathname))
        {
            navigate("/auth");
        }

        if(userIdFromStorage && window.location.pathname=='/auth'){
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser]);

    let element = useRoutes([
        {
            path:"/",
            element:<Dashboard/>
        },
        {
            path:"/auth",
            element:<Login/>
        },
        {
            path:"/signup",
            element:<Signup/>
        },
        {
            path:"/profile",
            element:<Profile/>
        },
       {path:"/user/update/:id", element:<UpdateProfile />},

        {
            path:"/repository/create",
            element:<CreateRepo/>
        },
        {
            path:"/repository/:id",
            element:<RepositoryDetails/>
        },
        { path: "/repository/update/:id", element: <UpdateRepository /> },
        {
            path:"/repository/:id/issue/create" ,element:<CreateIssueWrapper />
        },
        {
        path: "/repository/:id/issues",
  element: <IssueList />
        },
{              path:"/issue/update/:id" ,
     element:<UpdateIssue />
    } ,
    {path:"/profile/starred", element:<StarredRepos />},
    {
        path:"/connections",
        element:<Connections/>
    },
    {
        path:"/user/:userId",
        element:<UserProfile/>
    },
    { path: "/support", element: <Support /> },
    { path: "/contact", element: <Contact /> }


    ]);
    return element;
}

export default ProjectRoutes;