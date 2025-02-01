import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github, 
  Youtube, 
  Globe 
} from 'lucide-react';

// Define a mapping of social media platforms to their respective icons
const SOCIAL_ICONS = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  youtube: Youtube,
  website: Globe
};

const SocialMediaIcons = ({ socialLinks }) => {
  // Filter out social links that are null, undefined, or empty string
  const filteredSocialLinks = Object.entries(socialLinks || {})
    .filter(([_, link]) => link && link.trim() !== '');

  // If no social links are available, return null
  if (filteredSocialLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex space-x-4 items-center">
      {filteredSocialLinks.map(([platform, link]) => {
        // Get the corresponding icon, default to Globe if not found
        const IconComponent = SOCIAL_ICONS[platform.toLowerCase()] || Globe;
        
        return (
          <a
            key={platform}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition-colors duration-200"
          >
            <IconComponent className="w-6 h-6" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialMediaIcons;

// Example of how to use the component with GraphQL data
const UserProfile = ({ userData }) => {
  return (
    <div>
      <h1>{userData.name}</h1>
      {/* Only render social icons if they exist */}
      <SocialMediaIcons socialLinks={userData.socialLinks} />
    </div>
  );
};