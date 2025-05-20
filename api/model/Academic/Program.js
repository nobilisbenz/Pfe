const mongoose = require("mongoose");

const { Schema } = mongoose;

const ProgramSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      default: function () {
        return (
          this.name
            .split(" ")
            .map(name => name[0])
            .join("")
            .toUpperCase() +
          Math.floor(10 + Math.random() * 90) +
          Math.floor(10 + Math.random() * 90)
        );
      },
    },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true
    },
    classLevel: {
      type: Schema.Types.ObjectId,
      ref: "ClassLevel",
      required: true
    },
    schedule: {
      weekSchedule: [{
        day: {
          type: String,
          enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
          required: true
        },
        slots: [{
          startTime: {
            type: String,
            required: true
          },
          endTime: {
            type: String,
            required: true
          },
          subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
          },
          teacher: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true
          },
          room: {
            type: String,
            required: true
          },
          type: {
            type: String,
            enum: ['Cours', 'TP', 'TD'],
            default: 'Cours'
          },
          maxStudents: {
            type: Number,
            default: 30
          }
        }]
      }],
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      }
    },
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    teachers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
        default: [],
      },
    ],
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        default: [],
      },
    ],
    status: {
      type: String,
      enum: ['En cours', 'Terminé', 'Planifié'],
      default: 'Planifié'
    }
  },
  { timestamps: true }
);

// Méthode pour vérifier les conflits d'emploi du temps
ProgramSchema.methods.checkScheduleConflicts = function() {
  const conflicts = [];
  const schedule = this.schedule.weekSchedule;

  for (let i = 0; i < schedule.length; i++) {
    const day = schedule[i];
    for (let j = 0; j < day.slots.length; j++) {
      const slot = day.slots[j];
      for (let k = j + 1; k < day.slots.length; k++) {
        const otherSlot = day.slots[k];
        if (
          (slot.startTime <= otherSlot.endTime && slot.endTime >= otherSlot.startTime) ||
          (slot.teacher.toString() === otherSlot.teacher.toString() && 
           slot.startTime <= otherSlot.endTime && slot.endTime >= otherSlot.startTime)
        ) {
          conflicts.push({
            day: day.day,
            slot1: slot,
            slot2: otherSlot,
            type: 'Conflit horaire'
          });
        }
      }
    }
  }
  return conflicts;
};

// Middleware pour vérifier les conflits avant la sauvegarde
ProgramSchema.pre('save', async function(next) {
  const conflicts = this.checkScheduleConflicts();
  if (conflicts.length > 0) {
    next(new Error('Conflits détectés dans l\'emploi du temps'));
  }
  next();
});

const Program = mongoose.model("Program", ProgramSchema);

module.exports = Program;
