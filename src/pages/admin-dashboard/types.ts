export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  social_facebook?: string;
  social_youtube?: string;
  social_whatsapp?: string;
  social_github?: string;
  social_telegram?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_tiktok?: string;
  description?: string;
  phone_number?: string;
  popup_enabled?: boolean;
  popup_title?: string;
  popup_description?: string;
  popup_link?: string;
  popup_button_text?: string;
  popup_icon?: string;
  popup_border_style?: string;
  theme_profile_border?: boolean;
  theme_search_border?: boolean;
  theme_social_border?: boolean;
  theme_buttons_border?: boolean;
  theme_color_combo?: string;
  theme_font_family?: string;
  theme_text_color?: string;
  theme_username_color?: string;
  bg_color?: string;
  bg_image_url?: string;
  bg_gradient?: string;
}

export interface Tool {
  id: string;
  user_id: string;
  name: string;
  slug?: string;
  link_url: string;
  image_url: string;
  category: string;
  created_at: string;
  is_media?: boolean;
  is_locked?: boolean;
  password?: string;
  is_gated?: boolean;
  gate_url?: string;
  gate_text?: string;
  gate_icon?: string;
  video_urls?: string[];
}

export interface ShortLink {
  id: string;
  profile_id: string;
  slug: string;
  target_url: string;
  is_locked: boolean;
  password?: string;
  is_gated?: boolean;
  gated_social_url?: string;
  gated_description?: string;
  gated_button_text?: string;
  gated_icon?: string;
  created_at: string;
}

export interface Portfolio {
  id: string;
  profile_id: string;
  slug: string;
  title: string;
  description: string;
  main_image_url: string;
  gallery_urls: string[];
  theme_color: string;
  quote?: string;
  views_count: number;
  created_at: string;
  social_whatsapp?: string;
  social_instagram?: string;
  social_tiktok?: string;
  social_facebook?: string;
  whatsapp_greeting?: string;
}

export interface SimDatabase {
  id: string;
  profile_id: string;
  admin_username: string; // The URL slug will be mydomain.com/db/admin_username
  name: string;
  channel_link?: string;
  whatsapp_number?: string;
  theme_color: string;
  font_family: string;
  bg_image_url?: string;
  views_count: number;
  created_at: string;
}

export interface SmsBomber {
  id: string;
  profile_id: string;
  admin_username: string; // The URL slug will be mydomain.com/sb/admin_username
  name: string;
  channel_link?: string;
  whatsapp_number?: string;
  theme_color: string;
  created_at: string;
}
