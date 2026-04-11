export type EducationStatRewards = Partial<{
  labor: number;
  knowledge: number;
  endurance: number;
  strength: number;
  dexterity: number;
  defense: number;
  speed: number;
  intelligence: number;
  vitality: number;
  charisma: number;
}>;

export type EducationRewardKind =
  | "utility"
  | "combat"
  | "economy"
  | "travel"
  | "shadow"
  | "governance";

export type EducationCourse = {
  id: string;
  categoryId: string;
  code: string;
  name: string;
  durationDays: number;
  costGold: number;
  description: string;
  rewardKind: EducationRewardKind;
  prerequisites?: string[];
  statRewards?: EducationStatRewards;
  systemEffects?: string[];
  unlocksSystems?: string[];
  summaryLines: string[];
};

export type EducationCategory = {
  id: string;
  name: string;
  description: string;
  courses: EducationCourse[];
};

function makeCourse(categoryId: string, index: number, data: Omit<EducationCourse, "categoryId" | "code">): EducationCourse {
  return {
    ...data,
    categoryId,
    code: `${categoryId.slice(0, 3).toUpperCase()}-${String(index).padStart(2, "0")}`,
  };
}

export const educationCategories: EducationCategory[] = [
  {
    id: "general",
    name: "General Studies",
    description: "Broad foundational education that improves world access and overall efficiency.",
    courses: [
      makeCourse("general", 1, {
        id: "basic-literacy",
        name: "Basic Literacy",
        durationDays: 9,
        costGold: 1000,
        description: "Reading and comprehension training that speeds up all later study.",
        rewardKind: "utility",
        systemEffects: ["Education speed +5%"],
        summaryLines: ["Education speed +5%", "Required foundation for later study-heavy trees"],
      }),
      makeCourse("general", 2, {
        id: "practical-arithmetic",
        name: "Practical Arithmetic",
        durationDays: 10,
        costGold: 1200,
        description: "Counting, valuation, and transactional reasoning. Commerce should not be run by people who fear numbers.",
        rewardKind: "economy",
        prerequisites: ["basic-literacy"],
        systemEffects: ["Unlocks commerce", "Market efficiency +5%", "Job income +3%"],
        unlocksSystems: ["commerce"],
        summaryLines: ["Unlocks Commerce", "Market efficiency +5%", "Job income +3%"],
      }),
      makeCourse("general", 3, {
        id: "world-geography",
        name: "World Geography",
        durationDays: 12,
        costGold: 1400,
        description: "Maps, routes, terrain logic, and travel safety.",
        rewardKind: "travel",
        prerequisites: ["basic-literacy"],
        systemEffects: ["Travel time -5%", "Unlocks passive discovery events", "Prevents being lost during full travel"],
        unlocksSystems: ["safe_travel", "travel_discovery"],
        summaryLines: ["Travel time -5%", "Unlocks travel discoveries", "Prevents getting lost on proper routes"],
      }),
      makeCourse("general", 4, {
        id: "civic-fundamentals",
        name: "Civic Fundamentals",
        durationDays: 11,
        costGold: 1500,
        description: "Permits, civic structures, public obligations, and legal standing.",
        rewardKind: "governance",
        prerequisites: ["practical-arithmetic"],
        systemEffects: ["Unlocks consortium creation", "Unlocks permits", "Unlocks civic contracts"],
        unlocksSystems: ["consortium_creation", "permits", "civic_contracts"],
        summaryLines: ["Required for Consortium creation", "Unlocks permits", "Unlocks civic contracts"],
      }),
      makeCourse("general", 5, {
        id: "study-discipline",
        name: "Study Discipline",
        durationDays: 13,
        costGold: 1600,
        description: "Focus, scheduling, memory discipline, and sustained learning.",
        rewardKind: "utility",
        prerequisites: ["basic-literacy"],
        systemEffects: ["Education speed +5%"],
        summaryLines: ["Education speed +5%", "Stacks with Basic Literacy"],
      }),
      makeCourse("general", 6, {
        id: "applied-reasoning",
        name: "Applied Reasoning",
        durationDays: 14,
        costGold: 1800,
        description: "Pattern recognition and practical problem solving for missions, contracts, and investigations.",
        rewardKind: "utility",
        prerequisites: ["study-discipline"],
        systemEffects: ["Mission success +5%", "Contract success +5%", "Investigation success +5%"],
        summaryLines: ["Mission success +5%", "Contract success +5%", "Investigation success +5%"],
      }),
      makeCourse("general", 7, {
        id: "historical-awareness",
        name: "Historical Awareness",
        durationDays: 16,
        costGold: 2200,
        description: "Ruins make more sense when you know what fell there and why.",
        rewardKind: "travel",
        prerequisites: ["world-geography"],
        systemEffects: ["Discovery loot +15%", "Unlocks relic clues", "Unlocks lore-heavy dialogue"],
        unlocksSystems: ["relic_missions", "lore_dialogue"],
        summaryLines: ["Discovery loot +15%", "Unlocks relic clues", "Unlocks lore missions"],
      }),
      makeCourse("general", 8, {
        id: "field-survival",
        name: "Field Survival",
        durationDays: 15,
        costGold: 2100,
        description: "Endurance, recovery, and staying functional outside safe walls.",
        rewardKind: "combat",
        prerequisites: ["world-geography"],
        statRewards: { endurance: 5, vitality: 3 },
        systemEffects: ["Health regeneration +10%"],
        summaryLines: ["Health regeneration +10%", "Endurance +5", "Vitality +3"],
      }),
      makeCourse("general", 9, {
        id: "general-mastery",
        name: "General Mastery",
        durationDays: 22,
        costGold: 3500,
        description: "Completion of the full foundational line. Expensive, slow, and worth it.",
        rewardKind: "utility",
        prerequisites: [
          "basic-literacy",
          "practical-arithmetic",
          "world-geography",
          "civic-fundamentals",
          "study-discipline",
          "applied-reasoning",
          "historical-awareness",
          "field-survival",
        ],
        systemEffects: ["All battle stats +5%", "All working stats +5%"],
        unlocksSystems: ["general_mastery"],
        summaryLines: ["All battle stats +5%", "All working stats +5%", "Requires all previous General Studies courses"],
      }),
    ],
  },
  {
    id: "street",
    name: "Street Survival",
    description: "Urban awareness, low-tier criminal utility, and underworld literacy.",
    courses: [
      makeCourse("street", 1, {
        id: "back-alley-awareness",
        name: "Back Alley Awareness",
        durationDays: 9,
        costGold: 1000,
        description: "Recognizing bad routes before they recognize you.",
        rewardKind: "shadow",
        systemEffects: ["Awareness +5%"],
        summaryLines: ["Awareness +5%", "Improves low-tier urban safety"],
      }),
      makeCourse("street", 2, {
        id: "reading-intentions",
        name: "Reading Intentions",
        durationDays: 10,
        costGold: 1200,
        description: "Body language, motive reading, and small lies.",
        rewardKind: "shadow",
        prerequisites: ["back-alley-awareness"],
        systemEffects: ["Underworld encounter success +3%"],
        summaryLines: ["Underworld encounter success +3%", "Better hostile read quality"],
      }),
      makeCourse("street", 3, {
        id: "cheap-tricks",
        name: "Cheap Tricks",
        durationDays: 11,
        costGold: 1400,
        description: "Distractions, bait, and grubby little advantages.",
        rewardKind: "shadow",
        prerequisites: ["reading-intentions"],
        systemEffects: ["Unlocks petty criminal errands"],
        unlocksSystems: ["petty_crime"],
        summaryLines: ["Unlocks petty criminal errands", "Urban utility progression"],
      }),
      makeCourse("street", 4, {
        id: "street-rumors",
        name: "Street Rumors",
        durationDays: 12,
        costGold: 1500,
        description: "Knowing who knows who matters more than pretending morality is enough.",
        rewardKind: "shadow",
        prerequisites: ["cheap-tricks"],
        unlocksSystems: ["underworld_contacts"],
        summaryLines: ["Unlocks underworld contacts", "Unlocks rumor-based errands"],
      }),
      makeCourse("street", 5, {
        id: "concealment-basics",
        name: "Concealment Basics",
        durationDays: 13,
        costGold: 1700,
        description: "Stashing, disguising, and not drawing the eye.",
        rewardKind: "shadow",
        prerequisites: ["street-rumors"],
        systemEffects: ["Stealth +4%"],
        summaryLines: ["Stealth +4%", "Improves concealment behavior"],
      }),
      makeCourse("street", 6, {
        id: "illicit-trade-awareness",
        name: "Illicit Trade Awareness",
        durationDays: 14,
        costGold: 1900,
        description: "Recognizing unlawful supply and how it moves.",
        rewardKind: "shadow",
        prerequisites: ["concealment-basics"],
        unlocksSystems: ["illicit_trade"],
        summaryLines: ["Unlocks illicit trade awareness", "Prepares for deeper criminal routes"],
      }),
      makeCourse("street", 7, {
        id: "urban-escape-routes",
        name: "Urban Escape Routes",
        durationDays: 15,
        costGold: 2000,
        description: "Because every plan eventually needs a second door.",
        rewardKind: "shadow",
        prerequisites: ["illicit-trade-awareness"],
        systemEffects: ["Escape chance +5%"],
        summaryLines: ["Escape chance +5%", "Better route withdrawal under pressure"],
      }),
      makeCourse("street", 8, {
        id: "underworld-etiquette",
        name: "Underworld Etiquette",
        durationDays: 16,
        costGold: 2300,
        description: "Rules, signals, expectations, and the cost of ignorance.",
        rewardKind: "shadow",
        prerequisites: ["urban-escape-routes"],
        unlocksSystems: ["shadowcraft_pathway"],
        summaryLines: ["Completes Street Survival", "Required before Shadowcraft can begin"],
      }),
      makeCourse("street", 9, {
        id: "streetwise-mastery",
        name: "Streetwise Mastery",
        durationDays: 20,
        costGold: 3000,
        description: "Full command of urban survival and underworld baseline movement.",
        rewardKind: "shadow",
        prerequisites: ["underworld-etiquette"],
        systemEffects: ["Urban action success +5%"],
        unlocksSystems: ["shadowcraft"],
        summaryLines: ["Unlocks Shadowcraft", "Urban action success +5%"],
      }),
    ],
  },
  {
    id: "shadow",
    name: "Shadowcraft",
    description: "Dedicated rogue progression. Hard-gated behind Street Survival completion.",
    courses: [
      makeCourse("shadow", 1, {
        id: "street-smarts",
        name: "Street Smarts",
        durationDays: 10,
        costGold: 1500,
        description: "Applied criminal intelligence and situational leverage.",
        rewardKind: "shadow",
        prerequisites: ["streetwise-mastery"],
        summaryLines: ["Requires full Street Survival completion", "Foundation for Shadowcraft"],
      }),
      makeCourse("shadow", 2, {
        id: "sleight-of-hand",
        name: "Sleight of Hand",
        durationDays: 12,
        costGold: 1800,
        description: "Control, misdirection, and quiet theft.",
        rewardKind: "shadow",
        prerequisites: ["street-smarts"],
        systemEffects: ["Pickpocket success +5%"],
        summaryLines: ["Pickpocket success +5%", "Improves subtle theft actions"],
      }),
      makeCourse("shadow", 3, {
        id: "lockpicking",
        name: "Lockpicking",
        durationDays: 13,
        costGold: 2100,
        description: "Mechanical entry without public announcements.",
        rewardKind: "shadow",
        prerequisites: ["sleight-of-hand"],
        unlocksSystems: ["lockpicking"],
        summaryLines: ["Unlocks Lockpicking", "Allows mechanical stealth entry"],
      }),
      makeCourse("shadow", 4, {
        id: "shadow-networking",
        name: "Shadow Networking",
        durationDays: 14,
        costGold: 2300,
        description: "Information, favors, and invisible chains.",
        rewardKind: "shadow",
        prerequisites: ["lockpicking"],
        unlocksSystems: ["shadow_contacts"],
        summaryLines: ["Unlocks shadow contacts", "Better covert information flow"],
      }),
      makeCourse("shadow", 5, {
        id: "acrobatics-and-evasion",
        name: "Acrobatics & Evasion",
        durationDays: 15,
        costGold: 2500,
        description: "Mobility, escape, and surviving bad decisions elegantly.",
        rewardKind: "shadow",
        prerequisites: ["shadow-networking"],
        statRewards: { dexterity: 4, speed: 4 },
        summaryLines: ["Dexterity +4", "Speed +4", "Improves evasion actions"],
      }),
      makeCourse("shadow", 6, {
        id: "espionage",
        name: "Espionage",
        durationDays: 17,
        costGold: 2800,
        description: "Observation, infiltration, and patient information theft.",
        rewardKind: "shadow",
        prerequisites: ["acrobatics-and-evasion"],
        unlocksSystems: ["espionage"],
        summaryLines: ["Unlocks Espionage", "Enables covert intel actions"],
      }),
      makeCourse("shadow", 7, {
        id: "black-market-access",
        name: "Black Market Access",
        durationDays: 18,
        costGold: 3200,
        description: "Not the visible market. The useful one.",
        rewardKind: "shadow",
        prerequisites: ["espionage"],
        unlocksSystems: ["black_market"],
        summaryLines: ["Unlocks Black Market", "Mid-tree major utility unlock"],
      }),
      makeCourse("shadow", 8, {
        id: "assassination-arts",
        name: "Assassination Arts",
        durationDays: 20,
        costGold: 3500,
        description: "Precision violence. Efficient, ugly, and profitable.",
        rewardKind: "combat",
        prerequisites: ["black-market-access"],
        systemEffects: ["Stealthed damage +5%"],
        summaryLines: ["Stealthed damage +5%", "Advanced rogue combat progression"],
      }),
      makeCourse("shadow", 9, {
        id: "guild-leadership",
        name: "Guild Leadership",
        durationDays: 22,
        costGold: 4000,
        description: "Running a shadow operation without getting everyone killed.",
        rewardKind: "governance",
        prerequisites: ["assassination-arts"],
        unlocksSystems: ["shadow_leadership"],
        summaryLines: ["Unlocks shadow leadership", "High-tier underworld authority"],
      }),
    ],
  },
];

export const educationCourseMap: Record<string, EducationCourse> = Object.fromEntries(
  educationCategories.flatMap((category) => category.courses.map((course) => [course.id, course])),
);

export function getCourseState(
  course: EducationCourse,
  education: {
    activeCourse: { courseId: string } | null;
    isCourseCompleted: (courseId: string) => boolean;
    isCourseLocked: (course: EducationCourse) => boolean;
  },
): "completed" | "current" | "locked" | "available" {
  if (education.isCourseCompleted(course.id)) return "completed";
  if (education.activeCourse?.courseId === course.id) return "current";
  if (education.isCourseLocked(course)) return "locked";
  return "available";
}
