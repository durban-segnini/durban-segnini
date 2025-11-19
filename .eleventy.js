const fs = require('fs');
const path = require('path');

module.exports = function (eleventyConfig) {
  // Custom filter to sort by startingDate (newest to oldest)
  eleventyConfig.addFilter("sortByStartingDate", (collection, order = "desc") => {
    if (!Array.isArray(collection)) return collection;
    // Helper to safely parse date, fallback to -Infinity/Infinity for sorting
    function getValidTime(dateStr, fallback) {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? fallback : d.getTime();
    }
    return [...collection].sort((a, b) => {
      // For "desc", invalid dates go last; for "asc", invalid dates go first
      const fallback = order === "desc" ? -Infinity : Infinity;
      const timeA = getValidTime(a?.data?.startingDate, fallback);
      const timeB = getValidTime(b?.data?.startingDate, fallback);
      return order === "desc" ? timeB - timeA : timeA - timeB;
    });
  });
  // Copy assets from src/assets → /assets in _site
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets");

  // Add Decap CMS passthrough copy
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  // Artists collection: sorted alphabetically by artist name (case & accent insensitive)
  // This includes ALL artists (gallery and guest) for use in exhibitions and other contexts
  eleventyConfig.addCollection("artists", c =>
    c.getFilteredByGlob("src/content/artists/*.md").sort((a, b) => {
      const an = (a.data.name || '').trim();
      const bn = (b.data.name || '').trim();
      return an.localeCompare(bn, 'en', { sensitivity: 'base' });
    })
  );
  
  // Gallery artists collection: excludes guest artists (is_guest_artist !== true)
  // Used for the main artists listing page
  eleventyConfig.addCollection("galleryArtists", c =>
    c.getFilteredByGlob("src/content/artists/*.md")
      .filter(artist => !artist.data.is_guest_artist)
      .sort((a, b) => {
        const an = (a.data.name || '').trim();
        const bn = (b.data.name || '').trim();
        return an.localeCompare(bn, 'en', { sensitivity: 'base' });
      })
  );
  eleventyConfig.addCollection("works", c => c.getFilteredByGlob("src/content/works/*.md"));
  eleventyConfig.addCollection("exhibitions", c => c.getFilteredByGlob("src/content/exhibitions/*.md"));
  eleventyConfig.addCollection("artfairs", c => c.getFilteredByGlob("src/content/artfairs/*.md"));
  eleventyConfig.addCollection("news", c => c.getFilteredByGlob("src/content/news/*.md"));

  eleventyConfig.addFilter("filterWorksByTitles", (works, titles) => {
    const list = Array.isArray(works) ? works : [];
    const names = Array.isArray(titles) ? new Set(titles) : new Set();
    return list.filter(w => names.has(w?.data?.title));
  });

  eleventyConfig.addFilter("worksByArtist", (works, artistName) =>
    works.filter(w => (w.data.artist || "") === (artistName || ""))
  );

  eleventyConfig.addFilter("uniqueArtistNamesFromWorks", works => {
    const s = new Set();
    works.forEach(w => w.data.artist && s.add(w.data.artist));
    return [...s];
  });

  // Add where filter for filtering collections
  eleventyConfig.addFilter("where", (collection, property, value) => {
    return collection.filter(item => item.data[property] === value);
  });

  // Add sortByDate filter for sorting collections by date
  eleventyConfig.addFilter("sortByDate", (collection, order = "desc") => {
    return collection.sort((a, b) => {
      const dateA = new Date(a.data.date || a.date);
      const dateB = new Date(b.data.date || b.date);
      return order === "desc" ? dateB - dateA : dateA - dateB;
    });
  });

  // Add sortByYear filter for sorting collections by year (number field)
  eleventyConfig.addFilter("sortByYear", (collection, order = "desc") => {
    if (!Array.isArray(collection)) return collection;
    return [...collection].sort((a, b) => {
      const yearA = a.data?.year || 0;
      const yearB = b.data?.year || 0;
      return order === "desc" ? yearB - yearA : yearA - yearB;
    });
  });

  // Add date filter for formatting dates
  eleventyConfig.addFilter("date", (date, format) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    if (format === "MMM d, yyyy") {
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    return d.toLocaleDateString();
  });

  // Add first filter to get first character
  eleventyConfig.addFilter("first", (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0);
  });

  // Add upper filter to convert to uppercase
  eleventyConfig.addFilter("upper", (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.toUpperCase();
  });

  // Add year filter to extract year from date or return year directly
  eleventyConfig.addFilter("year", (item) => {
    if (!item) return '';
    if (typeof item === 'number') return item;
    if (typeof item === 'string') {
      const d = new Date(item);
      if (!isNaN(d.getTime())) return d.getFullYear();
      return item;
    }
    if (item.data && item.data.year) return item.data.year;
    return '';
  });

  // Add unique filter to get unique values
  eleventyConfig.addFilter("unique", (arr) => {
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr)].filter(item => item !== '');
  });

  // Add sort filter to sort arrays
  eleventyConfig.addFilter("sort", (arr) => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => a - b);
  });

  // Add reverse filter to reverse arrays
  eleventyConfig.addFilter("reverse", (arr) => {
    if (!Array.isArray(arr)) return [];
    return [...arr].reverse();
  });

  // Add concat filter to concatenate arrays
  eleventyConfig.addFilter("concat", (arr1, arr2) => {
    if (!Array.isArray(arr1)) arr1 = [];
    if (!Array.isArray(arr2)) arr2 = [];
    return [...arr1, ...arr2];
  });

  // Add truncate filter for text truncation
  eleventyConfig.addFilter("truncate", (str, length = 100) => {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + '...';
  });

  // Add map filter to transform arrays
  eleventyConfig.addFilter("map", (arr, property) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
      if (property && item.data && item.data[property] !== undefined) {
        return item.data[property];
      }
      if (property && item[property] !== undefined) {
        return item[property];
      }
      return item;
    });
  });

  // Add yearFromDate filter to extract year from date string or Date object
  eleventyConfig.addFilter("yearFromDate", (dateInput) => {
    if (!dateInput) return '';
    
    // If it's already a Date object
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return '';
      return dateInput.getFullYear().toString();
    }
    
    // If it's a string
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (!trimmed) return '';
      
      try {
        const date = new Date(trimmed);
        if (isNaN(date.getTime())) return '';
        return date.getFullYear().toString();
      } catch (error) {
        return '';
      }
    }
    
    return '';
  });

  // Add filter to add year property to exhibition/artfair objects for sorting
  eleventyConfig.addFilter("addYearProperty", (items) => {
    if (!Array.isArray(items)) return [];
    
    return items.map(item => {
      let year = 0;
      
      // For exhibitions, use startingDate
      if (item.data.startingDate) {
        year = new Date(item.data.startingDate).getFullYear();
      }
      // For art fairs, use the year field directly
      else if (item.data.year) {
        year = parseInt(item.data.year) || 0;
      }
      
      return {
        ...item,
        year: year
      };
    });
  });

  // Add filter to get artists from works referenced in exhibitions
  eleventyConfig.addFilter("getArtistsFromWorks", (exhibition, worksCollection) => {
    if (!exhibition || !exhibition.data || !Array.isArray(exhibition.data.works)) return [];

    const artists = new Set();

    // Works are referenced by work_id in exhibition frontmatter
    exhibition.data.works.forEach(workId => {
      const work = worksCollection.find(w => w?.data?.work_id === workId);
      if (work && work.data.artist) {
        artists.add(work.data.artist);
      }
    });

    return Array.from(artists);
  });

  // Add formatHumanDate filter for human-readable date formatting
  eleventyConfig.addFilter("formatHumanDate", (dateInput, locale = "en-US") => {
    if (!dateInput) return '';
    
    // If it's already a Date object
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return '';
      
      return dateInput.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // If it's a string
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (!trimmed) return '';
      
      try {
        // For YYYY-MM-DD format, create date in local timezone to avoid day shift
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          const [year, month, day] = trimmed.split('-').map(Number);
          const date = new Date(year, month - 1, day); // month is 0-indexed
          if (isNaN(date.getTime())) return '';
          
          return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } else {
          // For ISO strings, use the standard Date constructor
          const date = new Date(trimmed);
          if (isNaN(date.getTime())) return '';
          
          return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      } catch (error) {
        return '';
      }
    }
    
    return '';
  });

  // Add filter to extract artist names from art fair body markdown (one per line format)
  eleventyConfig.addFilter("getArtistsFromArtFairBody", (artfair) => {
    if (!artfair || !artfair.data) return [];
    
    try {
      // Read the file content directly
      const filePath = artfair.inputPath;
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Split by lines and filter out empty lines and frontmatter
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('---') && line.startsWith('- '));
      
      // Extract artist names by removing the "- " prefix
      return lines.map(line => line.substring(2).trim()).filter(name => name);
    } catch (error) {
      console.warn('Error reading art fair file:', error.message);
      return [];
    }
  });

  // Add filter to get linked artists from art fair body (with URLs to artist pages)
  eleventyConfig.addFilter("getLinkedArtistsFromArtFairBody", (artfair, collections) => {
    if (!artfair || !artfair.data || !collections || !collections.artists) return [];
    
    try {
      // Read the file content directly
      const filePath = artfair.inputPath;
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Split by lines and filter out empty lines and frontmatter
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('---') && line.startsWith('- '));
      
      // Extract artist names by removing the "- " prefix
      const artistNames = lines.map(line => line.substring(2).trim()).filter(name => name);
      
      // Match artist names to actual artist pages and return linked objects
      return artistNames.map(artistName => {
        // Find matching artist in collections
        const matchingArtist = collections.artists.find(artist => {
          const artistData = artist.data;
          // Try different name matching strategies
          return artistData.name === artistName || 
                 artistData.first_name + ' ' + artistData.last_name === artistName ||
                 artistData.last_name + ', ' + artistData.first_name === artistName ||
                 artistData.computed_slug === artistName.toLowerCase().replace(/\s+/g, '-');
        });
        
        if (matchingArtist) {
          return {
            name: artistName,
            url: matchingArtist.url,
            slug: matchingArtist.data.computed_slug || matchingArtist.fileSlug
          };
        } else {
          // Return unlinked version if no match found
          return {
            name: artistName,
            url: null,
            slug: null
          };
        }
      });
    } catch (error) {
      console.warn('Error reading art fair file for linked artists:', error.message);
      return [];
    }
  });

  // Add shortcode to extract artist names from art fair content
  eleventyConfig.addShortcode("getArtistsFromContent", function(content) {
    if (!content || typeof content !== 'string') return [];
    
    // Split by lines and filter out empty lines and frontmatter
    const lines = content.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('---') && line.startsWith('- '));
    
    // Extract artist names by removing the "- " prefix
    return lines.map(line => line.substring(2).trim()).filter(name => name);
  });

  // Add isActive filter to determine if a navigation link matches the current page
  eleventyConfig.addFilter("isActive", function(linkUrl, currentUrl) {
    if (!linkUrl || !currentUrl) return false;
    
    // Normalize URLs by removing trailing slashes and converting to lowercase
    const normalizedLink = linkUrl.replace(/\/$/, '').toLowerCase();
    const normalizedCurrent = currentUrl.replace(/\/$/, '').toLowerCase();
    
    // For exact matches
    if (normalizedLink === normalizedCurrent) return true;
    
    // For home page, check if current URL is exactly "/" or empty
    if (normalizedLink === '' || normalizedLink === '/') {
      return normalizedCurrent === '' || normalizedCurrent === '/';
    }
    
    // Handle .html extension case (e.g., /artists.html should match /artists/)
    if (normalizedCurrent.endsWith('.html')) {
      const currentWithoutExt = normalizedCurrent.replace('.html', '');
      if (normalizedLink === currentWithoutExt) return true;
    }
    
    // For section pages, check if current URL starts with the link URL
    // This handles cases like /artists/ matching /artists/some-artist/
    if (normalizedCurrent.startsWith(normalizedLink + '/')) return true;
    
    return false;
  });

  // Helper function to optimize Cloudinary URLs using URL API for robust parsing
  function optimizeCloudinaryUrl(url, options = {}) {
    if (!url || typeof url !== 'string') return url;
    
    try {
      // Use native URL API for robust parsing
      const urlObj = new URL(url);
      
      // Check if this is a Cloudinary URL by domain
      if (!urlObj.hostname.includes('cloudinary.com')) {
        return url; // Not a Cloudinary URL, return as-is
      }
      
      // Find the insertion point in the pathname
      // Cloudinary URLs have structure: /{cloud_name}/image/upload/{transformations}/{image_path}
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const uploadIndex = pathParts.findIndex((part, i) => 
        part === 'image' && pathParts[i + 1] === 'upload'
      );
      
      if (uploadIndex === -1) {
        // Doesn't match expected Cloudinary structure, return as-is
        return url;
      }
      
      // Extract everything before and after the upload segment
      const beforeUpload = pathParts.slice(0, uploadIndex + 2); // includes 'image' and 'upload'
      const afterUpload = pathParts.slice(uploadIndex + 2);
      
      // Remove existing transformations if present (they're typically the first segment after upload)
      // Transformations don't contain slashes, so we check if the first segment looks like transformations
      let imagePathParts = afterUpload;
      if (afterUpload.length > 0) {
        const firstSegment = afterUpload[0];
        // Transformations are comma-separated like "w_800,h_800,c_limit"
        // If it contains underscores and commas, it's likely transformations
        if (firstSegment.includes('_') && (firstSegment.includes(',') || firstSegment.match(/^[a-z]_/))) {
          imagePathParts = afterUpload.slice(1); // Skip the transformation segment
        }
      }
      
      // Default transformation options for optimal performance
      const defaultOptions = {
        fetch_format: 'auto',      // Auto-format (WebP when supported)
        quality: 'auto:good',       // Auto quality with good compression
        flags: 'progressive',       // Progressive JPEG loading
        ...options
      };
      
      // Build transformation string
      const transformations = [];
      
      // Width and height constraints
      if (defaultOptions.width) {
        transformations.push(`w_${defaultOptions.width}`);
      }
      if (defaultOptions.height) {
        transformations.push(`h_${defaultOptions.height}`);
      }
      if (defaultOptions.crop) {
        transformations.push(`c_${defaultOptions.crop}`);
      } else if (defaultOptions.width || defaultOptions.height) {
        // Default to limit crop if dimensions are specified
        transformations.push('c_limit');
      }
      
      // Quality
      if (defaultOptions.quality) {
        transformations.push(`q_${defaultOptions.quality}`);
      }
      
      // Format
      if (defaultOptions.fetch_format) {
        transformations.push(`f_${defaultOptions.fetch_format}`);
      }
      
      // Flags
      if (defaultOptions.flags) {
        transformations.push(`fl_${defaultOptions.flags}`);
      }
      
      // Reconstruct the pathname
      const transformationSegment = transformations.length > 0 
        ? transformations.join(',') 
        : '';
      
      const newPathParts = [
        ...beforeUpload,
        ...(transformationSegment ? [transformationSegment] : []),
        ...imagePathParts
      ];
      
      urlObj.pathname = '/' + newPathParts.join('/');
      
      return urlObj.toString();
      
    } catch (error) {
      // If URL parsing fails, return original URL
      console.warn('Failed to parse URL for optimization:', url, error);
      return url;
    }
  }

  // Add Cloudinary image optimization filter
  // Automatically applies transformations to Cloudinary URLs for optimal size and weight
  eleventyConfig.addFilter("cloudinary", (url, options = {}) => {
    return optimizeCloudinaryUrl(url, options);
  });

  // Add preset filters for common image sizes
  // Thumbnail: 400px max, optimized for small displays
  eleventyConfig.addFilter("cloudinaryThumb", (url) => {
    return optimizeCloudinaryUrl(url, {
      width: 400,
      height: 400,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive'
    });
  });

  // Medium: 800px max, optimized for medium displays
  eleventyConfig.addFilter("cloudinaryMedium", (url) => {
    return optimizeCloudinaryUrl(url, {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive'
    });
  });

  // Large: 1200px max, optimized for large displays
  eleventyConfig.addFilter("cloudinaryLarge", (url) => {
    return optimizeCloudinaryUrl(url, {
      width: 1200,
      height: 1200,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive'
    });
  });

  // Hero: 1920px max, optimized for hero images
  eleventyConfig.addFilter("cloudinaryHero", (url) => {
    return optimizeCloudinaryUrl(url, {
      width: 1920,
      height: 1920,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive'
    });
  });

  // Add CSS bundle support with simple minification (built into Eleventy v3+)
  eleventyConfig.addBundle("css", {
    transforms: [
      async function(content) {
        // Simple CSS minification - remove comments, extra whitespace, etc.
        return content
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
          .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
          .replace(/;\s*/g, ';') // Remove spaces after semicolons
          .replace(/\s*,\s*/g, ',') // Remove spaces around commas
          .replace(/\s*:\s*/g, ':') // Remove spaces around colons
          .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
          .trim(); // Remove leading/trailing whitespace
      }
    ]
  });

  return {
    // Set pathPrefix so the `url` filter can prepend a subpath (e.g., for GitHub Pages project sites)
    // Configure via environment variable ELEVENTY_PATH_PREFIX (e.g., "/durban-segnini-provisional/")
    // Defaults to "/" for root deployments
    pathPrefix: process.env.ELEVENTY_PATH_PREFIX || "/",
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "dist",
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};

