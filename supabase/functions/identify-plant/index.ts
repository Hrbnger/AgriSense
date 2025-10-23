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

    console.log("Making Gemini API call...");
    console.log("API Key exists:", !!GEMINI_API_KEY);
    console.log("Base64 data length:", base64Data.length);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "You are an expert botanist. Analyze this plant image and return ONLY a JSON object with these exact fields: plantName, scientificName, plantType, family, origin, suitableEnvironment, careInstructions, growthHabit, floweringSeason, toxicity, uses, propagation, commonProblems, confidence (0-100). Be specific and detailed."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        }
      }),
    });

    console.log("Gemini API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 400) {
        return new Response(
          JSON.stringify({ error: `Bad request: ${errorText}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ error: "API key invalid or insufficient permissions" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `AI service error: ${response.status} - ${errorText}` }),
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
