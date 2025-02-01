import React from 'react';
import DOMPurify from 'dompurify';

const RichTextRenderer = ({ content }) => {
  // Configure DOMPurify to allow certain tags and attributes
  const sanitizeConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'h1', 'h2', 'ul', 'ol', 'li', 
      'img', 'a', 'blockquote', 'code'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'style', 'alt', 'class', 'target'
    ]
  };

  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content, sanitizeConfig);

  return (
    <div 
      className="rich-text-content text-gray-300"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default RichTextRenderer;