import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
export default function TabsLayout(){
  return <Tabs screenOptions={{headerShown:false,tabBarStyle:{backgroundColor:colors.panel,borderTopColor:colors.border,height:72,paddingTop:7},tabBarActiveTintColor:colors.cyan,tabBarInactiveTintColor:colors.muted}}>
    <Tabs.Screen name="index" options={{title:"Home",tabBarIcon:({color,size})=><Ionicons name="grid-outline" color={color} size={size}/>}}/>
    <Tabs.Screen name="career" options={{title:"Career",tabBarIcon:({color,size})=><Ionicons name="sparkles-outline" color={color} size={size}/>}}/>
    <Tabs.Screen name="market" options={{title:"Market",tabBarIcon:({color,size})=><Ionicons name="pulse-outline" color={color} size={size}/>}}/>
    <Tabs.Screen name="profile" options={{title:"Profile",tabBarIcon:({color,size})=><Ionicons name="person-outline" color={color} size={size}/>}}/>
  </Tabs>;
}