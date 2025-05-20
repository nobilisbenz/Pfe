const AysncHandler = require("express-async-handler");
const Teacher = require("../../model/Staff/Teacher");
const Student = require("../../model/Academic/Student");
const Course = require("../../model/Academic/Course");
const ExamResult = require("../../model/Academic/ExamResults");

//@desc  Get Dashboard Statistics
//@route GET /api/v1/dashboard/stats
//@acess Private Admin only

exports.getDashboardStats = AysncHandler(async (req, res) => {
  try {
    // Total étudiants actifs
    const totalStudents = await Student.countDocuments({
      isWithdrawn: false,
      isSuspended: false
    });

    // Enseignants actifs
    const activeTeachers = await Teacher.countDocuments({
      isWithdrawn: false,
      isSuspended: false
    });

    // Total des cours
    const totalCourses = await Course.countDocuments();

    // Calculer les tendances (évolution par rapport au mois précédent)
    const currentDate = new Date();
    const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Étudiants du mois dernier
    const lastMonthStudents = await Student.countDocuments({
      createdAt: { 
        $gte: firstDayLastMonth,
        $lte: lastDayLastMonth
      }
    });

    // Étudiants ce mois-ci
    const currentMonthStudents = await Student.countDocuments({
      createdAt: { 
        $gte: firstDayCurrentMonth 
      }
    });

    // Calculer les tendances
    const studentTrend = lastMonthStudents ? 
      ((currentMonthStudents - lastMonthStudents) / lastMonthStudents) * 100 : 0;

    // Statistiques des résultats d'examens
    const examStats = await ExamResult.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
          passCount: {
            $sum: { $cond: [{ $eq: ["$status", "Pass"] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const examSuccess = examStats.length > 0 ? 
      Math.round((examStats[0].passCount / examStats[0].totalCount) * 100) : 0;

    res.status(200).json({
      status: "success",
      data: {
        totalStudents,
        activeTeachers,
        totalCourses,
        examSuccess,
        trends: {
          students: studentTrend.toFixed(2),
          teachers: 0, // À implémenter selon vos besoins
          revenue: 0,  // À implémenter selon vos besoins
          courses: 0   // À implémenter selon vos besoins
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});