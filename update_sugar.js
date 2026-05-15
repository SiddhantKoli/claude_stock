const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://apsxzqiqtyolijwonltv.supabase.co";
const supabaseKey = "sb_publishable_jWfudEm-00pCBvwz-2qZbA_SykgHAkn";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data: items, error: fetchError } = await supabase
      .from("food_items")
      .select("*")
      .ilike("name", "%sugar%");

    if (fetchError) throw fetchError;
    console.log("Found sugar items:", items.length);
    
    for (const item of items) {
      const { data, error } = await supabase
        .from("food_items")
        .update({ image_url: "https://images.unsplash.com/photo-1622484211148-524c538185d9?w=640&h=420&fit=crop" })
        .eq("id", item.id)
        .select();
      if (error) throw error;
      console.log("Updated ID", item.id, ":", data[0].name);
    }
  } catch (err) {
    console.error("Failed:", err);
  }
}

run();
