
export class DashboardStatsDto {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  activeGroups: number;
  monthlyRevenue: number;
  attendance: {
    present: number;
    absent: number;
    total: number;
  };
  lastUpdated: any;
  teacherPerformance: any;
}
