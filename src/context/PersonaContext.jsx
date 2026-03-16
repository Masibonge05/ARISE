import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { PERSONAS } from "../utils/constants";

const PersonaContext = createContext(null);

export function PersonaProvider({ children }) {
  const { user } = useAuth();
  const [activePersona, setActivePersona] = useState(null);

  useEffect(() => {
    if (user?.persona_type) setActivePersona(user.persona_type);
  }, [user]);

  const is = (persona) => activePersona === persona;

  return (
    <PersonaContext.Provider value={{
      activePersona,
      setActivePersona,
      isJobSeeker:   is(PERSONAS.JOB_SEEKER),
      isFreelancer:  is(PERSONAS.FREELANCER),
      isEntrepreneur:is(PERSONAS.ENTREPRENEUR),
      isEmployer:    is(PERSONAS.EMPLOYER),
      isInvestor:    is(PERSONAS.INVESTOR),
      isMentor:      is(PERSONAS.MENTOR),
      isGovernment:  is(PERSONAS.GOVERNMENT),
    }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be inside <PersonaProvider>");
  return ctx;
}

export default PersonaContext;