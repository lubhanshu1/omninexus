import { useState } from "react";
import { ActivityIndicator,KeyboardAvoidingView,Platform,Pressable,Text,TextInput,View } from "react-native";
import { router } from "expo-router";
import { login,signup } from "../lib/api";
import { colors,radius } from "../theme";

export default function Login(){
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function submit(){
    setError("");
    if(!email.trim()||password.length<8){setError("Enter a valid email and a password of at least 8 characters.");return;}
    setBusy(true);
    try{if(mode==="login")await login(email.trim(),password);else await signup(email.trim(),password);router.replace("/(tabs)");}
    catch(e){setError(e instanceof Error?e.message:"Unable to authenticate.");}finally{setBusy(false);}
  }
  return <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={{flex:1,backgroundColor:colors.background}}>
    <View style={{flex:1,justifyContent:"center",padding:24}}>
      <Text style={{color:colors.cyan,fontSize:12,fontWeight:"900",letterSpacing:3}}>OMNINEXUS</Text>
      <Text style={{color:colors.text,fontSize:40,fontWeight:"900",marginTop:10}}>Career intelligence.</Text>
      <Text style={{color:colors.muted,fontSize:15,lineHeight:23,marginTop:10}}>Your skills. Your market. Your next move.</Text>
      <View style={{marginTop:30,backgroundColor:colors.panel,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:20}}>
        <View style={{flexDirection:"row",gap:8,marginBottom:20}}>
          {(["login","signup"] as const).map(x=><Pressable key={x} onPress={()=>setMode(x)} style={{flex:1,minHeight:44,alignItems:"center",justifyContent:"center",borderRadius:12,backgroundColor:mode===x?colors.cyan:colors.panelAlt}}>
            <Text style={{color:mode===x?"#021018":colors.muted,fontWeight:"800"}}>{x==="login"?"LOGIN":"CREATE ACCOUNT"}</Text>
          </Pressable>)}
        </View>
        <Text style={{color:colors.muted,fontSize:12,fontWeight:"700",marginBottom:7}}>EMAIL</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#516277" style={{minHeight:52,borderRadius:14,borderWidth:1,borderColor:colors.border,backgroundColor:colors.background,color:colors.text,paddingHorizontal:15,marginBottom:15}}/>
        <Text style={{color:colors.muted,fontSize:12,fontWeight:"700",marginBottom:7}}>PASSWORD</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor="#516277" style={{minHeight:52,borderRadius:14,borderWidth:1,borderColor:colors.border,backgroundColor:colors.background,color:colors.text,paddingHorizontal:15}}/>
        {error?<Text style={{color:colors.danger,marginTop:12,lineHeight:20}}>{error}</Text>:null}
        <Pressable onPress={submit} disabled={busy} style={{minHeight:54,marginTop:20,borderRadius:14,backgroundColor:colors.cyan,alignItems:"center",justifyContent:"center",opacity:busy?.65:1}}>
          {busy?<ActivityIndicator color="#021018"/>:<Text style={{color:"#021018",fontSize:15,fontWeight:"900"}}>{mode==="login"?"ENTER OMNINEXUS":"CREATE ACCOUNT"}</Text>}
        </Pressable>
      </View>
    </View>
  </KeyboardAvoidingView>;
}