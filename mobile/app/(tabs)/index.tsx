import { useCallback,useState } from "react";
import { RefreshControl,ScrollView,Text,View } from "react-native";
import { useFocusEffect } from "expo-router";
import { analyzeCareer } from "../../lib/api";
import { colors,radius } from "../../theme";

export default function Home(){
  const [data,setData]=useState<any>(null); const [refreshing,setRefreshing]=useState(false);
  const load=useCallback(async()=>{try{setData(await analyzeCareer(["Python"],"AI Engineer"));}catch{setData(null);}},[]);
  useFocusEffect(useCallback(()=>{load();},[load]));
  async function refresh(){setRefreshing(true);await load();setRefreshing(false);}
  const readiness=data?.readiness_score??0,coverage=data?.explainability?.graph_coverage_percent??0,gap=data?.bottleneck_skill||"Explore your next skill";
  return <ScrollView style={{flex:1,backgroundColor:colors.background}} contentContainerStyle={{padding:20,paddingTop:56,paddingBottom:100}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.cyan}/>}>
    <Text style={{color:colors.cyan,fontSize:11,fontWeight:"900",letterSpacing:3}}>OMNINEXUS COMMAND CENTER</Text>
    <Text style={{color:colors.text,fontSize:32,fontWeight:"900",marginTop:8}}>Career intelligence.</Text>
    <Text style={{color:colors.muted,marginTop:8,lineHeight:21}}>A mobile view of your current readiness and next best move.</Text>
    <View style={{flexDirection:"row",gap:10,marginTop:24}}><Metric label="READINESS" value={readiness+"%"}/><Metric label="COVERAGE" value={coverage+"%"}/></View>
    <View style={{marginTop:12,backgroundColor:colors.panel,borderColor:colors.border,borderWidth:1,borderRadius:radius.md,padding:20}}>
      <Text style={{color:colors.amber,fontSize:11,fontWeight:"900",letterSpacing:2}}>PRIMARY SKILL GAP</Text>
      <Text style={{color:colors.text,fontSize:28,fontWeight:"900",marginTop:9}}>{gap}</Text>
      <Text style={{color:colors.muted,marginTop:8,lineHeight:20}}>The skill graph currently prioritizes this capability for your AI Engineer transition.</Text>
    </View>
    <View style={{marginTop:12,flexDirection:"row",gap:10}}><Metric label="MARKET VALUE" value={data?.market_value?"₹"+Number(data.market_value).toLocaleString("en-IN"):"—"}/><Metric label="OPPORTUNITY" value={data?.market_opportunity_score!=null?String(data.market_opportunity_score):"—"}/></View>
  </ScrollView>;
}
function Metric({label,value}:{label:string;value:string}){return <View style={{flex:1,minHeight:108,backgroundColor:colors.panel,borderColor:colors.border,borderWidth:1,borderRadius:radius.md,padding:16}}><Text style={{color:colors.muted,fontSize:10,fontWeight:"800",letterSpacing:1}}>{label}</Text><Text style={{color:colors.text,fontSize:25,fontWeight:"900",marginTop:12}}>{value}</Text></View>;}
