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
    
    console.log("Test function called");
    console.log("API Key exists:", !!GEMINI_API_KEY);
    console.log("Image data length:", imageData?.length || 0);
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Simple test without image first
    const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "What is a mango? Answer in one sentence."
              }
            ]
          }
        ]
      }),
    });

    console.log("Test API response status:", testResponse.status);

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error("Test API error:", testResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `API test failed: ${testResponse.status} - ${errorText}`,
          apiKeyExists: !!GEMINI_API_KEY,
          apiKeyLength: GEMINI_API_KEY.length
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const testData = await testResponse.json();
    const testResult = testData.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(
      JSON.stringify({ 
        success: true,
        testResult: testResult,
        message: "Gemini API is working correctly"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Test function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
