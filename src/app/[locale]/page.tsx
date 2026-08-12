'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { registerStudent } from '@/lib/actions';
import StudentQRCode from '@/components/qrcode/StudentQRCode';
import { Loader2 } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function StudentLandingPage() {
  const t = useTranslations('Register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string, name: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await registerStudent(formData);
    if (res.error) {
      setError(res.error);
    } else if (res.success && res.id) {
      setSuccessData({ id: res.id, name: formData.get('fullName') as string });
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4">
      <div className="w-full max-w-md flex justify-end mb-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">{t('title')}</CardTitle>
          <CardDescription>
            {successData ? t('success') : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successData ? (
            <StudentQRCode studentId={successData.id} name={successData.name} />
          ) : (
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('fullName')}</Label>
                <Input id="fullName" name="fullName" required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" name="email" type="email" required placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('phoneNumber')}</Label>
                <Input id="phoneNumber" name="phoneNumber" type="tel" required placeholder="+1234567890" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthday">{t('birthday')}</Label>
                  <Input id="birthday" name="birthday" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation">{t('graduation')}</Label>
                  <Input id="graduation" name="graduation" type="number" required placeholder="2026" min="1900" max="2100" />
                </div>
              </div>
              
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('submit')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
