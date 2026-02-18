export type Language = "en" | "hi" | "mr" | "te" | "ta";

type Dictionary = Record<string, string>;

type Translations = Record<Language, Dictionary>;

const translations: Translations = {
  en: {
    "alerts.title": "Alerts",
    "alerts.subtitle": "Monitor critical dam alerts and incidents",
    "alerts.searchPlaceholder": "Search alerts",
    "alerts.filterByLevel": "Filter by level",
    "alerts.allLevels": "All levels",
    "alerts.high": "High",
    "alerts.medium": "Medium",
    "alerts.low": "Low",
    "alerts.filterByStatus": "Filter by status",
    "alerts.allStatus": "All status",
    "alerts.active": "Active",
    "alerts.acknowledged": "Acknowledged",
    "alerts.resolved": "Resolved",
    "dashboard.critical": "Critical",
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Real-time overview of dam operations",
    "dashboard.totalDamsMonitored": "Total dams monitored",
    "dashboard.fromLastMonth": "from last month",
    "dashboard.criticalAlerts": "Critical alerts",
    "dashboard.thisWeek": "this week",
    "dashboard.activeSensors": "Active sensors",
    "dashboard.operational": "operational",
    "dashboard.aiAccuracy": "AI accuracy",
    "dashboard.improved": "improved",
    "dashboard.livesProtected": "Lives protected",
    "dashboard.coverage": "coverage",
    "dashboard.agingDams": "Aging dams",
    "dashboard.requiresMonitoring": "requires monitoring",
    "dashboard.liveSensorMonitoring": "Live sensor monitoring",
    "dashboard.waterLevel": "Water level"
  },
  hi: {},
  mr: {},
  te: {},
  ta: {}
};

const prettifyKey = (key: string) => {
  const last = key.split(".").pop() || key;
  const spaced = last.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const t = (key: string, lang: Language = "en") => {
  return translations[lang]?.[key] || translations.en[key] || prettifyKey(key);
};
