import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';
import { LogIn } from 'lucide-react';

export default async function AdminLoginPage() {
  const t = await getTranslations('Admin');

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">{t('login')}</CardTitle>
          <CardDescription>{t('dashboard')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/admin/dashboard' });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              {t('signInWithGoogle')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
