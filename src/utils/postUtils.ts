import { getCollection } from 'astro:content';
import { getThumbnail } from './getThumbnail';

// Define the post type with content
export interface PostWithContent {
  slug: string;
  title: string;
  description?: string;
  dateCreated?: Date;
  dateUpdated?: Date;
  type: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  content: string;
  featured?: boolean;
  link?: string;
};

// Get posts with content for thumbnail generation
export async function getPostsWithContent(): Promise<PostWithContent[]> {
  const postsCollection = await getCollection("posts");
  
  return postsCollection.map((entry) => {
    // For games, use the thumbnail.png file from the game directory
    let thumbnailSrc = null;
    let thumbnailAlt = entry.data.title;
    
    // Handle different post types
    if (entry.data.type === "game") {
      // For games, use the thumbnail.png from the game directory
      thumbnailSrc = `/games/${entry.slug}/thumbnail.png`;
    } else if (entry.data.thumbnailSrc) {
      // If thumbnail is specified in frontmatter, use it
      thumbnailSrc = entry.data.thumbnailSrc;
    } else {
      // Otherwise try to extract from content
      const extractedThumb = getThumbnail(entry.data.title, entry.body);
      thumbnailSrc = extractedThumb.src;
      thumbnailAlt = extractedThumb.alt;
    }
    
    return {
      slug: entry.slug,
      title: entry.data.title,
      description: entry.data.description,
      dateCreated: entry.data.dateCreated,
      dateUpdated: entry.data.dateUpdated,
      type: entry.data.type,
      thumbnailSrc: thumbnailSrc,
      thumbnailAlt: thumbnailAlt,
      content: entry.body,
      featured: entry.data.featured || false,
      link: entry.data.link,
    };
  });
}
