import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const COURSES = [
  { id:"c1", title:"UI/UX Design Fundamentals", provider:"Google Career Certificates", duration:"6 weeks", level:"Beginner", skill:"UI Design", category:"design", ecs:20, free:true, url:"https://grow.google/certificates/" },
  { id:"c2", title:"Python Programming Essentials", provider:"Huawei ICT Academy", duration:"4 weeks", level:"Beginner", skill:"Python", category:"technical", ecs:20, free:true, url:"https://e.huawei.com/en/talent/" },
  { id:"c3", title:"Business Registration & CIPC", provider:"SEDA e-Learning", duration:"2 hours", level:"Beginner", skill:"Business Formalization", category:"business", ecs:15, free:true, url:"https://www.seda.org.za" },
  { id:"c4", title:"Social Media Marketing for SMEs", provider:"Meta Blueprint", duration:"3 weeks", level:"Beginner", skill:"Digital Marketing", category:"marketing", ecs:15, free:true, url:"https://www.facebook.com/business/learn" },
  { id:"c5", title:"Financial Management Basics", provider:"NYDA Business Hub", duration:"5 weeks", level:"Intermediate", skill:"Financial Planning", category:"business", ecs:20, free:true, url:"https://www.nyda.gov.za" },
  { id:"c6", title:"Figma for UI Designers", provider:"Figma Academy", duration:"3 weeks", level:"Intermediate", skill:"Figma", category:"design", ecs:20, free:true, url:"https://www.figma.com/resources/learn-design/" },
  { id:"c7", title:"Flutter Mobile Development", provider:"Huawei Developer Academy", duration:"8 weeks", level:"Intermediate", skill:"Flutter", category:"technical", ecs:25, free:false, url:"https://developer.huawei.com/consumer/en/training/" },
  { id:"c8", title:"Pitch Deck Masterclass", provider:"Founders Institute SA", duration:"4 hours", level:"Intermediate", skill:"Pitching", category:"business", ecs:15, free:false, url:"#"},
  { id:"c9", title:"JavaScript for Beginners", provider:"freeCodeCamp", duration:"5 weeks", level:"Beginner", skill:"JavaScript", category:"technical", ecs:20, free:true, url:"https://www.freecodecamp.org"},
  { id:"c10", title:"isiZulu for Business", provider:"ARISE Language Centre", duration:"4 weeks", level:"Beginner", skill:"isiZulu", category:"language", ecs:20, free:true, url:"#"},
  { id:"c11", title:"Grant Writing Fundamentals", provider:"SEDA", duration:"6 hours", level:"Beginner", skill:"Grant Writing", category:"business", ecs:15, free:true, url:"https://www.seda.org.za"},
  { id:"c12", title:"Photography for Freelancers", provider:"Coursera", duration:"3 weeks", level:"Beginner", skill:"Photography", category:"creative", ecs:15, free:false, url:"https://www.coursera.org"},
];

const CATEGORIES = ["all","technical","design","business","marketing","language","creative"];

