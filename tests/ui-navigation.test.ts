import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { workspaceNavigation, isWorkspaceItemActive, workspacePageTitle } from "../app/utils/workspace-navigation.ts";

const source = (path: string) => readFileSync(path, "utf8");

test("all linked pages exist; unavailable modules have no fake routes/actions", () => {
  for (const item of workspaceNavigation.filter(item => item.to)) {
    assert.ok(existsSync(item.to === "/" ? "app/pages/index.vue" : `app/pages${item.to}.vue`));
  }
  for (const label of ["Visa Cases", "Documents", "Browser Console", "Human Approvals", "Agent Workspace", "AgentMail Desk", "API Key Vault", "Analytics"]) {
    const item = workspaceNavigation.find(i => i.label === label);
    assert.ok(item);
    assert.equal(item.to, undefined);
    assert.equal(item.action, undefined);
  }
});

test("exactly one active item per existing route and correct titles", () => {
  for (const path of ["/", "/chat/thread-123", "/settings/profile", "/settings/integrations"]) {
    assert.equal(workspaceNavigation.filter(item => isWorkspaceItemActive(item, path)).length, 1);
  }
  assert.equal(workspacePageTitle("/chat/thread-123"), "AI Assistant");
  assert.equal(workspacePageTitle("/settings/integrations"), "Integrations");
  assert.equal(workspacePageTitle("/"), "Dashboard");
});

test("search and mobile toggle are wired; notifications use real authorization state", () => {
  const navbar = source("app/components/AppNavbar.vue");
  const layout = source("app/layouts/default.vue");
  assert.ok(navbar.includes(":toggle="));
  assert.ok(!navbar.includes("<UDashboardSidebarToggle"), "Navbar already renders its native toggle; do not duplicate it");
  assert.ok(navbar.includes("workspace-search-open"));
  assert.ok(layout.includes("workspace-search-open"));
  assert.ok(layout.includes('aria-disabled="true"'));
  assert.ok(layout.includes("ChatThreadList"));
  assert.ok(navbar.includes("useAuthorizationChallenges"));
  assert.ok(navbar.includes("No authorization alerts in the current session."));
});

test("short-screen sidebar scrolls and mobile menus close on search/navigation", () => {
  const layout = source("app/layouts/default.vue");
  assert.ok(layout.includes("overflow-y-auto"));
  assert.ok(layout.includes("resizable"));
  assert.ok(layout.includes('class="shrink-0 space-y-1"'));
  assert.ok(layout.includes("watch(searchOpen"));
  assert.ok(layout.includes("watch(() => route.fullPath"));
});

test("semantic colors, reduced motion, light mode and safe areas remain consistent", () => {
  const css = source("app/assets/css/main.css");
  for (const color of ["#FFFFFF", "#F8F9FB", "#171717", "#6B7280", "#007AFF", "#E5E7EB", "#16A34A", "#D97706", "#DC2626"]) assert.ok(css.includes(color));
  assert.ok(css.includes("prefers-reduced-motion"));
  assert.ok(css.includes("safe-area-inset-bottom"));
  assert.ok(source("app/app.vue").includes('colorMode.preference = "light"'));
  for (const path of ["app/components/chat/ThreadList.vue", "app/components/chat/tool/Weather.vue"]) {
    assert.ok(!source(path).includes("bg-gradient"));
    assert.ok(!source(path).includes("bg-linear"));
  }
});

function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map(v => parseInt(v, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

test("primary and secondary small text and active labels meet 4.5:1 contrast", () => {
  for (const [fg, bg] of [["#171717", "#FFFFFF"], ["#6B7280", "#FFFFFF"], ["#6B7280", "#F8F9FB"], ["#0064D1", "#EAF3FF"], ["#FFFFFF", "#0064D1"]]) {
    assert.ok(contrast(fg!, bg!) >= 4.5, `${fg}/${bg} insufficient contrast`);
  }
});

test("keyboard and touch affordances are explicit", () => {
  const layout = source("app/layouts/default.vue");
  assert.ok(layout.includes('href="#workspace-main"'));
  assert.ok(layout.includes('id="workspace-main" tabindex="-1"'));
  assert.ok(layout.includes(":aria-current="));
  const css = source("app/assets/css/main.css");
  assert.ok(css.includes(":focus-visible"));
  assert.ok(css.includes("min-height: 44px"));
});

test("mobile forms/tool cards retain actions and bounded widths", () => {
  assert.ok(source("app/assets/css/main.css").includes(".vm-integration-row { flex-wrap: wrap; }"));
  assert.ok(source("app/components/settings/Row.vue").includes("vm-settings-row"));
  assert.ok(source("app/components/chat/StreamInspector.vue").includes("max-w-[calc(100vw-2rem)]"));
  const weather = source("app/components/chat/tool/Weather.vue");
  assert.ok(weather.includes("invocation.output.temperature"));
  assert.ok(weather.includes("invocation.state === 'output-error'"));
});
