import React, { lazy } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import "./App.scss";
import Header from "./Components/Header";
import { useSelector } from "react-redux";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const HomeComponent = lazy(() => import("./Components/Home"));

function App() {
  const token = useSelector(state => state.token);

  const httpLink = createHttpLink({
    uri: "https://test-323.herokuapp.com/v1/graphql"
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token
      }
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  });

  return (
    <>
      <CssBaseline />
      <Header></Header>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={HomeComponent}></Route>
            <Redirect to="/"></Redirect>
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    </>
  );
}

export default App;
