import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  addCourse: (course: Course) => void;
  removeCourse: (courseCode: string) => void;
  removeInstructor: (courseCode: string, instructor: string) => void;
  enrollStudents: (courseCode: string, studentIds: string[]) => void;
  unenrollStudent: (courseCode: string, studentId: string) => void;
  removeStudent: (studentId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      addCourse: (course) =>
        set((state) =>
          state.courses.some(
            (c) =>
              c.courseCode.toUpperCase() === course.courseCode.toUpperCase(),
          )
            ? state
            : { courses: [...state.courses, course] },
        ),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((s) => ({
            ...s,
            enrolledCourses: s.enrolledCourses.filter(
              (code) => code !== courseCode,
            ),
          })),
        })),

      removeInstructor: (courseCode, instructor) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.courseCode === courseCode
              ? {
                  ...c,
                  instructors: (c.instructors ?? []).filter(
                    (name) => name !== instructor,
                  ),
                }
              : c,
          ),
        })),

      enrollStudents: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((s) =>
            studentIds.includes(s.studentId) &&
            !s.enrolledCourses.includes(courseCode)
              ? { ...s, enrolledCourses: [...s.enrolledCourses, courseCode] }
              : s,
          ),
        })),

      unenrollStudent: (courseCode, studentId) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.studentId === studentId
              ? {
                  ...s,
                  enrolledCourses: s.enrolledCourses.filter(
                    (code) => code !== courseCode,
                  ),
                }
              : s,
          ),
        })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),
    }),
    {
      name: "lab16-2569-680610727",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
