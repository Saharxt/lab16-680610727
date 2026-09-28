import { useState } from "react";
import { PlusCircle, XIcon } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full min-w-0">
        <SelectValue className="min-w-0">
          {(v: string | null) => (
            <span className="truncate">
              {options.find((o) => o.value === v)?.label ?? placeholder}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudents, unenrollStudent } =
    useEnrollmentStore();
  const anchor = useComboboxAnchor();

  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  const labelOf = (studentId: string) =>
    studentOptions.find((o) => o.value === studentId)?.label ?? studentId;
  const nameOf = (studentId: string) => {
    const s = students.find((x) => x.studentId === studentId);
    return s ? `${s.firstName} ${s.lastName}` : studentId;
  };
  const studentsIn = (courseCode: string) =>
    students.filter((s) => s.enrolledCourses.includes(courseCode));

  const availableStudentIds = formCourse
    ? students
        .filter((s) => !s.enrolledCourses.includes(formCourse))
        .map((s) => s.studentId)
    : [];

  const handleCourseChange = (courseCode: string) => {
    setFormCourse(courseCode);
    setFormStudents([]);
  };

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    enrollStudents(formCourse, formStudents);
    handleEnrollDialogOpenChange(false);
  };

  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
    }
  };

  const rows = courses.filter((c) =>
    mode === "course"
      ? filterCourse === "all" || c.courseCode === filterCourse
      : filterStudent === "all" ||
        studentsIn(c.courseCode).some((s) => s.studentId === filterStudent),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog
        open={enrollDialogOpen}
        onOpenChange={handleEnrollDialogOpenChange}
      >
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent className="grid-cols-1">
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น
              (เลือกได้มากกว่า 1 คน)
            </DialogDescription>
          </DialogHeader>
          <div className="grid min-w-0 grid-cols-1 gap-4">
            <div className="grid min-w-0 grid-cols-1 gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={handleCourseChange}
              />
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-1.5">
              <Label htmlFor="formStudents">นักศึกษา</Label>
              <Combobox
                multiple
                autoHighlight
                disabled={!formCourse}
                items={availableStudentIds}
                value={formStudents}
                onValueChange={(value) => setFormStudents(value as string[])}
                filter={(studentId: string, q: string) =>
                  labelOf(studentId)
                    .toLowerCase()
                    .includes(q.trim().toLowerCase())
                }
              >
                <ComboboxChips ref={anchor} className="w-full">
                  <ComboboxValue>
                    {(values: string[]) => (
                      <>
                        {values.map((studentId) => (
                          <ComboboxChip key={studentId}>
                            {nameOf(studentId)}
                          </ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          id="formStudents"
                          disabled={!formCourse}
                          placeholder={
                            values.length > 0
                              ? undefined
                              : formCourse
                                ? "ค้นหานักศึกษา"
                                : "เลือกวิชาก่อน"
                          }
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>ไม่มีนักศึกษาให้เลือก</ComboboxEmpty>
                  <ComboboxList>
                    {(studentId: string) => (
                      <ComboboxItem key={studentId} value={studentId}>
                        {labelOf(studentId)}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!formCourse || formStudents.length === 0}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน
              {formStudents.length > 0 && ` (${formStudents.length} คน)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {rows.map((course) => {
              const enrolled = studentsIn(course.courseCode);
              return (
                <TableRow key={course.courseCode}>
                  <TableCell className="font-medium">
                    {course.courseCode}
                  </TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>{enrolled.length}</TableCell>
                  <TableCell className="whitespace-normal">
                    {enrolled.length === 0 ? (
                      <span className="text-muted-foreground">
                        ยังไม่มีนักศึกษา
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {enrolled.map((s) => (
                          <Badge
                            key={s.studentId}
                            variant="outline"
                            className="gap-0.5 border-blue-500/20 bg-blue-500/10 pr-1 text-blue-700 dark:text-blue-300"
                          >
                            {s.firstName} {s.lastName}
                            <button
                              type="button"
                              onClick={() =>
                                unenrollStudent(course.courseCode, s.studentId)
                              }
                              aria-label={`ลบ ${s.firstName} ${s.lastName}`}
                              className="inline-flex size-4 items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-1"
                            >
                              <XIcon className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
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
