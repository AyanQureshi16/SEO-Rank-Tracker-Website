import KeywordTracking from "../models/keywordTracking";
import {keyworTracking} from "../services/keywordTrackingService.js";
// Add a keyword to track
export const addKeywords = async (req, res) => {
  try {
    const { keyword, url } = req.body;

    if (!keyword || !url) {
      return res.status(400).json({
        success: false,
        message: "Keyword and URL are required",
      });
    }

    // Extract/normalize URL and domain
    let domain;
    let normalizedUrl;

    try {
      const urlString = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(urlString);
      domain = urlObj.hostname.replace(/^www\./i, "");
      normalizedUrl = urlString;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format",
      });
    }

    const normalizedKeyword = keyword.toLowerCase().trim();

    // Check if already tracking this keyword+domain
    const existing = await KeywordTracking.findOne({
      userId: req.userId,
      keyword: normalizedKeyword,
      domain,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already tracking this keyword for this domain",
      });
    }

    // Create tracking entry
    const tracking = await KeywordTracking.create({
      userId: req.userId,
      keyword: normalizedKeyword,
      url: normalizedUrl,
      domain,
      status: "checking",
    });
     res.status(201).json({
      success: true,
      message: "Keyword tracking started",
      tracking,
    });
    keywordTracking(tracking)
  
  } catch (error) {
  console.error("Add keyword error:", error.message);
  if (error.code === 11000) return res.staus(400).json({success:false, message:"Already tracking this keyword" });
  res.status(500).json({ success: false, message: "server error"});
  }
};

// Get all tracked keywords for a user
export const getKeywords = async (req, res) => {
  try {
   const keywords = await keywordTracking.find({userId: req.userId}).sort({createdAt: -1}).select("-rankHistory")
   res.json({success = true, keywords});
  } catch (err) {
   console.error ("Get Keyword error:",error.message);
   res.status(500).json({ success: false, message: "server error"});

  }
};

// Get single keyword with full history
export const getKeyword = async (req, res) => {
  try {
   const keywords = await keywordTracking.findOne({userId: req.params.id, userId: req.userId});
   if(!tracking) return res.status(404).json({ success : false, message: "Keyword tracking not found"});
   res.json({success = true, tracking});
  } catch (err) {
   console.error ("Get Keyword error:",error.message);
   res.status(500).json({ success: false, message: "server error"});

  }
};

// Manually refresh a keyword ranking
export const refreshKeyword = async (req, res) => {
  try {
    // This controller only sets status; actual refresh should be done by a service/worker.
    const { keyword } = req.params;

    const item = await KeywordTracking.findOne({
      userId: req.userId,
      keyword: keyword?.toLowerCase?.().trim?.(),
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Keyword tracking not found",
      });
    }

    item.status = "checking";
    item.lastChecked = new Date();
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Keyword refresh queued",
      keywordTracking: item,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to refresh keyword",
    });
  }
};

// Delete a tracked keyword
export const deleteKeyword = async (req, res) => {
  try {
    const { keyword } = req.params;

    const deleted = await KeywordTracking.findOneAndDelete({
      userId: req.userId,
      keyword: keyword?.toLowerCase?.().trim?.(),
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Keyword tracking not found",
      });
    }

    return res.status(200).json({ success: true, message: "Keyword tracking deleted" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to delete keyword",
    });
  }
};

// toggle tracking active/inactive
export const toggleTracking = async (req, res) => {
  try {
    const { keyword } = req.params;
    const { active } = req.body;

    const item = await KeywordTracking.findOne({
      userId: req.userId,
      keyword: keyword?.toLowerCase?.().trim?.(),
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Keyword tracking not found",
      });
    }

    item.active = typeof active === "boolean" ? active : !item.active;
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Tracking updated",
      keywordTracking: item,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to toggle tracking",
    });
  }
};

