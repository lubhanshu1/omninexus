import { useState } from "react";
import { Pressable,ScrollView,Text,View } from "react-native";
import { analyzeCareer } from "../../lib/api";
import { colors,radius } from "../../theme";
const roles=["AI Engineer","Data Scientist","MLOps Engineer","AI Product Engineer","Machine Learning Engineer"];
export default function Career(){
  const [role,setRole]=useState("AI Engineer"); const [data,setData]=useState<any>(null); const [skills,setSkills]=useState(["Python"]); const [loading,setLoading]=useState(false);
  async function run(){setLoading(true);try{setData(await analyzeCareer(skills,role));}catch(e){setData({error:e instanceof Error?e.message:"Unable to run simulation."});}finally{setLoading(false);}}
  return <ScrollView style={{flex:1,backgroundColor:colors.background}} contentContainerStyle={{padding:20,paddingTop:56,paddingBottom:100}}>
    <Text style={{color:colors.cyan,fontSize:11,fontWeight:"900",letterSpacing:3}}>CAREER SIMULATOR</Text>
    <Text style={{color:colors.text,fontSize:32,fontWeight:"900",marginTop:8}}>Simulate your next role.</Text>
    <Text style={{color:colors.muted,marginTop:8,lineHeight:21}}>Run the same skill-graph analysis used by the OmniNexus web app.</Text>
    <Text style={{color:colors.muted,fontSize:11,fontWeight:"800",marginTop:25,marginBottom:9}}>TARGET ROLE</Text>
    <View style={{gap:8}}>{roles.map(item=><Pressable key={item} onPress={()=>setRole(item)} style={{minHeight:48,justifyContent:"center",paddingHorizontal:15,borderRadius:12,borderWidth:1,borderColor:role===item?colors.cyan:colors.border,backgroundColor:role===item?"#083344":colors.panel}}><Text style={{color:role===item?colors.cyan:colors.text,fontWeight:"800"}}>{item}</Text></Pressable>)}</View>
    <View style={{marginTop:18,backgroundColor:colors.panel,borderColor:colors.border,borderWidth:1,borderRadius:radius.md,padding:18}}>
      <Text style={{color:colors.muted,fontSize:11,fontWeight:"800"}}>CURRENT SKILLS</Text><Text style={{color:colors.text,fontSize:17,fontWeight:"800",marginTop:8}}>{skills.join(" • ")}</Text>
      <Pressable onPress={()=>setSkills(s=>s.includes("Docker")?s.filter(x=>x!=="Docker"):[...s,"Docker"])} style={{marginTop:14,alignSelf:"flex-start",borderRadius:10,borderWidth:1,borderColor:colors.border,paddingHorizontal:13,paddingVertical:9}}><Text style={{color:colors.cyan,fontWeight:"800"}}>{skills.includes("Docker")?"Remove Docker":"Simulate Docker"}</Text></Pressable>
    </View>
    <Pressable onPress={run} disabled={loading} style={{minHeight:54,marginTop:16,borderRadius:14,backgroundColor:colors.cyan,alignItems:"center",justifyContent:"center",opacity:loading?0.6:1}}><Text style={{color:"#021018",fontWeight:"900"}}>{loading?"RUNNING...":"RUN SIMULATION"}</Text></Pressable>
    {data?.error?<Text style={{color:colors.danger,marginTop:15}}>{data.error}</Text>:null}
    {data&&!data.error?<View style={{marginTop:18,gap:10}}><Result label="READINESS" value={data.readiness_score+"%"}/><Result label="MAIN GAP" value={data.bottleneck_skill||"None"}/><Result label="GRAPH METHOD" value={data.explainability?.method||"Skill graph"}/><Result label="PATH" value={(data.explainability?.missing_skills||[]).join(" -> ")||"Ready"}/></View>:null}
  </ScrollView>;
}
function Result({label,value}:{label:string;value:string}){return <View style={{backgroundColor:colors.panel,borderColor:colors.border,borderWidth:1,borderRadius:14,padding:17}}><Text style={{color:colors.muted,fontSize:10,fontWeight:"800",letterSpacing:1}}>{label}</Text><Text style={{color:colors.text,fontSize:19,fontWeight:"900",marginTop:7}}>{value}</Text></View>;}
