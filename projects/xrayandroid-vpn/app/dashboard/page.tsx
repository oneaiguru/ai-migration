import AppShell from "../../components/AppShell";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <AppShell active="Home">
      <DashboardClient />
    </AppShell>
  );
}
