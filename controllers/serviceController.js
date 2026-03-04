import Handyman from '../models/Handyman.js';

/**
 * Get all available service categories with stats
 */
export const getServiceCategories = async (req, res) => {
  try {
    // Get all unique skill categories from handymen
    const handymen = await Handyman.find({ isActive: true }).select('skillCategories rating totalJobs basePrice priceType');
    
    // Aggregate categories with stats
    const categoryStats = {};
    const categoryHasInAgreement = {}; // Track if any handyman in category uses "in_agreement"
    
    handymen.forEach(handyman => {
      handyman.skillCategories.forEach(category => {
        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            handymenCount: 0,
            totalJobs: 0,
            avgRating: 0,
            minPrice: Infinity,
            ratings: [],
          };
          categoryHasInAgreement[category] = false;
        }
        
        categoryStats[category].handymenCount += 1;
        categoryStats[category].totalJobs += handyman.totalJobs || 0;
        if (handyman.rating?.average) {
          categoryStats[category].ratings.push(handyman.rating.average);
        }
        // Track if any handyman uses "in_agreement" pricing
        if (handyman.priceType === 'in_agreement') {
          categoryHasInAgreement[category] = true;
        }
        // Only count basePrice for minPrice if not "in_agreement"
        if (handyman.priceType !== 'in_agreement' && handyman.basePrice && handyman.basePrice > 0 && handyman.basePrice < categoryStats[category].minPrice) {
          categoryStats[category].minPrice = handyman.basePrice;
        }
      });
    });
    
    // Calculate averages and format
    const categories = Object.values(categoryStats).map(stat => ({
      category: stat.category,
      handymenCount: stat.handymenCount,
      totalJobs: stat.totalJobs,
      avgRating: stat.ratings.length > 0 
        ? (stat.ratings.reduce((a, b) => a + b, 0) / stat.ratings.length).toFixed(1)
        : 0,
      minPrice: stat.minPrice === Infinity ? 0 : stat.minPrice,
      hasInAgreement: categoryHasInAgreement[stat.category] || false,
    }));
    
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Get Service Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service categories',
      error: error.message,
    });
  }
};

/**
 * Get skill/category options (distinct values in DB)
 * Used by mobile/web registration & filters.
 */
export const getSkillOptions = async (req, res) => {
  try {
    const skills = await Handyman.distinct('skillCategories', { isActive: true });
    const normalized = (skills || [])
      .map((s) => (s ?? '').toString().trim())
      .filter((s) => s.length > 0);
    const unique = [...new Set(normalized)].sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      skills: unique,
    });
  } catch (error) {
    console.error('Get Skill Options Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get skill options',
      error: error.message,
    });
  }
};

/**
 * Get all skill categories (for registration / filters).
 * Returns union of:
 * - predefined categories (kept in sync with Handyman model validation list)
 * - any custom skills that exist in the DB
 */
export const getSkillOptions = async (req, res) => {
  try {
    const predefined = [
      'Electrical',
      'Plumbing',
      'Painting',
      'Carpentry',
      'Appliance Repair',
      'General Maintenance',
      'HVAC',
      'Phone Repair',
      'TV Repair',
      'Computer Repair',
      'AC Repair',
      'Washing Machine Repair',
      'Refrigerator Repair',
      'Furniture Assembly',
      'Home Cleaning',
      'Garden Maintenance',
    ];

    // Include custom skills stored in DB (distinct values across all handymen)
    const dbSkills = await Handyman.distinct('skillCategories');

    const skills = [...new Set([...predefined, ...(dbSkills || [])])]
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter((s) => s.length > 0)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({ success: true, skills });
  } catch (error) {
    console.error('Get Skill Options Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skill options',
      error: error.message,
    });
  }
};
