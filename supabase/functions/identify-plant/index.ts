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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Extract base64 data from data URL
    const base64Data = imageData.split(',')[1];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
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
                  data: base64Data
                }
              }
            ]
          }
        ]
      }),
    });

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
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

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
