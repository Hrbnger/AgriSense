import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    // Try different AI services in order of preference
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    let response;
    
    if (LOVABLE_API_KEY) {
      // Use Lovable AI (current setup)
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are an expert botanist with extensive knowledge of plant identification. Carefully analyze the provided plant image, examining leaf shape, color, texture, growth pattern, flowers, fruits, bark, and any distinctive features. Provide comprehensive identification with detailed botanical information. Return the response as JSON with fields: plantName (specific common name), scientificName (Latin binomial), plantType (e.g., succulent, flowering plant, fern, tree, shrub), family (botanical family), origin (native region), suitableEnvironment (detailed climate, light, temperature requirements), careInstructions (specific watering, soil, fertilizing, pruning needs), growthHabit (size, shape, growth pattern), floweringSeason (when it blooms), toxicity (if poisonous to humans/pets), uses (medicinal, culinary, ornamental), propagation (how to propagate), commonProblems (pests, diseases, issues), and confidence (0-100)."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Carefully examine this specific plant image. Analyze all visible characteristics: leaf shape, size, color, texture, arrangement, margins, veins, growth pattern, stem/bark appearance, flowers, fruits, and any distinctive features. Identify this exact plant species and provide comprehensive botanical information including its family, origin, growth habits, care requirements, flowering season, toxicity, uses, propagation methods, and common problems. Be specific and detailed - focus on what you actually observe in this image."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
        }),
      });
    } else if (OPENAI_API_KEY) {
      // Use OpenAI GPT-4 Vision
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "system",
              content: "You are an expert botanist with extensive knowledge of plant identification. Carefully analyze the provided plant image, examining leaf shape, color, texture, growth pattern, flowers, fruits, bark, and any distinctive features. Provide comprehensive identification with detailed botanical information. Return the response as JSON with fields: plantName (specific common name), scientificName (Latin binomial), plantType (e.g., succulent, flowering plant, fern, tree, shrub), family (botanical family), origin (native region), suitableEnvironment (detailed climate, light, temperature requirements), careInstructions (specific watering, soil, fertilizing, pruning needs), growthHabit (size, shape, growth pattern), floweringSeason (when it blooms), toxicity (if poisonous to humans/pets), uses (medicinal, culinary, ornamental), propagation (how to propagate), commonProblems (pests, diseases, issues), and confidence (0-100)."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Carefully examine this specific plant image. Analyze all visible characteristics: leaf shape, size, color, texture, arrangement, margins, veins, growth pattern, stem/bark appearance, flowers, fruits, and any distinctive features. Identify this exact plant species and provide comprehensive botanical information including its family, origin, growth habits, care requirements, flowering season, toxicity, uses, propagation methods, and common problems. Be specific and detailed - focus on what you actually observe in this image."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
        }),
      });
    } else if (GEMINI_API_KEY) {
      // Use Google Gemini
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "You are an expert botanist with extensive knowledge of plant identification. Carefully analyze the provided plant image, examining leaf shape, color, texture, growth pattern, flowers, fruits, bark, and any distinctive features. Provide comprehensive identification with detailed botanical information. Return the response as JSON with fields: plantName (specific common name), scientificName (Latin binomial), plantType (e.g., succulent, flowering plant, fern, tree, shrub), family (botanical family), origin (native region), suitableEnvironment (detailed climate, light, temperature requirements), careInstructions (specific watering, soil, fertilizing, pruning needs), growthHabit (size, shape, growth pattern), floweringSeason (when it blooms), toxicity (if poisonous to humans/pets), uses (medicinal, culinary, ornamental), propagation (how to propagate), commonProblems (pests, diseases, issues), and confidence (0-100)."
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageData.split(',')[1] // Remove data:image/jpeg;base64, prefix
                  }
                }
              ]
            }
          ]
        }),
      });
    } else {
      throw new Error("No AI API key configured. Please add LOVABLE_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY to your Supabase environment variables.");
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let aiResponse;
    
    if (LOVABLE_API_KEY || OPENAI_API_KEY) {
      aiResponse = data.choices?.[0]?.message?.content;
    } else if (GEMINI_API_KEY) {
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    // Parse JSON from AI response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if AI doesn't return proper JSON
        result = {
          plantName: "Unknown Plant",
          scientificName: "N/A",
          plantType: "Unable to identify",
          family: "Unknown",
          origin: "Unknown",
          suitableEnvironment: aiResponse,
          careInstructions: "Please consult a local botanist for accurate care instructions.",
          growthHabit: "Unknown",
          floweringSeason: "Unknown",
          toxicity: "Unknown",
          uses: "Unknown",
          propagation: "Unknown",
          commonProblems: "Unknown",
          confidence: 50
        };
      }
    } catch (parseError) {
      result = {
        plantName: "Identification Error",
        scientificName: "N/A",
        plantType: "Analysis incomplete",
        family: "Unknown",
        origin: "Unknown",
        suitableEnvironment: aiResponse || "Unable to analyze image",
        careInstructions: "Please try again with a clearer image.",
        growthHabit: "Unknown",
        floweringSeason: "Unknown",
        toxicity: "Unknown",
        uses: "Unknown",
        propagation: "Unknown",
        commonProblems: "Unknown",
        confidence: 0
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
