import Fund from '../models/Fund.js';

export const getAllFunds = async (req, res) => {
  try {
    const funds = await Fund.find();
    res.json({ success: true, data: funds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFundById = async (req, res) => {
  try {
    const fund = await Fund.findById(req.params.id);
    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }
    res.json({ success: true, data: fund });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFund = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Fund name is required' });
    }

    const fund = new Fund({
      name,
      description,
    });

    await fund.save();
    res.status(201).json({ success: true, data: fund, message: 'Fund created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFund = async (req, res) => {
  try {
    const { name, description } = req.body;

    const fund = await Fund.findByIdAndUpdate(
      req.params.id,
      { name, description, updatedAt: new Date() },
      { new: true }
    );

    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }

    res.json({ success: true, data: fund, message: 'Fund updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFund = async (req, res) => {
  try {
    const fund = await Fund.findByIdAndDelete(req.params.id);

    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }

    res.json({ success: true, message: 'Fund deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
