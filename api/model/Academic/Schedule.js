const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    slots: [{
      day: {
        type: String,
        required: true,
        enum: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      },
      timeSlot: {
        start: {
          type: String,
          required: true,
        },
        end: {
          type: String,
          required: true,
        }
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
      },
      room: {
        type: String,
        required: true,
      }
    }],
    classLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassLevel",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Index composé pour assurer l'unicité de la combinaison programme/semaine/année
scheduleSchema.index({ program: 1, weekNumber: 1, year: 1 }, { unique: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;