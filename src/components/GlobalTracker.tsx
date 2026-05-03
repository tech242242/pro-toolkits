import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Simple function to get/create a unique visitor ID
function getGlobalVisitorId() {
  let vid = localStorage.getItem('global_visitor_id');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('global_visitor_id', vid);
  }
  return vid;
}

export default function GlobalTracker() {
  const location = useLocation();

  useEffect(() => {
    // We don't want to track hidden admin paths
    if (location.pathname.includes('/saqibadmin') || location.pathname.includes('/super-saqib-admin')) return;

    const trackPageView = async () => {
      const visitorHash = getGlobalVisitorId();
      
      let batteryLevel = "unknown";
      let isCharging = "unknown";
      try {
        if ((navigator as any).getBattery) {
          const battery: any = await (navigator as any).getBattery();
          batteryLevel = Math.round(battery.level * 100) + "%";
          isCharging = battery.charging ? "Yes" : "No";
        }
      } catch(e) {}

      let ipAddress = "unknown";
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        ipAddress = data.ip;
      } catch(e) {}

      const metadata = {
        path: location.pathname,
        battery_level: batteryLevel,
        is_charging: isCharging,
        ip_address: ipAddress,
        browser_info: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        platform: navigator.platform || "unknown",
        language: navigator.language || "unknown",
        visitor_id: visitorHash
      };

      try {
        // Log to a global table (we will create this table via SQL or repurpose an existing one)
        // Since we don't have a guaranteed global analytics table, we'll try to insert into global_analytics
        // We'll provide the SQL for the user to run
        await supabase.from('global_analytics').insert({
          event_type: 'page_view',
          path: location.pathname,
          metadata
        });
      } catch (err) {
        console.error("Global tracking failed", err);
      }
    };

    trackPageView();
  }, [location.pathname]);

  return null;
}
