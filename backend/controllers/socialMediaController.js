const { SocialMediaPost } = require('../database/models');

// Post to Twitter
exports.postToTwitter = async (req, res) => {
  try {
    const { content } = req.body;
    
    console.log('🐦 Twitter Post Request');
    
    // In production, integrate with Twitter API v2
    // const { TwitterApi } = require('twitter-api-v2');
    // const client = new TwitterApi({...});
    // const result = await client.v2.tweet(content);
    
    const mockResult = {
      id: `tweet_${Date.now()}`,
      text: content,
      created_at: new Date().toISOString()
    };
    
    // Save to database
    const post = await SocialMediaPost.create({
      platform: 'twitter',
      content,
      postIds: { twitter: mockResult.id },
      status: 'posted',
      postedAt: new Date()
    });
    
    console.log('✅ Posted to Twitter:', mockResult.id);
    
    res.json({
      success: true,
      message: 'Posted to Twitter successfully',
      post: mockResult,
      dbRecord: post
    });
  } catch (error) {
    console.error('❌ Twitter posting failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Post to Facebook
exports.postToFacebook = async (req, res) => {
  try {
    const { content } = req.body;
    
    console.log('📘 Facebook Post Request');
    
    // In production, integrate with Facebook Graph API
    // const FB = require('fb');
    // const result = await FB.api('me/feed', 'post', { message: content });
    
    const mockResult = {
      id: `fb_${Date.now()}`,
      message: content,
      created_time: new Date().toISOString()
    };
    
    // Save to database
    const post = await SocialMediaPost.create({
      platform: 'facebook',
      content,
      postIds: { facebook: mockResult.id },
      status: 'posted',
      postedAt: new Date()
    });
    
    console.log('✅ Posted to Facebook:', mockResult.id);
    
    res.json({
      success: true,
      message: 'Posted to Facebook successfully',
      post: mockResult,
      dbRecord: post
    });
  } catch (error) {
    console.error('❌ Facebook posting failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Post to all platforms
exports.postToAll = async (req, res) => {
  try {
    const { content, platforms } = req.body;
    
    console.log('🌐 Multi-platform Post Request:', platforms);
    
    const results = [];
    const postIds = {};
    
    if (platforms.includes('twitter')) {
      const twitterId = `tweet_${Date.now()}`;
      postIds.twitter = twitterId;
      results.push({
        platform: 'twitter',
        status: 'success',
        postId: twitterId
      });
    }
    
    if (platforms.includes('facebook')) {
      const facebookId = `fb_${Date.now()}`;
      postIds.facebook = facebookId;
      results.push({
        platform: 'facebook',
        status: 'success',
        postId: facebookId
      });
    }
    
    // Save to database
    const post = await SocialMediaPost.create({
      platform: 'both',
      content,
      postIds,
      status: 'posted',
      postedAt: new Date()
    });
    
    console.log('✅ Multi-platform posting complete:', results.length);
    
    res.json({
      success: true,
      message: `Posted to ${results.length} platforms`,
      results,
      dbRecord: post
    });
  } catch (error) {
    console.error('❌ Multi-platform posting failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalPosts = await SocialMediaPost.countDocuments();
    const twitterPosts = await SocialMediaPost.countDocuments({ 
      $or: [{ platform: 'twitter' }, { platform: 'both' }]
    });
    const facebookPosts = await SocialMediaPost.countDocuments({ 
      $or: [{ platform: 'facebook' }, { platform: 'both' }]
    });
    
    // Calculate aggregate engagement
    const posts = await SocialMediaPost.find();
    const totalEngagement = posts.reduce((sum, post) => {
      return sum + (post.engagement.likes || 0) + (post.engagement.shares || 0);
    }, 0);
    
    const analytics = {
      twitter: {
        followers: 1200,
        posts: twitterPosts,
        reach: 45000,
        engagement: 3.2
      },
      facebook: {
        followers: 8500,
        posts: facebookPosts,
        reach: 120000,
        engagement: 4.8
      },
      totalReach: 165000,
      totalFollowers: 9700,
      totalPosts,
      totalEngagement
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get recent posts
exports.getRecentPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const posts = await SocialMediaPost.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('postedBy', 'username email');
    
    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
