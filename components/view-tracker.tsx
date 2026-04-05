"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface ViewTrackerProps {
  type: "series" | "chapter";
  id: string;
}

export default function ViewTracker({ type, id }: ViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Prevent double invocation in React StrictMode
    if (trackedRef.current) return;
    trackedRef.current = true;

    async function trackView() {
      const supabase = createClient();
      
      if (type === "series") {
        await supabase.rpc('increment_series_views', { series_id_param: id });
      } else if (type === "chapter") {
        await supabase.rpc('increment_chapter_views', { chapter_id_param: id });
      }
    }

    trackView();
  }, [type, id]);

  return null;
}
