'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Users, QrCode, Trash2, Edit2, X, Check } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { updateSession, deleteSession } from '@/lib/actions';
import { toast } from 'sonner';

type Session = {
  id: string;
  className: string;
  sessionDate: number;
};

export default function SessionCard({ session, tScan }: { session: Session, tScan: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [className, setClassName] = useState(session.className);
  
  // Convert timestamp to YYYY-MM-DD for the input
  const dateObj = new Date(session.sessionDate);
  const [dateStr, setDateStr] = useState(dateObj.toISOString().split('T')[0]);

  const handleUpdate = async () => {
    if (!className || !dateStr) return;
    const res = await updateSession(session.id, className, dateStr);
    if (res.error) {
      toast.error('Failed to update session', { description: res.error });
    } else {
      toast.success('Session updated');
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const res = await deleteSession(session.id);
    if (res.error) {
      toast.error('Failed to delete session', { description: res.error });
    } else {
      toast.success('Session deleted');
    }
  };

  if (isEditing) {
    return (
      <Card className="border-primary shadow-md">
        <CardHeader className="pb-3 bg-secondary/5 rounded-t-lg space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Class Name</Label>
            <Input value={className} onChange={e => setClassName(e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Date</Label>
            <Input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="h-8" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex gap-2 w-full">
          <Button className="flex-1" variant="outline" onClick={() => {
            setIsEditing(false);
            setClassName(session.className);
            setDateStr(dateObj.toISOString().split('T')[0]);
          }}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleUpdate}>
            <Check className="mr-2 h-4 w-4" /> Save
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isDeleting) {
    return (
      <Card className="border-destructive shadow-md">
        <CardHeader className="pb-3 bg-destructive/5 rounded-t-lg">
          <CardTitle className="text-lg text-destructive">Delete Session?</CardTitle>
          <CardDescription>This will also delete all attendance records for this session. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex gap-2 w-full">
          <Button className="flex-1" variant="outline" onClick={() => setIsDeleting(false)}>
            Cancel
          </Button>
          <Button className="flex-1" variant="destructive" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-primary/50 transition-colors shadow-sm group">
      <CardHeader className="pb-3 bg-secondary/5 rounded-t-lg relative">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setIsDeleting(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg line-clamp-1 pr-16">{session.className}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-primary/70">
          <Calendar className="h-4 w-4" />
          {new Date(session.sessionDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 flex gap-2 w-full">
        <Button asChild className="flex-1" variant="outline">
          <Link href={`/admin/session/${session.id}`}>
            <Users className="mr-2 h-4 w-4" />
            Details
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/admin/session/${session.id}/scan`}>
            <QrCode className="mr-2 h-4 w-4" />
            {tScan}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
