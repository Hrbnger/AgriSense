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
            content: "You are an expert plant pathologist with years of experience diagnosing plant diseases. Carefully examine the provided plant image, looking for specific symptoms like discoloration, spots, wilting, lesions, mold, pest damage, or abnormal growth patterns. Provide accurate diagnosis based on the exact visual symptoms you observe. Return the response as JSON with fields: diseaseName (specific disease or condition name), severity (mild/moderate/severe based on visible damage), symptoms (detailed description of what you see), treatment (specific actionable steps), prevention (specific preventive measures), and confidence (0-100)."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Carefully examine this specific plant disease image. Look at the exact symptoms visible: type and color of spots or lesions, pattern of discoloration, extent of damage, affected plant parts, and any visible pests or fungal growth. Diagnose the specific disease or condition affecting this plant based on what you actually observe in this image. Provide detailed, specific treatment recommendations for this exact condition. Do not give generic responses - analyze the unique symptoms you see."
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
          diseaseName: "Unknown Condition",
          severity: "unknown",
          symptoms: aiResponse,
          treatment: "Please consult a local agricultural expert for accurate diagnosis and treatment.",
          prevention: "Maintain good plant hygiene and monitor regularly.",
          confidence: 50
        };
      }
    } catch (parseError) {
      result = {
        diseaseName: "Diagnosis Error",
        severity: "unknown",
        symptoms: aiResponse || "Unable to analyze image",
        treatment: "Please try again with a clearer image showing affected plant parts.",
        prevention: "N/A",
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
