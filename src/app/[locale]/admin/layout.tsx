import LanguageSwitcher from '@/components/LanguageSwitcher';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Toaster } from '@/components/ui/toast'; // wait, it's useToast and Toaster from toaster.tsx if I used it, wait. I will just render children. I will add Toaster to root layout instead.

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('Admin');

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-semibold text-lg">{t('dashboard')}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <Button variant="ghost" size="icon" type="submit">
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
