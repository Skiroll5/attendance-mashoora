'use server';

import { db } from '@/db';
import { students, classSessions, attendance, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from './auth';

export async function registerStudent(formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const birthday = formData.get('birthday') as string;
  const academicQualification = formData.get('academicQualification') as string;

  if (!fullName || !phoneNumber || !birthday || !academicQualification) {
    return { error: 'All fields are required.' };
  }

  try {
    const [student] = await db.insert(students).values({
      fullName,
      phoneNumber,
      birthday,
      academicQualification,
    }).returning({ id: students.id });

    return { success: true, id: student.id };
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return { error: 'Phone number already registered.' };
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

export async function getStudentsWithAttendance() {
  // Get all students and count how many sessions they attended
  const result = await db.select({
    student: students,
    attendanceCount: sql<number>`count(${attendance.id})`
  })
  .from(students)
  .leftJoin(attendance, eq(students.id, attendance.studentId))
  .groupBy(students.id);
  
  return result;
}

export async function getUsers() {
  return await db.select().from(users);
}

export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  await db.update(users).set({ isAdmin }).where(eq(users.id, userId));
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

export async function getSessionAttendees(sessionId: string) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user?.isAdmin) return [];

  const data = await db.select({
    student: students,
    scannedAt: attendance.scannedAt
  })
  .from(attendance)
  .innerJoin(students, eq(attendance.studentId, students.id))
  .where(eq(attendance.sessionId, sessionId))
  .orderBy(attendance.scannedAt);
  
  return data;
}
