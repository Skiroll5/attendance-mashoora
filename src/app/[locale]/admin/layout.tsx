import LanguageSwitcher from '@/components/LanguageSwitcher';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Toaster } from '@/components/ui/toast'; // wait, it's useToast and Toaster from toaster.tsx if I used it, wait. I will just render children. I will add Toaster to root layout instead.

import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('Admin');
  const session = await auth();
  
  // @ts-ignore
  const isAdmin = !!session?.user?.isAdmin;

  if (session?.user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card sticky top-0 z-10 shadow-sm border-primary/10">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="font-semibold text-lg text-primary">{t('dashboard')}</h1>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <Button variant="ghost" size="icon" type="submit" className="text-muted-foreground hover:text-primary">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg border-primary/20 text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-secondary/30 flex items-center justify-center text-primary">
                <Clock className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl text-primary font-serif">Account Pending</CardTitle>
              <CardDescription className="text-md mt-2">
                Your account is currently waiting for administrator approval. You cannot access the dashboard until you are granted admin rights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm border-primary/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-semibold text-lg text-primary font-serif">{t('dashboard')}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <Button variant="ghost" size="icon" type="submit" className="text-muted-foreground hover:text-primary">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
