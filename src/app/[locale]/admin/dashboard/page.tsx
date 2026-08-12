import { getSessions, createSession } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { Link } from '@/i18n/routing';
import { QrCode, PlusCircle, Calendar } from 'lucide-react';

export default async function AdminDashboardPage() {
  const t = await getTranslations('Admin');
  const sessions = await getSessions();

  async function handleCreateSession(formData: FormData) {
    'use server';
    const className = formData.get('className') as string;
    const date = formData.get('date') as string;
    if (className && date) {
      await createSession(className, date);
      revalidatePath('/admin/dashboard');
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            {t('newSession')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreateSession} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 w-full">
              <Label htmlFor="className">{t('className')}</Label>
              <Input id="className" name="className" required placeholder="e.g. Math 101" />
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="date">{t('date')}</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              {t('create')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">{t('sessions')}</h2>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sessions found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{session.className}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(session.sessionDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/admin/session/${session.id}/scan`}>
                      <QrCode className="mr-2 h-4 w-4" />
                      {t('scan')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
