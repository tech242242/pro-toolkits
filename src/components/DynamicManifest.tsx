import { useEffect } from 'react';

interface Props {
  name: string;
  icon: string;
  username?: string;
}

export default function DynamicManifest({ name, icon, username }: Props) {
  useEffect(() => {
    if (!name || !icon) return;
    
    // Create a dynamic manifest reflecting the admin's identity
    const manifestName = username ? `@${username} | Tool Kit` : name;
    
    const manifest = {
      name: manifestName,
      short_name: username || name,
      description: `Official Tool Kit Space for ${username || name}`,
      start_url: window.location.pathname + window.location.search,
      display: "standalone",
      background_color: "#0A0F1E",
      theme_color: "#A855F7",
      icons: [
        {
          src: icon,
          sizes: "192x192",
          type: icon.includes('.png') ? 'image/png' : 'image/jpeg',
          purpose: "any maskable"
        },
        {
          src: icon,
          sizes: "512x512",
          type: icon.includes('.png') ? 'image/png' : 'image/jpeg',
          purpose: "any maskable"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = url;

    // Update document title for extra polish
    document.title = manifestName;

    // Update theme color meta tag
    let themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = manifest.theme_color;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [name, icon, username]);

  return null;
}
