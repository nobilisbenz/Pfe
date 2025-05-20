const AsyncHandler = require("express-async-handler");
const News = require("../../model/Public/News");

//@desc  Create News
//@route POST /api/v1/news
//@access Private Admin only

exports.createNews = AsyncHandler(async (req, res) => {
  const { title, content, summary, category, image, isPublished } = req.body;
  
  const newsCreated = await News.create({
    title,
    content,
    summary,
    category,
    image,
    isPublished,
    createdBy: req.userAuth._id,
  });

  res.status(201).json({
    status: "success",
    message: "Actualité créée avec succès",
    data: newsCreated,
  });
});

//@desc  Get all News
//@route GET /api/v1/news
//@access Public

exports.getAllNews = AsyncHandler(async (req, res) => {
  // Si c'est un admin, on montre toutes les actualités, sinon uniquement les publiées
  const filter = req.userAuth?.role === 'admin' ? {} : { isPublished: true };
  
  const news = await News.find(filter)
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email");

  res.status(200).json({
    status: "success",
    message: "Actualités récupérées avec succès",
    data: news,
  });
});

//@desc  Get single News
//@route GET /api/v1/news/:id
//@access Public

exports.getNews = AsyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id)
    .populate("createdBy", "name email");

  if (!news) {
    throw new Error("Actualité non trouvée");
  }

  res.status(200).json({
    status: "success",
    message: "Actualité récupérée avec succès",
    data: news,
  });
});

//@desc  Update News
//@route PUT /api/v1/news/:id
//@access Private Admin only

exports.updateNews = AsyncHandler(async (req, res) => {
  const { title, content, summary, category, image, isPublished } = req.body;
  
  const news = await News.findByIdAndUpdate(
    req.params.id,
    {
      title,
      content,
      summary,
      category,
      image,
      isPublished,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!news) {
    throw new Error("Actualité non trouvée");
  }

  res.status(200).json({
    status: "success",
    message: "Actualité mise à jour avec succès",
    data: news,
  });
});

//@desc  Delete News
//@route DELETE /api/v1/news/:id
//@access Private Admin only

exports.deleteNews = AsyncHandler(async (req, res) => {
  const news = await News.findByIdAndDelete(req.params.id);
  
  if (!news) {
    throw new Error("Actualité non trouvée");
  }

  res.status(200).json({
    status: "success",
    message: "Actualité supprimée avec succès"
  });
});