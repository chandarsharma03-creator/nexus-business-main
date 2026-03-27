import CollaborationRequest from '../models/CollaborationRequest.js'; // Ensure you created this model earlier

// @desc    Get all collaboration requests sent TO the logged-in entrepreneur
// @route   GET /api/requests/entrepreneur
// @access  Private
export const getEntrepreneurRequests = async (req, res) => {
  try {
    // Find requests where this user is the entrepreneur
    const requests = await CollaborationRequest.find({ entrepreneurId: req.user._id })
      .populate('investorId', 'name avatarUrl company') // Attach investor details
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching requests', error: error.message });
  }
};

// @desc    Get all collaboration requests sent BY the logged-in investor
// @route   GET /api/requests/investor
// @access  Private
export const getInvestorRequests = async (req, res) => {
  try {
    // Find requests where this user is the investor
    const requests = await CollaborationRequest.find({ investorId: req.user._id })
      .populate('entrepreneurId', 'name avatarUrl startupName industry') // Attach startup details
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching requests', error: error.message });
  }
};

// @desc    Update request status (Accept/Reject)
// @route   PUT /api/requests/:id/status
// @access  Private
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await CollaborationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Security check: Only the entrepreneur who received the request can accept/reject it
    if (request.entrepreneurId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this request' });
    }

    request.status = status;
    const updatedRequest = await request.save();

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating status', error: error.message });
  }
};

// @desc    Create a new collaboration request
// @route   POST /api/requests
// @access  Private (Ideally only Investors)
export const createRequest = async (req, res) => {
  try {
    const { entrepreneurId, message } = req.body;

    // Optional: Check if a request already exists between these two to prevent spam
    const existingRequest = await CollaborationRequest.findOne({
      investorId: req.user._id,
      entrepreneurId
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already sent a request to this startup.' });
    }

    const newRequest = await CollaborationRequest.create({
      investorId: req.user._id,
      entrepreneurId,
      message,
      status: 'pending'
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating request', error: error.message });
  }
};