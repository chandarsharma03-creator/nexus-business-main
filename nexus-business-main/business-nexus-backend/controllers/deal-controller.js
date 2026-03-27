import { Deal } from "../models/deal-model.js";

// @desc    Get all deals for the logged-in investor
// @route   GET /api/deals
// @access  Private
export const getDeals = async (req, res) => {
  try {
    // Find deals and populate the startup's details from the User collection
    const deals = await Deal.find({ investorId: req.user._id })
      .populate('startupId', 'name startupName avatarUrl industry')
      .sort({ updatedAt: -1 });

    // Format the data to match the exact structure your React DealsPage expects
    const formattedDeals = deals.map(deal => ({
      _id: deal._id,
      startup: {
        name: deal.startupId?.startupName || deal.startupId?.name || 'Unknown Startup',
        logo: deal.startupId?.avatarUrl || '',
        industry: deal.startupId?.industry || 'Unspecified'
      },
      amount: deal.amount,
      equity: deal.equity,
      status: deal.status,
      stage: deal.stage,
      lastActivity: deal.updatedAt
    }));

    res.json(formattedDeals);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching deals', error: error.message });
  }
};

// @desc    Create a new deal tracking entry
// @route   POST /api/deals
// @access  Private
// backend/controllers/deal-controller.js
export const createDeal = async (req, res) => {
  try {
    const { startupId, amount, equity, status, stage } = req.body;
    
    if (!startupId || !amount || !equity) {
      return res.status(400).json({ message: 'Please provide startup, amount, and equity' });
    }

    const newDeal = await Deal.create({
      investorId: req.user._id,
      startupId,
      amount,
      equity,
      status,
      stage
    });

    // Populate startup info so the frontend can display it immediately
    const populatedDeal = await Deal.findById(newDeal._id).populate('startupId', 'name startupName avatarUrl industry');

    res.status(201).json({
      _id: populatedDeal._id,
      startup: {
        name: populatedDeal.startupId?.startupName || populatedDeal.startupId?.name,
        logo: populatedDeal.startupId?.avatarUrl,
        industry: populatedDeal.startupId?.industry
      },
      amount: populatedDeal.amount,
      equity: populatedDeal.equity,
      status: populatedDeal.status,
      stage: populatedDeal.stage,
      lastActivity: populatedDeal.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};