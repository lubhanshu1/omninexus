import { Redirect } from "expo-router";
import { useEffect,useState } from "react";
import { ActivityIndicator,View } from "react-native";
import { getToken } from "../lib/api";
import { colors } from "../theme";
export default function Index(){
  const [ready,setReady]=useState(false); const [auth,setAuth]=useState(false);
  useEffect(()=>{getToken().then(t=>{setAuth(Boolean(t));setReady(true);});},[]);
  if(!ready)return <View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:colors.background}}><ActivityIndicator color={colors.cyan}/></View>;
  return <Redirect href={auth?"/(tabs)":"/login"}/>;
}