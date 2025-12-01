import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Twitter, Facebook, Share2, Calendar, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { socialMediaService } from '@/services/apiService';

interface SocialPost {
  id: string;
  platform: 'twitter' | 'facebook';
  content: string;
  timestamp: Date;
  likes: number;
  shares: number;
  status: 'posted' | 'scheduled' | 'failed';
}

const SocialMediaIntegration = () => {
  const { t } = useLanguage();
  
  const [postContent, setPostContent] = useState('');
  const [recentPosts, setRecentPosts] = useState<SocialPost[]>([
    {
      id: '1',
      platform: 'twitter',
      content: '🚨 Dam Water Level Update: Currently at 85%. All systems operational. #DamSafety #Monitoring',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 45,
      shares: 12,
      status: 'posted'
    },
    {
      id: '2',
      platform: 'facebook',
      content: '✅ Weekly Safety Report: All dam parameters within safe limits. Structural integrity: 98%. Thank you for your continued trust.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      likes: 230,
      shares: 67,
      status: 'posted'
    }
  ]);

  const [twitterConnected, setTwitterConnected] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);

  const postToTwitter = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter content to post');
      return;
    }

    if (!twitterConnected) {
      toast.error('Twitter account not connected');
      return;
    }

    try {
      const result = await socialMediaService.postToTwitter(postContent);

      const newPost: SocialPost = {
        id: result.post.id,
        platform: 'twitter',
        content: postContent,
        timestamp: new Date(),
        likes: 0,
        shares: 0,
        status: 'posted'
      };

      setRecentPosts([newPost, ...recentPosts]);
      toast.success('Posted to Twitter successfully!');
      setPostContent('');
    } catch (error: any) {
      console.error('Twitter Error:', error);
      toast.error(error.response?.data?.error || 'Failed to post to Twitter');
    }
  };

  const postToFacebook = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter content to post');
      return;
    }

    if (!facebookConnected) {
      toast.error('Facebook page not connected');
      return;
    }

    try {
      const result = await socialMediaService.postToFacebook(postContent);

      const newPost: SocialPost = {
        id: result.post.id,
        platform: 'facebook',
        content: postContent,
        timestamp: new Date(),
        likes: 0,
        shares: 0,
        status: 'posted'
      };

      setRecentPosts([newPost, ...recentPosts]);
      toast.success('Posted to Facebook successfully!');
      setPostContent('');
    } catch (error: any) {
      console.error('Facebook Error:', error);
      toast.error(error.response?.data?.error || 'Failed to post to Facebook');
    }
  };

  const postToAll = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter content to post');
      return;
    }

    if (!twitterConnected && !facebookConnected) {
      toast.error('No social media accounts connected');
      return;
    }

    try {
      const platforms = [];
      if (twitterConnected) platforms.push('twitter');
      if (facebookConnected) platforms.push('facebook');
      
      const result = await socialMediaService.postToAll(postContent, platforms);
      
      // Add posts to recent posts
      result.results.forEach((r: any) => {
        const newPost: SocialPost = {
          id: r.postId,
          platform: r.platform as 'twitter' | 'facebook',
          content: postContent,
          timestamp: new Date(),
          likes: 0,
          shares: 0,
          status: 'posted'
        };
        setRecentPosts(prev => [newPost, ...prev]);
      });

      toast.success(result.message || 'Posted to all connected platforms!');
      setPostContent('');
    } catch (error: any) {
      console.error('Multi-platform Error:', error);
      toast.error(error.response?.data?.error || 'Failed to post to some platforms');
    }
  };

  const connectTwitter = () => {
    // In production, redirect to Twitter OAuth
    toast.success('Twitter account connected!');
    setTwitterConnected(true);
  };

  const connectFacebook = () => {
    // In production, redirect to Facebook OAuth
    toast.success('Facebook page connected!');
    setFacebookConnected(true);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Social Media Integration</h1>
        <p className="text-muted-foreground">Auto-post dam updates to Twitter & Facebook</p>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Twitter className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold">Twitter</h3>
                <p className="text-sm text-muted-foreground">
                  {twitterConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              onClick={connectTwitter}
              variant={twitterConnected ? 'outline' : 'default'}
              size="sm"
              disabled={twitterConnected}
            >
              {twitterConnected ? 'Connected ✓' : 'Connect'}
            </Button>
          </div>
          {twitterConnected && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">1.2K</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">234</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">45K</div>
                <div className="text-xs text-muted-foreground">Reach</div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Facebook className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-bold">Facebook</h3>
                <p className="text-sm text-muted-foreground">
                  {facebookConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              onClick={connectFacebook}
              variant={facebookConnected ? 'outline' : 'default'}
              size="sm"
              disabled={facebookConnected}
            >
              {facebookConnected ? 'Connected ✓' : 'Connect'}
            </Button>
          </div>
          {facebookConnected && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">8.5K</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">120K</div>
                <div className="text-xs text-muted-foreground">Reach</div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Post Composer */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-bold mb-4">✍️ Create Post</h2>
        
        <div className="space-y-4">
          <Textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share dam safety updates with the public...&#10;&#10;Example:&#10;🚨 Dam Status Update&#10;Water Level: 85%&#10;Structural Integrity: 98%&#10;All systems operational ✅&#10;&#10;#DamSafety #PublicSafety #Infrastructure"
            className="min-h-[150px]"
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {postContent.length} characters
            </span>
            <div className="flex gap-2">
              <Button
                onClick={postToTwitter}
                disabled={!twitterConnected}
                className="gap-2 bg-blue-400 hover:bg-blue-500"
              >
                <Twitter className="w-4 h-4" />
                Tweet
              </Button>
              <Button
                onClick={postToFacebook}
                disabled={!facebookConnected}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Facebook className="w-4 h-4" />
                Post to Facebook
              </Button>
              <Button onClick={postToAll} className="gap-2" variant="default">
                <Share2 className="w-4 h-4" />
                Post to All
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Templates */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-bold mb-4">📝 Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            onClick={() => setPostContent('🚨 Dam Status Update\nWater Level: 85%\nStructural Integrity: 98%\nAll systems operational ✅\n\n#DamSafety #Monitoring')}
            variant="outline"
            className="justify-start h-auto py-3 px-4"
          >
            <div className="text-left">
              <div className="font-semibold">Status Update</div>
              <div className="text-xs text-muted-foreground">Regular safety update</div>
            </div>
          </Button>

          <Button
            onClick={() => setPostContent('⚠️ HIGH ALERT\nWater level rising due to heavy rainfall.\nAuthorities are monitoring 24/7.\nPublic advised to stay informed.\n\n#DamAlert #Safety')}
            variant="outline"
            className="justify-start h-auto py-3 px-4"
          >
            <div className="text-left">
              <div className="font-semibold">High Alert</div>
              <div className="text-xs text-muted-foreground">Warning message</div>
            </div>
          </Button>

          <Button
            onClick={() => setPostContent('✅ All Clear\nDam operations normal.\nNo safety concerns.\nThank you for your continued trust.\n\n#DamSafety #AllClear')}
            variant="outline"
            className="justify-start h-auto py-3 px-4"
          >
            <div className="text-left">
              <div className="font-semibold">All Clear</div>
              <div className="text-xs text-muted-foreground">Safety confirmation</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Posts */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-bold mb-4">📊 Recent Posts</h2>
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <div key={post.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-start gap-3">
                {post.platform === 'twitter' ? (
                  <Twitter className="w-5 h-5 text-blue-400 mt-1" />
                ) : (
                  <Facebook className="w-5 h-5 text-blue-600 mt-1" />
                )}
                <div className="flex-1">
                  <p className="text-sm mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatTimeAgo(post.timestamp)}</span>
                    <span className="flex items-center gap-1">
                      ❤️ {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      🔄 {post.shares}
                    </span>
                    <span className={`ml-auto px-2 py-1 rounded text-xs ${
                      post.status === 'posted' ? 'bg-green-500/20 text-green-600' :
                      post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-600' :
                      'bg-red-500/20 text-red-600'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">165K</div>
              <div className="text-sm text-muted-foreground">Total Reach</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">9.7K</div>
              <div className="text-sm text-muted-foreground">Total Followers</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <Share2 className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">390</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SocialMediaIntegration;
