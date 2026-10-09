export interface WorkspaceNavigationItem {
  label: string;
  icon: string;
  to?: string;
  action?: "new-chat";
}

// No fake routes or placeholder actions: missing modules are unavailable labels.
export const workspaceNavigation: WorkspaceNavigationItem[] = [
  { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/" },
  { label: "AI Assistant", icon: "i-lucide-message-square", action: "new-chat" },
  { label: "Visa Cases", icon: "i-lucide-folders" },
  { label: "Documents", icon: "i-lucide-files" },
  { label: "Browser Console", icon: "i-lucide-globe" },
  { label: "Human Approvals", icon: "i-lucide-shield-check" },
  { label: "Agent Workspace", icon: "i-lucide-bot" },
  { label: "AgentMail Desk", icon: "i-lucide-mail" },
  { label: "API Key Vault", icon: "i-lucide-key-round" },
  { label: "Analytics", icon: "i-lucide-chart-no-axes-combined" },
  { label: "Settings", icon: "i-lucide-settings", to: "/settings/profile" },
  { label: "Integrations", icon: "i-lucide-plug", to: "/settings/integrations" },
];

export function isWorkspaceItemActive(item: WorkspaceNavigationItem, path: string): boolean {
  return item.action === "new-chat" ? path.startsWith("/chat/") : path === item.to;
}

export function workspacePageTitle(path: string): string {
  if (path.startsWith("/chat/")) return "AI Assistant";
  return workspaceNavigation.find(item => item.to === path)?.label ?? "VisaMOTion";
}
