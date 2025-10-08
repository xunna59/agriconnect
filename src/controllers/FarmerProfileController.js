const { FarmerProfile, User } = require('../models');

const FarmerProfileController = {
 getProfile: async (req, res) => {
  try {
    if (req.user.role !== "farmer")
      return res.status(403).json({ error: "Forbidden" });

    const profile = await FarmerProfile.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["fullname", "email", "phone", "role"], // exclude password
        },
      ],
    });

    if (!profile)
      return res.status(404).json({ error: "Profile not found" });

    const formattedProfile = {
      id: profile.id,
      farmName: profile.farmName,
      location: profile.location,
      bio: profile.bio,
      coverPhoto:
        profile.coverPhoto ||
        "https://res.cloudinary.com/demo/image/upload/v1700000000/default-cover.jpg",
      accountDetails: {
        name: profile.accountName,
        mobileMoneyNumber: profile.mobileMoneyNumber,
        provider: profile.mobileMoneyProvider,
      },
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      user: {
        fullname: profile.user.fullname,
        email: profile.user.email,
        phone: profile.user.phone,
        role: profile.user.role,
      },
    };

    res.json({
      status: "success",
      message: "Farmer profile retrieved successfully.",
      data: formattedProfile,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: err.message });
  }
},


 updateProfile: async (req, res) => {
  try {
    if (req.user.role !== "farmer")
      return res.status(403).json({ error: "Forbidden" });

    const {
      farmName,
      location,
      bio,
      accountName,
      mobileMoneyNumber,
      mobileMoneyProvider,
    } = req.body;

    const profile = await FarmerProfile.findOne({
      where: { userId: req.user.id },
    });

    if (!profile) return res.status(404).json({ error: "Profile not found" });

    // Get Cloudinary uploaded image URL
    const coverPhotoUrl = req.uploadedFiles || profile.coverPhoto;

    await profile.update({
      farmName,
      location,
      bio,
      coverPhoto: coverPhotoUrl,
      accountName,
      mobileMoneyNumber,
      mobileMoneyProvider,
    });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},

  getAllFarmers: async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const isBuyer = req.user.role === "buyer";

    // Base attributes visible to everyone
    const baseAttributes = ["farmName", "location", "bio", "coverPhoto"];

    // Extra sensitive attributes (visible to admin only)
    const sensitiveAttributes = [
      "accountName",
      "mobileMoneyNumber",
      "mobileMoneyProvider",
    ];

    const includeAttributes = isAdmin
      ? [...baseAttributes, ...sensitiveAttributes]
      : baseAttributes;

    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Fetch paginated farmers
    const { count, rows: farmers } = await User.findAndCountAll({
      where: { role: "farmer" },
      attributes: ["id", "fullname", "email", "phone", "role"],
      include: [
        {
          model: FarmerProfile,
          as: 'farmerProfile',
          attributes: includeAttributes,
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      status: "success",
      message: "Farmers retrieved successfully.",
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: farmers,
    });
  } catch (err) {
    console.error("Error fetching farmers:", err);
    res.status(500).json({ error: err.message });
  }
},


  // 🧭 Get single farmer by ID
  getFarmerById: async (req, res) => {
    try {
      const { id } = req.params;
      const isAdmin = req.user.role === 'admin';

      const baseAttributes = [
        'farmName',
        'location',
        'bio',
        'coverPhoto'
      ];

      const sensitiveAttributes = [
        'accountName',
        'mobileMoneyNumber',
        'mobileMoneyProvider'
      ];

      const includeAttributes = isAdmin
        ? [...baseAttributes, ...sensitiveAttributes]
        : baseAttributes;

      const farmer = await User.findOne({
        where: { id, role: 'farmer' },
        attributes: ['id', 'fullname', 'email', 'phone', 'role', 'created_at'],
        include: [
          {
            model: FarmerProfile,
              as: 'farmerProfile',
            attributes: includeAttributes
          }
        ]
      });

      if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

      res.json(farmer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

};

module.exports = FarmerProfileController;
