import KeywordTracking from "../models/keywordTracking.js";
import { rankTracker } from "../services/keywordTrackingService.js";
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

    // Kick off async rank check (do not block the request)
    rankTracker(tracking.keyword, tracking.domain)
      .then((result) => {
        if (!result.success) return;
        // NOTE: updating DB from here is optional; avoid blocking boot.
        // A worker/service could be used instead.
      })
      .catch((e) => console.error("rank check trigger error:", e.message));
  } catch (error) {
    console.error("Add keyword error:", error.message);
    if (error.code === 11000)
      return res.status(400).json({
        success: false,
        message: "Already tracking this keyword",
      });
    res.status(500).json({ success: false, message: "server error"});
  }
};

// Get all tracked keywords for a user
export const getKeywords = async (req, res) => {
  try {
   const keywords = await KeywordTracking.find({userId: req.userId}).sort({createdAt: -1}).select("-rankHistory")
   res.json({success : true, keywords});
  } catch (err) {
   console.error ("Get Keyword error:",error.message);
   res.status(500).json({ success: false, message: "server error"});

  }
};

// Get single keyword with full history
export const getKeyword = async (req, res) => {
  try {
    const tracking = await KeywordTracking.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!tracking)
      return res.status(404).json({
        success: false,
        message: "Keyword tracking not found",
      });
    res.json({ success: true, tracking });
  } catch (err) {
   console.error ("Get Keyword error:",error.message);
   res.status(500).json({ success: false, message: "server error"});

  }
};

// Manually refresh a keyword ranking
export const refreshKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    // This controller triggers a refresh in background.
    // Route defined as /:id/refresh


    const tracking = await KeywordTracking.findOne({
      _id:req.params.id,
      userId: req.userId,
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Keyword tracking not found",
      });
    }

    tracking.status = "checking";
    await tracking.save();

    res.json({
      success: true,
      message: "Rank check started",
     
    });
  } catch (err) {
    console.error("Refresh keyword error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete a tracked keyword
export const deleteKeyword = async (req, res) => {
 try {
    // This controller only sets status; actual refresh should be done by a service/worker.
    const { keyword } = req.params;

    const tracking = await KeywordTracking.findOneAndDelete({
      _id:req.params.id,
      userId: req.userId,
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Keyword tracking not found",
      });
    }

   
    res.json({
      success: true,
      message: "Keyword tracking deleted",
     
    });
     
  } catch (err) {
    console.error("Delete Keyword Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// toggle tracking active/inactive
export const toggleTracking = async (req, res) => {
  try {
    // This controller only sets status; actual refresh should be done by a service/worker.
    const { keyword } = req.params;

    const tracking = await KeywordTracking.findOne({
      _id:req.params.id,
      userId: req.userId,
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Keyword tracking not found",
      });
    }

    // Toggle active flag
    tracking.active = !tracking.active;
    await tracking.save();


   
    res.json({
      success: true,
       tracking
     
    });
     
  } catch (err) {
    console.error("Toggle Tracking Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