export default function CoursesPage() {

  const { user } = useAuth();
  const [enrolled,setEnrolled] = useState([]);
  const [filter,setFilter] = useState("all");
  const [freeOnly,setFreeOnly] = useState(false);
  const [search,setSearch] = useState("");

  const filtered = COURSES.filter(c=>{
    if(filter !== "all" && c.category !== filter) return false;
    if(freeOnly && !c.free) return false;
    if(search && !c.title.toLowerCase().includes(search.toLowerCase()) &&
       !c.skill.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalECS = enrolled.reduce((s,id)=> s + (COURSES.find(c=>c.id===id)?.ecs || 0),0);

  return(
    <div style={S.page}>

      <div style={S.inner}>

        <h1 style={S.title}>Courses & Learning</h1>
        <p style={{fontSize:14,color:"#888"}}>
          Complete courses to add verified skills to your TrustID
        </p>

        {enrolled.length>0 && (
          <div style={{display:"flex",gap:12}}>
            <div style={S.statBox}>
              <div style={S.statValue}>{enrolled.length}</div>
              <div style={S.statLabel}>ENROLLED</div>
            </div>

            <div style={S.statBox}>
              <div style={S.statValue}>+{totalECS}</div>
              <div style={S.statLabel}>ECS</div>
            </div>
          </div>
        )}

        <div style={S.searchRow}>

          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search courses..."
            style={S.search}
          />

          <button
            onClick={()=>setFreeOnly(!freeOnly)}
            style={S.filterBtn}
          >
            {freeOnly ? "✓ Free only":"Free only"}
          </button>

        </div>

        <div style={S.categoryRow}>
          {CATEGORIES.map(c=>(
            <button
              key={c}
              onClick={()=>setFilter(c)}
              style={{
                ...S.catBtn,
                background: filter===c ? "#FF6B35":"transparent",
                color: filter===c ? "#fff":"#aaa"
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={S.grid}>

          {filtered.map(course=>{

            const isEnrolled = enrolled.includes(course.id);

            return(
              <div key={course.id} style={S.card}>

                <div style={S.cardTop}>
                  <span style={S.badge}>
                    {course.free ? "FREE":"PAID"}
                  </span>

                  <span style={S.ecs}>
                    +{course.ecs} ECS
                  </span>
                </div>

                <div style={S.courseTitle}>
                  {course.title}
                </div>

                <div style={S.provider}>
                  {course.provider}
                </div>

                <div style={S.meta}>
                  ⏱ {course.duration} • {course.level}
                </div>

                <div style={S.skill}>
                  Skill: {course.skill}
                </div>

                <div style={{display:"flex",gap:8}}>

                  {isEnrolled ? (
                    <div style={S.enrolled}>✓ Enrolled</div>
                  ) : (
                    <button
                      onClick={()=>setEnrolled(e=>[...e,course.id])}
                      style={S.enrollBtn}
                    >
                      Enroll
                    </button>
                  )}

                  <a
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    style={S.linkBtn}
                  >
                    ↗
                  </a>

                </div>

              </div>
            )
          })}

        </div>

      </div>
    </div>
  );
}

export function VerificationTracker(){

  return(
    <div style={{padding:40}}>

      <h1>Verification Centre</h1>

      {[
        {label:"Email Verification",ecs:25,action:"/settings"},
        {label:"Identity Document",ecs:50,action:"/onboarding/identity"},
        {label:"Qualification",ecs:25,action:"/profile"},
        {label:"Skills Assessment",ecs:15,action:"/skills"},
        {label:"Work Experience",ecs:20,action:"/profile"},
        {label:"Business Registration",ecs:100,action:"/launchpad"}
      ].map(step=>(
        <div key={step.label} style={S.verifyRow}>

          <div style={{flex:1}}>
            {step.label}
          </div>

          <div>+{step.ecs} ECS</div>

          <Link to={step.action}>
            Go →
          </Link>

        </div>
      ))}

    </div>
  );
}

const S={

page:{
background:"#0A0A0F",
color:"#E8E8F0",
minHeight:"100vh"
},

inner:{
maxWidth:1100,
margin:"0 auto",
padding:30
},

title:{
fontSize:30,
fontWeight:800
},

searchRow:{
display:"flex",
gap:10,
marginTop:20
},

search:{
flex:1,
padding:10,
borderRadius:8,
border:"1px solid #333",
background:"#111",
color:"#fff"
},

filterBtn:{
padding:"10px 16px",
borderRadius:8,
background:"#222",
border:"1px solid #333",
color:"#fff",
cursor:"pointer"
},

categoryRow:{
display:"flex",
gap:8,
marginTop:12,
flexWrap:"wrap"
},

catBtn:{
padding:"6px 12px",
borderRadius:20,
border:"1px solid #333",
cursor:"pointer"
},

grid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",
gap:16,
marginTop:20
},

card:{
background:"#111",
padding:18,
borderRadius:12,
border:"1px solid #333"
},

cardTop:{
display:"flex",
justifyContent:"space-between"
},

badge:{
fontSize:10,
background:"#333",
padding:"2px 8px",
borderRadius:12
},

ecs:{
color:"#FF6B35",
fontWeight:700
},

courseTitle:{
fontWeight:700,
marginTop:8
},

provider:{
fontSize:12,
color:"#aaa"
},

meta:{
fontSize:12,
color:"#777",
marginTop:6
},

skill:{
fontSize:12,
color:"#4ECDC4",
marginTop:8
},

enrollBtn:{
flex:1,
padding:8,
borderRadius:8,
background:"#FF6B35",
border:"none",
color:"#fff",
cursor:"pointer"
},

linkBtn:{
padding:"8px 12px",
borderRadius:8,
background:"#222",
border:"1px solid #333",
textDecoration:"none",
color:"#aaa"
},

enrolled:{
flex:1,
padding:8,
borderRadius:8,
background:"#0a3",
textAlign:"center"
},

statBox:{
background:"#111",
padding:"10px 16px",
borderRadius:10
},

statValue:{
fontSize:20,
fontWeight:800
},

statLabel:{
fontSize:10,
color:"#777"
},

verifyRow:{
display:"flex",
gap:20,
borderBottom:"1px solid #333",
padding:12
}

};