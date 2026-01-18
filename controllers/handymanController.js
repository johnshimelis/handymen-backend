import Handyman from '../models/Handyman.js';
import User from '../models/User.js';
import { calculateDistance } from '../utils/calculateDistance.js';

/**
 * Register as handyman
 * Creates handyman profile linked to user account
 */
export const registerHandyman = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has handyman profile
    const existingHandyman = await Handyman.findOne({ userId });
    if (existingHandyman) {
      return res.status(400).json({
        success: false,
        message: 'You already have a handyman profile',
      });
    }

    // Check if user role is customer (needs to be updated)
    if (req.user.role !== 'handyman') {
      // Update user role
      await User.findByIdAndUpdate(userId, { role: 'handyman' });
    }

    const {
      skillCategories,
      experience,
      serviceDescription,
      basePrice,
      priceType,
      availability,
      location,
    } = req.body;

    // Validate required fields
    if (!skillCategories || skillCategories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one skill category',
      });
    }

    if (!experience || experience < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid experience in years',
      });
    }

    if (!serviceDescription || serviceDescription.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Service description is required',
      });
    }

    // Only validate basePrice if priceType is NOT "in_agreement"
    if (priceType !== 'in_agreement') {
      if (!basePrice || basePrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Base price must be greater than 0 ETB (or select "In Agreement")',
        });
      }
    }

    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Valid location coordinates are required',
      });
    }

    // Create handyman profile
    const handyman = new Handyman({
      userId,
      skillCategories,
      experience: parseInt(experience),
      serviceDescription: serviceDescription.trim(),
      basePrice: priceType === 'in_agreement' ? 0 : parseFloat(basePrice || 0),
      priceType: priceType || 'per_hour',
      availability: availability || {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        hours: { start: '08:00', end: '18:00' },
      },
      location: {
        coordinates: [location.coordinates[0], location.coordinates[1]], // [lon, lat]
        areaName: location.areaName || '',
        address: location.address || '',
      },
      profilePhoto: req.user.profilePhoto || '',
    });

    await handyman.save();

    res.status(201).json({
      success: true,
      message: 'Handyman profile created successfully',
      handyman: {
        id: handyman._id,
        skillCategories: handyman.skillCategories,
        experience: handyman.experience,
        basePrice: handyman.basePrice,
        rating: handyman.rating,
        isVerified: handyman.isVerified,
      },
    });
  } catch (error) {
    console.error('Register Handyman Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create handyman profile',
      error: error.message,
    });
  }
};

/**
 * Get handyman profile
 */
export const getHandymanProfile = async (req, res) => {
  try {
    const handyman = await Handyman.findOne({ userId: req.user._id }).populate(
      'userId',
      'fullName phoneNumber profilePhoto'
    );

    if (!handyman) {
      return res.status(404).json({
        success: false,
        message: 'Handyman profile not found',
      });
    }

    res.status(200).json({
      success: true,
      handyman,
    });
  } catch (error) {
    console.error('Get Handyman Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get handyman profile',
      error: error.message,
    });
  }
};

/**
 * Update handyman profile
 */
