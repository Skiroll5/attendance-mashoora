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
import { useFormPersist } from '@/hooks/useFormPersist';

export default function StudentLandingPage() {
  const t = useTranslations('Register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string, name: string } | null>(null);

  const [formData, setFormData, isLoaded, clearForm] = useFormPersist('registration-form', {
    fullName: '',
    phoneNumber: '',
    birthday: '',
    academicQualification: ''
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const form = new FormData();
    form.append('fullName', formData.fullName);
    form.append('phoneNumber', formData.phoneNumber);
    form.append('birthday', formData.birthday);
    form.append('academicQualification', formData.academicQualification);

    const res = await registerStudent(form);
    if (res.error) {
      setError(res.error);
    } else if (res.success && res.id) {
      setSuccessData({ id: res.id, name: formData.fullName });
      clearForm();
    }
    setLoading(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Subtle background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-primary/80"></div>
      
      <div className="w-full max-w-xl flex justify-end mb-6 relative z-10">
        <LanguageSwitcher />
      </div>
      
      <Card className="w-full max-w-xl shadow-2xl border-primary/20 bg-card rounded-2xl overflow-hidden relative z-10">
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary w-full"></div>
        <CardHeader className="text-center pt-8 pb-6">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {/* Cross/Church icon could go here, using a stylized M for now */}
            <span className="font-serif text-3xl font-bold">M</span>
          </div>
          <CardTitle className="text-3xl text-primary font-serif">{t('title')}</CardTitle>
          <CardDescription className="text-muted-foreground mt-2 text-md">
            {successData ? t('success') : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {successData ? (
            <StudentQRCode studentId={successData.id} name={successData.name} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground font-medium">{t('fullName')}</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  required 
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe" 
                  className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-foreground font-medium">{t('phoneNumber')}</Label>
                <Input 
                  id="phoneNumber" 
                  name="phoneNumber" 
                  type="tel" 
                  required 
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1234567890" 
                  className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="text-foreground font-medium">{t('birthday')}</Label>
                  <Input 
                    id="birthday" 
                    name="birthday" 
                    type="date" 
                    required 
                    value={formData.birthday}
                    onChange={handleChange}
                    className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicQualification" className="text-foreground font-medium">{t('academicQualification')}</Label>
                  <Input 
                    id="academicQualification" 
                    name="academicQualification" 
                    type="text" 
                    required 
                    value={formData.academicQualification}
                    onChange={handleChange}
                    placeholder="BSc Engineering" 
                    className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12"
                  />
                </div>
              </div>
              
              {error && <p className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">{error}</p>}
              
              <Button type="submit" className="w-full mt-6 h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {t('submit')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
