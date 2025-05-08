// Extract the first image from markdown content
export function getThumbnail(title: string, content: string): { src: string | null, alt: string } {
  // Default values in case of any issues
  const defaultAlt = title || "Post thumbnail";
  
  // Helper function to extract markdown image
  function extractFirstMarkdownImage(text: string): { src: string, alt: string } | null {
    if (!text) return null;
    
    // Look for markdown image syntax
    const markdownMatch = text.match(/!\[(.*?)\]\((.*?)\)/);
    if (markdownMatch && markdownMatch[2]) {
      return {
        src: markdownMatch[2],
        alt: markdownMatch[1] || defaultAlt
      };
    }

    // Look for HTML image tag
    const htmlMatch = text.match(/<img.*?src=["'](.*?)["'].*?(?:alt=["'](.*?)["'])?.*?>/i);
    if (htmlMatch && htmlMatch[1]) {
      return {
        src: htmlMatch[1],
        alt: htmlMatch[2] || defaultAlt
      };
    }

    return null;
  }

  // Try to extract an image from the content
  const extractedImage = extractFirstMarkdownImage(content);
  
  if (extractedImage && extractedImage.src) {
    return {
      src: extractedImage.src,
      alt: extractedImage.alt || defaultAlt
    };
  } else {
    // If no image found, return null for src
    return {
      src: null,
      alt: defaultAlt
    };
  }
}
