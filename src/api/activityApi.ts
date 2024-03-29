// src/api/activityApi.ts

import { supabase } from "../utils/supabaseClient";

export const getUserActivity = async () => {
  try {
    let { data: activities, error } = await supabase
      .from("activities")
      .select("*");

    if (error) throw error;

    return activities || [];
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return [];
  }
};
