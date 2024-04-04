import { useEffect } from "react";
import { supabase } from "../shared/supabase/supabaseClient";

const SupabaseTest = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("*");

        if (error) {
          console.error("Error fetching data:", error);
        } else {
          console.log("Fetched data:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return <div>Supabase Test Component</div>;
};

export default SupabaseTest;
