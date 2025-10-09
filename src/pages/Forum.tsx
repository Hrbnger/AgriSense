import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, ThumbsUp, Clock, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    full_name: string;
  } | null;
}

const Forum = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // First get posts
    const { data: postsData, error: postsError } = await supabase
      .from("forum_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
      return;
    }

    // Then get profiles for those user_ids
    const userIds = [...new Set(postsData.map(post => post.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    // Merge the data
    const postsWithProfiles = postsData.map(post => ({
      ...post,
      profiles: profilesData?.find(p => p.user_id === post.user_id) || null
    }));

    setPosts(postsWithProfiles as any);
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("forum_posts").insert({
      user_id: user.id,
      title: newTitle,
      content: newContent,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      setNewTitle("");
      setNewContent("");
      fetchPosts();
    }
    setLoading(false);
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Community Forum
          </h1>
          <p className="text-muted-foreground text-lg">
            All things farming and agriculture
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        {/* Posts List */}
        <div className="space-y-4 mb-8">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No posts yet. Be the first to start a discussion!
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>by {post.profiles?.full_name || "Anonymous"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes_count || 0} Likes</span>
                    </button>
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments_count || 0} Comments</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Post Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Create New Post
            </CardTitle>
            <CardDescription>Share your farming questions or insights with the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Post title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-base"
              />
            </div>
            <div>
              <Textarea
                placeholder="What's on your mind? Share your thoughts, questions, or farming tips..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={handleCreatePost} 
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? "Posting..." : "Publish Post"}
            </Button>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center py-8 mt-12">
          <p className="text-muted-foreground text-lg">
            Join the conversation. Find a community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forum;
