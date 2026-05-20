import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppProvider } from "./src/store/AppContext";
import TabNavigator from "./src/navigation/TabNavigator";
import "./src/global.css";

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
