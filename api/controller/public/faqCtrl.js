const AsyncHandler = require("express-async-handler");
const FAQ = require("../../model/Public/Faq");

// @desc    Créer une FAQ
// @route   POST /api/v1/faqs
// @access  Private Admin only
exports.createFAQ = AsyncHandler(async (req, res) => {
  const { question, answer, category, ordre, isActive } = req.body;

  const faqExists = await FAQ.findOne({ question });
  if (faqExists) {
    throw new Error("Cette question existe déjà");
  }

  const faq = await FAQ.create({
    question,
    answer,
    category,
    ordre,
    isActive,
    createdBy: req.userAuth._id,
  });

  res.status(201).json({
    status: "success",
    message: "FAQ créée avec succès",
    data: faq,
  });
});

// @desc    Obtenir toutes les FAQs
// @route   GET /api/v1/faqs
// @access  Public
exports.getAllFAQs = AsyncHandler(async (req, res) => {
  const faqs = await FAQ.find().sort({ ordre: 1, category: 1 });

  res.status(200).json({
    status: "success",
    data: faqs,
  });
});

// @desc    Obtenir une FAQ par son ID
// @route   GET /api/v1/faqs/:id
// @access  Public
exports.getFAQ = AsyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    throw new Error("FAQ non trouvée");
  }

  res.status(200).json({
    status: "success",
    data: faq,
  });
});

// @desc    Mettre à jour une FAQ
// @route   PUT /api/v1/faqs/:id
// @access  Private Admin only
exports.updateFAQ = AsyncHandler(async (req, res) => {
  const { question, answer, category, ordre, isActive } = req.body;

  const faq = await FAQ.findById(req.params.id);
  if (!faq) {
    throw new Error("FAQ non trouvée");
  }

  const updatedFAQ = await FAQ.findByIdAndUpdate(
    req.params.id,
    {
      question,
      answer,
      category,
      ordre,
      isActive,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "FAQ mise à jour avec succès",
    data: updatedFAQ,
  });
});

// @desc    Supprimer une FAQ
// @route   DELETE /api/v1/faqs/:id
// @access  Private Admin only
exports.deleteFAQ = AsyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) {
    throw new Error("FAQ non trouvée");
  }

  await FAQ.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "FAQ supprimée avec succès",
  });
});