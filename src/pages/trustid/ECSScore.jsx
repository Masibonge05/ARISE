// ECSScore.jsx — redirect to full ECS dashboard
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function ECSScore() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/ecs", { replace:true }); }, []);
  return null;
}