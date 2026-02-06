import AppShell from "../../components/AppShell";
import AccountClient from "./AccountClient";

export default function AccountPage() {
  return (
    <AppShell active="Account">
      <AccountClient />
    </AppShell>
  );
}
