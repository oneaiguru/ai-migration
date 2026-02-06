import AppShell from "../../components/AppShell";
import ServersClient from "./ServersClient";

export default function ServersPage() {
  return (
    <AppShell active="Servers">
      <ServersClient />
    </AppShell>
  );
}
