export type AdminUniqueModuleCategory =
  | "command"
  | "vault"
  | "research"
  | "crafting"
  | "transport"
  | "defense"
  | "residence";

export type AdminUniquePropertyModule = {
  id: string;
  name: string;
  category: AdminUniqueModuleCategory;
  summary: string;
  effects: string[];
};

export type AdminUniqueProperty = {
  id: string;
  name: string;
  title: string;
  classification: string;
  ownerRestriction: "hennet_only";
  icon: string;
  summary: string;
  description: string;
  modules: AdminUniquePropertyModule[];
};

export const shadowGuardianPrime: AdminUniqueProperty = {
  id: "shadow_guardian_prime",
  name: "Shadow Guardian Prime",
  title: "Administrator Unique Infrastructure",
  classification: "Mythic Sovereign Bastion",
  ownerRestriction: "hennet_only",
  icon: "🜲",
  summary:
    "A singular high-altitude sovereign stronghold bound to Hennet alone. It is not a normal residence, but a command platform, vault citadel, research bastion, and strategic fortress.",
  description:
    "Shadow Guardian Prime exists outside the standard player housing ladder. Suspended beyond ordinary reach, it serves as Hennet Uthellien's private residence, supreme command nexus, fortified treasury, research citadel, logistics heart, and defensive bastion. It is less a house than a world-tier machine of authority.",
  modules: [
    {
      id: "sgp-sovereign-hall",
      name: "Sovereign Hall",
      category: "command",
      summary: "Formal audience chamber and ruling seat.",
      effects: [
        "Receives emissaries, loyalists, and strategic delegations",
        "Serves as ceremonial and political seat of authority"
      ]
    },
    {
      id: "sgp-private-residence",
      name: "Private Residence Wing",
      category: "residence",
      summary: "Hennet's secluded personal quarters within the bastion.",
      effects: [
        "Secured private chambers and planning space",
        "Direct protected access to command levels"
      ]
    },
    {
      id: "sgp-command-nexus",
      name: "Prime Command Nexus",
      category: "command",
      summary: "The operational brain of Shadow Guardian Prime.",
      effects: [
        "Oversees route intelligence, alerts, and strategic coordination",
        "Supports logistics, surveillance, and command planning"
      ]
    },
    {
      id: "sgp-grand-archive",
      name: "Grand Archive",
      category: "research",
      summary: "A deep intelligence and historical archive.",
      effects: [
        "Stores ledgers, dossiers, contracts, and relic records",
        "Supports future research and restricted knowledge systems"
      ]
    },
    {
      id: "sgp-prime-vault",
      name: "Prime Vault Complex",
      category: "vault",
      summary: "Layered treasury and relic containment infrastructure.",
      effects: [
        "Holds elite reserves, relics, and sealed assets",
        "Protected by multi-layered containment and denial systems"
      ]
    },
    {
      id: "sgp-shadow-forge",
      name: "Shadow Forge Wing",
      category: "crafting",
      summary: "Mythic-grade fabrication and project support infrastructure.",
      effects: [
        "Supports elite maintenance, fabrication, and future infrastructure projects",
        "Designed for high-tier crafting and specialist development"
      ]
    },
    {
      id: "sgp-arcane-bastion",
      name: "Arcane and Research Bastion",
      category: "research",
      summary: "Advanced magical analysis and controlled experimentation wing.",
      effects: [
        "Supports wards, relic study, and dangerous research",
        "Future-facing hook for arcane simulation and analysis systems"
      ]
    },
    {
      id: "sgp-restoration-core",
      name: "Restoration Core",
      category: "residence",
      summary: "Elite healing, restoration, and secured infirmary systems.",
      effects: [
        "Supports accelerated recovery and protected treatment",
        "Outperforms ordinary civic recovery infrastructure"
      ]
    },
    {
      id: "sgp-docking-ring",
      name: "Transport Docking Ring",
      category: "transport",
      summary: "Secured docking and logistics transfer infrastructure.",
      effects: [
        "Supports elite vehicle, cargo, and retrieval operations",
        "Future hook for top-tier transport systems"
      ]
    },
    {
      id: "sgp-defensive-core",
      name: "Defensive Core",
      category: "defense",
      summary: "Layered defensive shell, denial systems, and fortress lockdown capability.",
      effects: [
        "Supports anti-breach, anti-scrying, and compartment lockdown",
        "Defines the platform as a bastion first and residence second"
      ]
    }
  ]
};

export function isHennetAdminUniqueOwner(playerName: string, playerLastName?: string) {
  return playerName.trim().toLowerCase() === "hennet";
}
