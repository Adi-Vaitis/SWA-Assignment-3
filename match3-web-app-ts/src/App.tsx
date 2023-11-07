import React from 'react';
import {useRoutes} from 'react-router-dom';
import './App.css';
import {LoginPage} from "./Pages/LoginPage/LoginPage";
import {RegisterPage} from "./Pages/RegisterPage/RegisterPage";
import {Redirect} from "./Components/Redirect/Redirect";
import {MainPageComponent} from "./Pages/GamePages/MainPage/MainPage";
import {Token} from "./Model/token";
import {AuthGuard} from "./Components/AuthGuard/AuthGuard";
import {LayoutComponent} from "./Components/Layout/LayoutComponent";

const App = () => {
    const token: Token = JSON.parse(localStorage.getItem('token') as string) as Token;
  const content = useRoutes(
      [
          {
              element: <LayoutComponent></LayoutComponent>,
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
                      element: <AuthGuard token={token}><MainPageComponent/></AuthGuard>
                  }
              ]
          }
      ]
  );
    return content;
}

export default App;
