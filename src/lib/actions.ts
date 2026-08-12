'use server';

import { db } from '@/db';
import { students, classSessions, attendance } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from './auth';

export async function registerStudent(formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const birthday = formData.get('birthday') as string;
  const graduation = formData.get('graduation') as string;

  if (!fullName || !email) {
    return { error: 'Full name and email are required.' };
  }

  try {
    const result = await db.insert(students).values({
      fullName,
      email,
      phoneNumber,
      birthday,
      graduation,
    }).returning({ id: students.id });

    return { success: true, id: result[0].id };
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return { error: 'Email already registered.' };
    }
    return { error: 'Failed to register student.' };
  }
}

export async function createSession(className: string, sessionDateStr: string) {
  const session = await auth();
  if (!session?.user) return { error: 'Unauthorized' };

  try {
    const dateParts = sessionDateStr.split('-');
    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    
    await db.insert(classSessions).values({
      className,
      sessionDate: date,
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create session.' };
  }
}

export async function getSessions() {
  const session = await auth();
  if (!session?.user) return [];

  const data = await db.select().from(classSessions).orderBy(classSessions.sessionDate);
  return data;
}

export async function logAttendance(sessionId: string, studentId: string) {
  const session = await auth();
  if (!session?.user) return { error: 'Unauthorized' };

  try {
    // Check if student exists
    const student = await db.select().from(students).where(eq(students.id, studentId)).get();
    if (!student) {
      return { error: 'Invalid QR Code. Student not found.' };
    }

    await db.insert(attendance).values({
      sessionId,
      studentId,
    });
    return { success: true, studentName: student.fullName };
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return { error: 'Student already logged for this session.' };
    }
    return { error: 'Failed to log attendance.' };
  }
}
