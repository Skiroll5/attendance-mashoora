'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Language');

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'it' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={t('toggle')}>
      <Languages className="h-5 w-5" />
    </Button>
  );
}
