import { useState } from "react";
import { PlusCircle, Trash2, XIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";

const CREATE_PREFIX = "__create__:";

function AddCourseDialog() {
  const courses = useEnrollmentStore((state) => state.courses);
  const addCourse = useEnrollmentStore((state) => state.addCourse);
  const anchor = useComboboxAnchor();

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [instructors, setInstructors] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const normalizedCode = code.trim().toUpperCase();
  const isDuplicate =
    normalizedCode !== "" &&
    courses.some((c) => c.courseCode.toUpperCase() === normalizedCode);
  const canSave = normalizedCode !== "" && title.trim() !== "" && !isDuplicate;

  const knownInstructors = Array.from(
    new Set([...courses.flatMap((c) => c.instructors ?? []), ...instructors]),
  ).sort((a, b) => a.localeCompare(b));
  const trimmedQuery = query.trim();
  const canCreate =
    trimmedQuery !== "" &&
    !knownInstructors.some(
      (name) => name.toLowerCase() === trimmedQuery.toLowerCase(),
    );
  const instructorItems = canCreate
    ? [...knownInstructors, CREATE_PREFIX + trimmedQuery]
    : knownInstructors;

  const resetForm = () => {
    setCode("");
    setTitle("");
    setInstructors([]);
    setQuery("");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleInstructorsChange = (next: string[]) => {
    const created = next.find((value) => value.startsWith(CREATE_PREFIX));
    if (!created) {
      setInstructors(next);
      return;
    }
    const name = created.slice(CREATE_PREFIX.length);
    setInstructors([
      ...next.filter((value) => !value.startsWith(CREATE_PREFIX)),
      name,
    ]);
    setQuery("");
  };

  const handleSave = () => {
    if (!canSave) return;
    addCourse({
      courseCode: normalizedCode,
      courseTitle: title.trim(),
      instructors,
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent className="grid-cols-1">
        <DialogHeader>
          <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
          <DialogDescription>
            วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
          </DialogDescription>
        </DialogHeader>
        <div className="grid min-w-0 grid-cols-1 gap-4">
          <div className="grid min-w-0 grid-cols-1 gap-1.5">
            <Label htmlFor="courseCode">รหัสวิชา</Label>
            <Input
              id="courseCode"
              value={code}
              placeholder="เช่น CPE303"
              aria-invalid={isDuplicate || undefined}
              aria-describedby={isDuplicate ? "courseCode-error" : undefined}
              onChange={(e) => setCode(e.target.value)}
            />
            {isDuplicate && (
              <p id="courseCode-error" className="text-sm text-destructive">
                มีรหัสวิชา {normalizedCode} นี้แล้ว
              </p>
            )}
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-1.5">
            <Label htmlFor="courseTitle">ชื่อวิชา</Label>
            <Input
              id="courseTitle"
              value={title}
              placeholder="เช่น Mobile Application Development"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-1.5">
            <Label htmlFor="instructors">ผู้สอน</Label>
            <Combobox
              multiple
              autoHighlight
              items={instructorItems}
              value={instructors}
              onValueChange={(value) =>
                handleInstructorsChange(value as string[])
              }
              inputValue={query}
              onInputValueChange={(value) => setQuery(value)}
              filter={(item: string, q: string) =>
                item.startsWith(CREATE_PREFIX) ||
                item.toLowerCase().includes(q.trim().toLowerCase())
              }
            >
              <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                  {(values: string[]) => (
                    <>
                      {values.map((name) => (
                        <ComboboxChip key={name}>{name}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        id="instructors"
                        placeholder={
                          values.length === 0
                            ? "เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                            : undefined
                        }
                      />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>ไม่พบผู้สอน</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item.startsWith(CREATE_PREFIX)
                        ? `+ เพิ่มผู้สอน "${item.slice(CREATE_PREFIX.length)}"`
                        : item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!canSave} onClick={handleSave}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCourseButton({ course }: { course: Course }) {
  const removeCourse = useEnrollmentStore((state) => state.removeCourse);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label={`ลบวิชา ${course.courseCode}`}
          />
        }
      >
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ลบวิชา?</AlertDialogTitle>
          <AlertDialogDescription>
            ลบ {course.courseCode} — {course.courseTitle}{" "}
            ออกจากรายวิชาที่เปิดสอน
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => removeCourse(course.courseCode)}
          >
            ยืนยัน
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminCoursesPage() {
  const { courses, removeInstructor } = useEnrollmentStore();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา —
            เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาที่หน้า
            "จัดการการลงทะเบียน" ทันที
          </p>
        </div>
        <AddCourseDialog />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="w-20 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ยังไม่มีวิชา
                </TableCell>
              </TableRow>
            )}
            {courses.map((course) => {
              const instructors = course.instructors ?? [];
              return (
                <TableRow key={course.courseCode}>
                  <TableCell className="font-medium">
                    {course.courseCode}
                  </TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell className="whitespace-normal">
                    {instructors.length === 0 ? (
                      <span className="text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {instructors.map((name) => (
                          <Badge
                            key={name}
                            variant="outline"
                            className="gap-0.5 border-blue-500/20 bg-blue-500/10 pr-1 text-blue-700 dark:text-blue-300"
                          >
                            {name}
                            <button
                              type="button"
                              onClick={() =>
                                removeInstructor(course.courseCode, name)
                              }
                              aria-label={`ลบ ${name}`}
                              className="inline-flex size-4 items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-1"
                            >
                              <XIcon className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <DeleteCourseButton course={course} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
