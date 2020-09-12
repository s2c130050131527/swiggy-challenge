import React, { lazy } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import "./App.scss";
import Header from "./Components/Header";

const HomeComponent = lazy(() => import("./Components/Home"));

function App() {
  return (
    <>
      <Header></Header>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={HomeComponent}></Route>
          <Redirect to="/"></Redirect>
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
