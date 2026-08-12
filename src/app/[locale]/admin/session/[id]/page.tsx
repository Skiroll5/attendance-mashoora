import { getSessionAttendees } from '@/lib/actions';
import { db } from '@/db';
import { classSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Calendar, Users, QrCode } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function SessionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Get session details
  const session = await db.select().from(classSessions).where(eq(classSessions.id, id)).get();
  
  if (!session) {
    notFound();
  }

  // Get attendees
  const attendees = await getSessionAttendees(id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-serif text-primary flex items-center gap-2">
            {session.className}
          </h2>
          <p className="text-muted-foreground flex items-center gap-1 text-sm mt-1">
            <Calendar className="w-4 h-4" />
            {new Date(session.sessionDate).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <Link href={`/admin/session/${session.id}/scan`}>
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR Codes
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-secondary/10 border-b border-primary/10">
          <CardTitle className="text-xl text-primary font-serif flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendees ({attendees.length})
          </CardTitle>
          <CardDescription>List of all students who were scanned in for this session.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Qualification</th>
                  <th className="px-6 py-4 font-medium">Scanned At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {attendees.map((row) => (
                  <tr key={row.student.id} className="hover:bg-secondary/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{row.student.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.student.phoneNumber}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.student.academicQualification}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(row.scannedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {attendees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No attendees recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
