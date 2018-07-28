import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { createStackNavigator } from "react-navigation";
import { Provider } from "react-redux";
import configureStore from "./configureStore";
import { PersistGate } from "redux-persist/integration/react";
import { connect } from "react-redux";

import HomePage from "./src/Containers/HomePage";
import InterestPage from "./src/Containers/InterestPage";
import LoginPage from "./src/Containers/LoginPage";
import SubInterestPage from "./src/Containers/SubInterestPage";
import JoinGroup from "./src/Containers/JoinGroup";
import GroupMessaging from "./src/Containers/GroupMessaging";
import Planner from "./src/Containers/Planner";
import MakeGroup from "./src/Containers/MakeGroup";

const { store, persistor } = configureStore();

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppNav />
        </PersistGate>
      </Provider>
    );
  }
}

const AppNav = createStackNavigator(
  {
    LoginPage: { screen: LoginPage },
    HomePage: {
      screen: HomePage,
      navigationOptions: {
        gesturesEnabled: false
      }
    },
    InterestPage: { screen: InterestPage },
    SubInterestPage: { screen: SubInterestPage },
    JoinGroup: { screen: JoinGroup },
    GroupMessaging: { screen: GroupMessaging },
    Planner: { screen: Planner },
    MakeGroup: { screen: MakeGroup }
  },
  {
    headerMode: "none",
    initialRouteName: "LoginPage"
  }
);
