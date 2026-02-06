import AppShell from "../../components/AppShell";
import SettingsClient from "./SettingsClient";

export default function SettingsPage() {
  return (
    <AppShell active="Settings">
      <SettingsClient />
    </AppShell>
  );
}
