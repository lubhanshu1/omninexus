import { useEffect,useState } from "react";
import { Pressable,Text,View } from "react-native";
import { router } from "expo-router";
import { logout,me } from "../../lib/api";
import { colors,radius } from "../../theme";
export default function Profile(){
  const [user,setUser]=useState<any>(null);
  useEffect(()=>{me().then(setUser).catch(()=>setUser(null));},[]);
  async function signOut(){await logout();router.replace("/login");}
  return <View style={{flex:1,backgroundColor:colors.background,padding:20,paddingTop:56}}>
    <Text style={{color:colors.cyan,fontSize:11,fontWeight:"900",letterSpacing:3}}>TALENT TWIN</Text><Text style={{color:colors.text,fontSize:32,fontWeight:"900",marginTop:8}}>Your profile.</Text>
    <View style={{marginTop:24,backgroundColor:colors.panel,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:20}}><Text style={{color:colors.muted,fontSize:11,fontWeight:"800"}}>ACCOUNT</Text><Text style={{color:colors.text,fontSize:18,fontWeight:"800",marginTop:8}}>{user?.email||"Loading..."}</Text><Text style={{color:colors.green,marginTop:8,fontWeight:"700"}}>● Account active</Text></View>
    <Pressable onPress={signOut} style={{marginTop:16,minHeight:52,borderRadius:14,borderWidth:1,borderColor:"#5b2430",backgroundColor:"#210d14",alignItems:"center",justifyContent:"center"}}><Text style={{color:colors.danger,fontWeight:"900"}}>LOG OUT</Text></Pressable>
  </View>;
}