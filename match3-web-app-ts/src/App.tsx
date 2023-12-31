import React from 'react';
import {useRoutes} from 'react-router-dom';
import './App.css';
import {LoginPage} from "./Pages/LoginPage/LoginPage";
import {RegisterPage} from "./Pages/RegisterPage/RegisterPage";
import {Redirect} from "./Components/Redirect/Redirect";
import {MainPage} from "./Pages/MainPage/MainPage";
import {Token} from "./Model/token";
import {AuthGuard} from "./Components/AuthGuard/AuthGuard";
import {LayoutComponent} from "./Components/Layout/LayoutComponent";
import {FourOhFour} from "./Pages/Four-Oh-Four/Four-Oh-Four";
import {ProfilePage} from "./Pages/Profile/ProfilePage";
import {HighScorePage} from "./Pages/GamePages/HighScorePage/HighScorePage";

const App = () => {
    const token: Token = JSON.parse(localStorage.getItem('token') as string) as Token;
  const content = useRoutes(
      [
          {
              element: <LayoutComponent token={token}></LayoutComponent>,
              children: [
                  {
                      path: "/",
                      element: <Redirect to="/login"/>,
                  },
                  {
                      path: "/login",
                      element: token ? <Redirect to="/mainPage"/> : <LoginPage/>,
                  },
                  {
                      path: "/register",
                      element: token ? <Redirect to="/mainPage"/> : <RegisterPage/>,
                  },
                  {
                      path: "/mainPage",
                      element: <AuthGuard token={token}><MainPage token={token}/></AuthGuard>
                  },
                  {
                      path: "/profile",
                      element: <AuthGuard token={token}><ProfilePage token={token}/></AuthGuard>
                  },
                  {
                      path: "/highScore",
                      element: <AuthGuard token={token}><HighScorePage token={token}/></AuthGuard>
                  },
                  {
                        path: "*",
                        element: <FourOhFour/>,
                  }
              ]
          }
      ]
  );
    return content;
}

export default App;
