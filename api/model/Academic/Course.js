const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
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
    level: {
      type: String,
      required: true,
      enum: ['Débutant', 'Intermédiaire', 'Avancé'],
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: '📚'
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    status: {
      type: String,
      enum: ['En cours', 'À venir', 'Terminé'],
      default: 'À venir'
    },
    maxStudents: {
      type: Number,
      default: 30
    },
    enrolledStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    }],
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher"
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

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;