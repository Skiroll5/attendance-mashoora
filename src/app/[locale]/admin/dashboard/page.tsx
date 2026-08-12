import { getSessions, createSession, getStudentsWithAttendance, getUsers, toggleUserAdmin } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { Link } from '@/i18n/routing';
import { QrCode, PlusCircle, Calendar, Users, Shield, GraduationCap, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SessionCard from '@/components/admin/SessionCard';

export default async function AdminDashboardPage() {
  const t = await getTranslations('Admin');
  
  // Fetch all required data
  const [sessions, studentsData, users] = await Promise.all([
    getSessions(),
    getStudentsWithAttendance(),
    getUsers()
  ]);

  const totalSessions = sessions.length;

  async function handleCreateSession(formData: FormData) {
    'use server';
    const className = formData.get('className') as string;
    const date = formData.get('date') as string;
    if (className && date) {
      await createSession(className, date);
      revalidatePath('/admin/dashboard');
    }
  }

  async function handleToggleAdmin(formData: FormData) {
    'use server';
    const userId = formData.get('userId') as string;
    const isAdmin = formData.get('isAdmin') === 'true';
    await toggleUserAdmin(userId, !isAdmin);
    revalidatePath('/admin/dashboard');
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-primary">Mashoora Administration</h2>
      </div>

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-secondary/20">
          <TabsTrigger value="sessions" className="text-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Calendar className="w-4 h-4 mr-2"/> Sessions</TabsTrigger>
          <TabsTrigger value="students" className="text-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><GraduationCap className="w-4 h-4 mr-2"/> Students</TabsTrigger>
          <TabsTrigger value="users" className="text-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Shield className="w-4 h-4 mr-2"/> Users</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-secondary/10 border-b border-primary/10">
              <CardTitle className="text-xl flex items-center gap-2 text-primary font-serif">
                <PlusCircle className="h-5 w-5" />
                {t('newSession')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={handleCreateSession} className="flex flex-col sm:flex-row gap-5 items-end">
                <div className="space-y-2 w-full">
                  <Label htmlFor="className" className="text-foreground">{t('className')}</Label>
                  <Input id="className" name="className" required placeholder="e.g. Session 1: Introduction" className="border-primary/20" />
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="date" className="text-foreground">{t('date')}</Label>
                  <Input id="date" name="date" type="date" required className="border-primary/20" />
                </div>
                <Button type="submit" className="w-full sm:w-auto min-w-[120px]">
                  {t('create')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-primary">{t('sessions')}</h3>
            {sessions.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No sessions found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                  // @ts-ignore
                  <SessionCard key={session.id} session={session} tScan={t('scan')} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="students">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-secondary/10 border-b border-primary/10">
              <CardTitle className="text-xl text-primary font-serif flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Registered Students
              </CardTitle>
              <CardDescription>View all students and their attendance records across {totalSessions} sessions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/5">
                    <tr>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Phone</th>
                      <th className="px-6 py-4 font-medium">Qualification</th>
                      <th className="px-6 py-4 font-medium">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {studentsData.map((row) => {
                      const percentage = totalSessions > 0 ? Math.round((row.attendanceCount / totalSessions) * 100) : 0;
                      return (
                        <tr key={row.student.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{row.student.fullName}</td>
                          <td className="px-6 py-4 text-muted-foreground">{row.student.phoneNumber}</td>
                          <td className="px-6 py-4 text-muted-foreground">{row.student.academicQualification}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{percentage}%</span>
                              <span className="text-xs text-muted-foreground">({row.attendanceCount}/{totalSessions})</span>
                            </div>
                            <div className="w-full bg-secondary/30 rounded-full h-1.5 mt-1">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {studentsData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No students registered yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-secondary/10 border-b border-primary/10">
              <CardTitle className="text-xl text-primary font-serif flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrator Management
              </CardTitle>
              <CardDescription>Manage who has access to this dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/5">
                    <tr>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                          {user.image && <img src={user.image} alt={user.name || ''} className="w-8 h-8 rounded-full border border-primary/20" />}
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4">
                          {user.isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle className="w-3 h-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <form action={handleToggleAdmin}>
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="isAdmin" value={user.isAdmin ? 'true' : 'false'} />
                            <Button type="submit" variant={user.isAdmin ? "outline" : "default"} size="sm" className={user.isAdmin ? "text-destructive hover:bg-destructive/10" : ""}>
                              {user.isAdmin ? 'Revoke Access' : 'Approve Admin'}
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
