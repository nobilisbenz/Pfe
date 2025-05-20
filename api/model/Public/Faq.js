const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      unique: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Admission', 'Formation', 'Financement', 'Technique', 'Général']
    },
    ordre: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Index pour optimiser la recherche par catégorie et ordre
faqSchema.index({ category: 1, ordre: 1 });

const FAQ = mongoose.model("FAQ", faqSchema);

module.exports = FAQ;