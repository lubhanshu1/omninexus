import { useEffect,useState } from "react";
import { ActivityIndicator,ScrollView,Text,View } from "react-native";
import { observatory } from "../../lib/api";
import { colors,radius } from "../../theme";
export default function Market(){
  const [data,setData]=useState<any>(null);
  useEffect(()=>{observatory().then(setData).catch(()=>setData(null));},[]);
  return <ScrollView style={{flex:1,backgroundColor:colors.background}} contentContainerStyle={{padding:20,paddingTop:56,paddingBottom:100}}>
    <Text style={{color:colors.cyan,fontSize:11,fontWeight:"900",letterSpacing:3}}>WORKFORCE OBSERVATORY</Text>
    <Text style={{color:colors.text,fontSize:32,fontWeight:"900",marginTop:8}}>Market intelligence.</Text>
    <Text style={{color:colors.muted,marginTop:8,lineHeight:21}}>Live signals from the OmniNexus analysis layer.</Text>
    {!data?<ActivityIndicator style={{marginTop:40}} color={colors.cyan}/>:<View style={{marginTop:24,gap:10}}>{data.market?.top_skills?.map((item:any,index:number)=><View key={item.skill} style={{backgroundColor:colors.panel,borderColor:colors.border,borderWidth:1,borderRadius:radius.md,padding:16,flexDirection:"row",alignItems:"center"}}><Text style={{color:colors.cyan,fontWeight:"900",width:35}}>#{index+1}</Text><View style={{flex:1}}><Text style={{color:colors.text,fontWeight:"900"}}>{item.skill}</Text><Text style={{color:colors.muted,fontSize:12,marginTop:4}}>{Number(item.job_records).toLocaleString()} records</Text></View><Text style={{color:colors.green,fontWeight:"900"}}>₹{Number(item.mean_salary_midpoint).toFixed(2)}L</Text></View>)}</View>}
    {data?.signals?<Text style={{color:colors.muted,fontSize:11,lineHeight:17,marginTop:20}}>{data.signals.interpretation}</Text>:null}
  </ScrollView>;
}