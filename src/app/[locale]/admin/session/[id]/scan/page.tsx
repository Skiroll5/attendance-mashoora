import QRCodeScanner from '@/components/scanner/QRCodeScanner';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';

export default async function ScanSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('Admin');
  const { id } = await params;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">{t('scannerTitle')}</h2>
      </div>
      
      <QRCodeScanner sessionId={id} />
    </div>
  );
}
