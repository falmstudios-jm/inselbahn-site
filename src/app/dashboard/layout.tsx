import { getSession } from '@/lib/dashboard-auth';
import { DashboardShell } from './dashboard-shell';
import { LoginScreen } from './login-screen';

export const metadata = {
  title: 'Dashboard — Inselbahn Helgoland',
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <DashboardShell name={session.name} role={session.role}>
      {children}
    </DashboardShell>
  );
}