export const updateHandymanProfile = async (req, res) => {
  try {
    const handyman = await Handyman.findOne({ userId: req.user._id });

    if (!handyman) {
      return res.status(404).json({
        success: false,
        message: 'Handyman profile not found',
      });
    }

    const {
      skillCategories,
      experience,
      serviceDescription,
      basePrice,
      priceType,
      availability,
      location,
    } = req.body;

    if (skillCategories) handyman.skillCategories = skillCategories;
    if (experience !== undefined) handyman.experience = parseInt(experience);
    if (serviceDescription) handyman.serviceDescription = serviceDescription.trim();
    if (basePrice !== undefined) handyman.basePrice = parseFloat(basePrice);
    if (priceType) handyman.priceType = priceType;
    if (availability) handyman.availability = availability;
    if (location && location.coordinates) {
      handyman.location.coordinates = [location.coordinates[0], location.coordinates[1]];
      if (location.areaName) handyman.location.areaName = location.areaName;
      if (location.address) handyman.location.address = location.address;
    }

    await handyman.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      handyman,
    });
  } catch (error) {
    console.error('Update Handyman Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

/**
 * Search nearby handymen
 * Location-based search with filtering
 */
export const searchHandymen = async (req, res) => {
  try {
    const {
      category,
      latitude,
      longitude,
      maxDistance = 10, // Default 10km radius
      minRating = 0,
      maxPrice,
      sortBy = 'distance', // distance, rating, price
      locationName, // New parameter for text-based location search
    } = req.query;

    // Build query
    const query = { isActive: true };

    // 1. Geography-based search (if coordinates provided)
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const radius = parseFloat(maxDistance) * 1000; // Convert km to meters

      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat],
          },
          $maxDistance: radius,
        },
      };
    }
    // 2. Text-based location search (if no coordinates but locationName provided)
    else if (locationName) {
      const searchRegex = new RegExp(locationName, 'i');
      query['$or'] = [
        { 'location.areaName': searchRegex },
        { 'location.address': searchRegex },
        { 'location.city': searchRegex },
      ];
    }
    // 3. Fallback: Require either coordinates or locationName
    else {
      return res.status(400).json({
        success: false,
        message: 'Either location coordinates or location name is required',
      });
    }

    // Filter by category
    if (category) {
      query.skillCategories = category;
    }

    // Filter by rating
    if (minRating > 0) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Execute query
    // Execute query
    let handymen = await Handyman.find(query)
      .populate('userId', 'fullName phoneNumber profilePhoto')
      .limit(50);

    // Calculate distances and filter by price
    const handymenWithDistance = handymen
      .map((handyman) => {
        const [handymanLon, handymanLat] = handyman.location.coordinates;
        let distance = 0;

        // Only calculate distance if search coordinates were provided
        if (latitude && longitude) {
          const lat = parseFloat(latitude);
          const lon = parseFloat(longitude);
          distance = calculateDistance(lat, lon, handymanLat, handymanLon);
        }

        return {
          ...handyman.toObject(),
          distance: parseFloat(distance.toFixed(2)),
        };
      })
      .filter((h) => {
        // Filter by max price if provided (skip "in_agreement" pricing)
        if (maxPrice && h.priceType !== 'in_agreement' && h.basePrice > parseFloat(maxPrice)) {
          return false;
        }
        return true;
      });

    // Sort results
    if (sortBy === 'distance' && latitude && longitude) {
      handymenWithDistance.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'rating') {
      handymenWithDistance.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    } else if (sortBy === 'price') {
      // Sort by price: "in_agreement" comes last, then by basePrice
      handymenWithDistance.sort((a, b) => {
        if (a.priceType === 'in_agreement' && b.priceType !== 'in_agreement') return 1;
        if (a.priceType !== 'in_agreement' && b.priceType === 'in_agreement') return -1;
        if (a.priceType === 'in_agreement' && b.priceType === 'in_agreement') return 0;
        return (a.basePrice || 0) - (b.basePrice || 0);
      });
    }

    res.status(200).json({
      success: true,
      count: handymenWithDistance.length,
      handymen: handymenWithDistance,
    });
  } catch (error) {
    console.error('Search Handymen Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search handymen',
      error: error.message,
    });
  }
};

/**
 * Get handyman by ID (public profile)
 */
export const getHandymanById = async (req, res) => {
  try {
    const { id } = req.params;

    const handyman = await Handyman.findById(id)
      .populate('userId', 'fullName phoneNumber profilePhoto')
      .select('-availability'); // Hide availability details from public

    if (!handyman) {
      return res.status(404).json({
        success: false,
        message: 'Handyman not found',
      });
    }

    res.status(200).json({
      success: true,
      handyman,
    });
  } catch (error) {
    console.error('Get Handyman By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get handyman',
      error: error.message,
    });
  }
};

