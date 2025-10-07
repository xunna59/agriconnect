const { FarmerProfile, User } = require('../models');

const FarmerProfileController = {
  getProfile: async (req, res) => {
    try {
      if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Forbidden' });

      const profile = await FarmerProfile.findOne({
        where: { userId: req.user.id },
        include: [{ model: User, as: 'user' }]
      });
      res.json(profile);
    } catch (err) {
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
}

};

module.exports = FarmerProfileController;
