import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ForumCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  postCount: number;
  lastActivity?: string;
}

const Forum = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchForumStats();
  }, []);

  const fetchForumStats = async () => {
    // Fetch total post count for general discussions
    const { count } = await supabase
      .from("forum_posts")
      .select("*", { count: "exact", head: true });

    // Fetch latest post for last activity
    const { data: latestPost } = await supabase
      .from("forum_posts")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Define forum categories
    const categoryData: ForumCategory[] = [
      {
        id: "general",
        title: "General Discussions",
        description: "All things farming and agriculture",
        icon: MessageSquare,
        postCount: count || 0,
        lastActivity: latestPost?.created_at,
      },
      {
        id: "crop-advice",
        title: "Crop Advice",
        description: "Get help with crop management and cultivation",
        icon: MessageSquare,
        postCount: 0,
        lastActivity: undefined,
      },
      {
        id: "equipment",
        title: "Equipment & Tools",
        description: "Discuss farming equipment and tools",
        icon: MessageSquare,
        postCount: 0,
        lastActivity: undefined,
      },
      {
        id: "market-prices",
        title: "Market & Prices",
        description: "Share market insights and price discussions",
        icon: MessageSquare,
        postCount: 0,
        lastActivity: undefined,
      },
      {
        id: "pest-management",
        title: "Pest Management",
        description: "Solutions for pest and disease control",
        icon: MessageSquare,
        postCount: 0,
        lastActivity: undefined,
      },
      {
        id: "success-stories",
        title: "Success Stories",
        description: "Share your farming achievements and learnings",
        icon: MessageSquare,
        postCount: 0,
        lastActivity: undefined,
      },
    ];

    setCategories(categoryData);
  };

  const filteredCategories = categories.filter((category) =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6">
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
        <div className="max-w-2xl mx-auto mb-12">
          <Input
            placeholder="Search the community..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate("/dashboard")}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-primary mb-1">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {category.postCount}
                  </span>
                  {category.lastActivity && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(category.lastActivity), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Join the conversation. Find a community.
          </h2>
          <p className="text-muted-foreground mb-6">
            Connect with farmers and share your knowledge
          </p>
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Start a Discussion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forum;
