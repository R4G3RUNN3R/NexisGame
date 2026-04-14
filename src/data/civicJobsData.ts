export type CivicJobTrackId =
  | "city_guard"
  | "medical_corps"
  | "academy_staff"
  | "trade_office"
  | "civic_bureau"
  | "forge_union";

export interface CivicJobRank {
  rank: number;
  title: string;
  requirementLabel: string;
  dailyGold: number;
  dailyJobPoints: number;
  passiveSummary: string;
}

export interface CivicJobTrack {
  id: CivicJobTrackId;
  name: string;
  subtitle: string;
  interviewPrompt: string;
  entryRequirements: string[];
  specialties: string[];
  ranks: CivicJobRank[];
}

export const CIVIC_JOB_TRACKS: CivicJobTrack[] = [
  {
    id: "city_guard",
    name: "City Guard",
    subtitle: "Order, patrols, and the occasional reminder that laws are mostly paperwork with weapons.",
    interviewPrompt: "Why should Nexis trust you with its walls and citizens?",
    entryRequirements: ["Basic combat aptitude", "No active criminal sanction", "Sufficient endurance"],
    specialties: ["Patrol bonuses", "Slight arrest resistance later", "Better defensive duty income"],
    ranks: [
      { rank: 1, title: "Watch Recruit", requirementLabel: "Starter", dailyGold: 120, dailyJobPoints: 2, passiveSummary: "+1% civic respect gain" },
      { rank: 2, title: "Gate Watcher", requirementLabel: "Working stats 75+ total", dailyGold: 180, dailyJobPoints: 3, passiveSummary: "+1% travel safety in nearby routes" },
      { rank: 3, title: "Patrolman", requirementLabel: "Working stats 140+ total", dailyGold: 260, dailyJobPoints: 4, passiveSummary: "+2% civic respect gain" },
      { rank: 4, title: "Shield Sergeant", requirementLabel: "Working stats 240+ total", dailyGold: 360, dailyJobPoints: 5, passiveSummary: "+2% defensive recovery speed" },
      { rank: 5, title: "Wall Captain", requirementLabel: "Working stats 400+ total", dailyGold: 500, dailyJobPoints: 6, passiveSummary: "+3% city security actions" },
    ],
  },
  {
    id: "medical_corps",
    name: "Medical Corps",
    subtitle: "Patching up people who keep making terrible decisions. A growth sector.",
    interviewPrompt: "How do you stay calm when someone arrives leaking enthusiasm and blood?",
    entryRequirements: ["Basic literacy", "Basic first aid or equivalent", "No active plague quarantine"],
    specialties: ["Recovery bonuses", "Potion quality later", "Hospital utility"],
    ranks: [
      { rank: 1, title: "Ward Runner", requirementLabel: "Starter", dailyGold: 110, dailyJobPoints: 2, passiveSummary: "+1% recovery speed" },
      { rank: 2, title: "Apothecary Aide", requirementLabel: "Knowledge 40+", dailyGold: 170, dailyJobPoints: 3, passiveSummary: "+1% potion efficiency" },
      { rank: 3, title: "Field Medic", requirementLabel: "Knowledge 90+", dailyGold: 250, dailyJobPoints: 4, passiveSummary: "+2% recovery speed" },
      { rank: 4, title: "Surgical Hand", requirementLabel: "Knowledge 160+", dailyGold: 340, dailyJobPoints: 5, passiveSummary: "+2% revive-style service quality" },
      { rank: 5, title: "Hospital Master", requirementLabel: "Knowledge 260+", dailyGold: 470, dailyJobPoints: 6, passiveSummary: "+3% medical service output" },
    ],
  },
  {
    id: "academy_staff",
    name: "Academy Staff",
    subtitle: "A noble profession, mostly consisting of paperwork, dust, and explaining obvious things repeatedly.",
    interviewPrompt: "How would you support the city academy and its students?",
    entryRequirements: ["Basic literacy", "Interest in study", "No active expulsion notice"],
    specialties: ["Education speed support", "Course access later", "Library utility"],
    ranks: [
      { rank: 1, title: "Archive Clerk", requirementLabel: "Starter", dailyGold: 100, dailyJobPoints: 2, passiveSummary: "+1% education speed" },
      { rank: 2, title: "Study Attendant", requirementLabel: "Knowledge 50+", dailyGold: 150, dailyJobPoints: 3, passiveSummary: "+1% course cost efficiency" },
      { rank: 3, title: "Assistant Lecturer", requirementLabel: "Knowledge 110+", dailyGold: 230, dailyJobPoints: 4, passiveSummary: "+2% education speed" },
      { rank: 4, title: "Faculty Scribe", requirementLabel: "Knowledge 180+", dailyGold: 320, dailyJobPoints: 5, passiveSummary: "+2% unlock tracking clarity" },
      { rank: 5, title: "Dean's Hand", requirementLabel: "Knowledge 300+", dailyGold: 440, dailyJobPoints: 6, passiveSummary: "+3% education speed" },
    ],
  },
  {
    id: "trade_office",
    name: "Trade Office",
    subtitle: "Where numbers become power, invoices become weapons, and merchants pretend they are respectable.",
    interviewPrompt: "Why should the city trust you around trade manifests and money?",
    entryRequirements: ["Practical Arithmetic", "No active market ban", "Basic commerce understanding"],
    specialties: ["Trade efficiency", "Market fees later", "Caravan support"],
    ranks: [
      { rank: 1, title: "Ledger Runner", requirementLabel: "Starter", dailyGold: 130, dailyJobPoints: 2, passiveSummary: "+1% trade income efficiency" },
      { rank: 2, title: "Manifest Clerk", requirementLabel: "Working stats 85+ total", dailyGold: 190, dailyJobPoints: 3, passiveSummary: "+1% market fee efficiency" },
      { rank: 3, title: "Quarter Assessor", requirementLabel: "Working stats 150+ total", dailyGold: 280, dailyJobPoints: 4, passiveSummary: "+2% trade income efficiency" },
      { rank: 4, title: "Route Auditor", requirementLabel: "Working stats 250+ total", dailyGold: 380, dailyJobPoints: 5, passiveSummary: "+2% caravan outcome quality" },
      { rank: 5, title: "Trade Commissioner", requirementLabel: "Working stats 420+ total", dailyGold: 520, dailyJobPoints: 6, passiveSummary: "+3% trade efficiency" },
    ],
  },
  {
    id: "civic_bureau",
    name: "Civic Bureau",
    subtitle: "Permits, records, fines, forms, and the dead-eyed rhythm of bureaucracy.",
    interviewPrompt: "What makes you suitable for civic administration?",
    entryRequirements: ["Basic literacy", "Civic Fundamentals", "No active legal censure"],
    specialties: ["Reputation gains", "Permit processing later", "Contract administration"],
    ranks: [
      { rank: 1, title: "Desk Clerk", requirementLabel: "Starter", dailyGold: 115, dailyJobPoints: 2, passiveSummary: "+1% civic reputation gain" },
      { rank: 2, title: "Records Scribe", requirementLabel: "Knowledge 60+", dailyGold: 175, dailyJobPoints: 3, passiveSummary: "+1% permit efficiency" },
      { rank: 3, title: "Permit Officer", requirementLabel: "Knowledge 120+", dailyGold: 255, dailyJobPoints: 4, passiveSummary: "+2% civic reputation gain" },
      { rank: 4, title: "Registrar", requirementLabel: "Knowledge 200+", dailyGold: 350, dailyJobPoints: 5, passiveSummary: "+2% contract admin success" },
      { rank: 5, title: "Civic Marshal", requirementLabel: "Knowledge 320+", dailyGold: 480, dailyJobPoints: 6, passiveSummary: "+3% civic gain efficiency" },
    ],
  },
  {
    id: "forge_union",
    name: "Forge Union",
    subtitle: "Heat, hammering, and very loud arguments about what counts as proper metalwork.",
    interviewPrompt: "Why should the forge trust your hands, lungs, and patience?",
    entryRequirements: ["Basic endurance", "No severe burn recovery", "Interest in craft"],
    specialties: ["Crafting support", "Material quality later", "Workshop utility"],
    ranks: [
      { rank: 1, title: "Coal Hand", requirementLabel: "Starter", dailyGold: 125, dailyJobPoints: 2, passiveSummary: "+1% crafting output" },
      { rank: 2, title: "Hammer Aide", requirementLabel: "Labor 55+", dailyGold: 185, dailyJobPoints: 3, passiveSummary: "+1% material efficiency" },
      { rank: 3, title: "Journeyman Smith", requirementLabel: "Labor 120+", dailyGold: 270, dailyJobPoints: 4, passiveSummary: "+2% crafting output" },
      { rank: 4, title: "Tempering Master", requirementLabel: "Labor 210+", dailyGold: 365, dailyJobPoints: 5, passiveSummary: "+2% equipment quality chance" },
      { rank: 5, title: "Guild Forgewarden", requirementLabel: "Labor 340+", dailyGold: 495, dailyJobPoints: 6, passiveSummary: "+3% workshop efficiency" },
    ],
  },
];
