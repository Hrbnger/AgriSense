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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are an expert botanist with extensive knowledge of plant identification. Carefully analyze the provided plant image, examining leaf shape, color, texture, growth pattern, and any visible flowers or fruits. Provide specific, accurate identification based on the unique visual characteristics you observe. Return the response as JSON with fields: plantName (specific common name), scientificName (Latin binomial), plantType (e.g., succulent, flowering plant, fern, tree), suitableEnvironment (detailed climate and light requirements), careInstructions (specific watering, soil, and maintenance needs), and confidence (0-100)."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Carefully examine this specific plant image. Look at the unique characteristics: leaf shape, color, patterns, texture, size, growth habit, and any visible flowers, fruits, or distinctive features. Identify this exact plant species and provide detailed, specific information about this particular plant. Do not give generic information - focus on what you actually see in this image."
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
    const aiResponse = data.choices?.[0]?.message?.content;

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
          suitableEnvironment: aiResponse,
          careInstructions: "Please consult a local botanist for accurate care instructions.",
          confidence: 50
        };
      }
    } catch (parseError) {
      result = {
        plantName: "Identification Error",
        scientificName: "N/A",
        plantType: "Analysis incomplete",
        suitableEnvironment: aiResponse || "Unable to analyze image",
        careInstructions: "Please try again with a clearer image.",
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
