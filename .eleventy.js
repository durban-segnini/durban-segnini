const fs = require('fs');
const path = require('path');

module.exports = function (eleventyConfig) {
  // Copy assets from src/assets → /assets in _site
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets");

  // Add Decap CMS passthrough copy
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  eleventyConfig.addCollection("artists", c => c.getFilteredByGlob("src/content/artists/*.md"));
  eleventyConfig.addCollection("works", c => c.getFilteredByGlob("src/content/works/*.md"));
  eleventyConfig.addCollection("exhibitions", c => c.getFilteredByGlob("src/content/exhibitions/*.md"));
  eleventyConfig.addCollection("artfairs", c => c.getFilteredByGlob("src/content/artfairs/*.md"));

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

  // Add yearFromDate filter to extract year from date string
  eleventyConfig.addFilter("yearFromDate", (dateString) => {
    if (!dateString || typeof dateString !== 'string') return '';
    
    // Trim whitespace
    const trimmed = dateString.trim();
    if (!trimmed) return '';
    
    try {
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) return '';
      return date.getFullYear().toString();
    } catch (error) {
      return '';
    }
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
    if (!exhibition || !exhibition.data || !exhibition.data.works || !Array.isArray(exhibition.data.works)) return [];
    
    const artists = new Set();
    
    exhibition.data.works.forEach(workTitle => {
      const work = worksCollection.find(w => w.data.title === workTitle);
      if (work && work.data.artist) {
        artists.add(work.data.artist);
      }
    });
    
    return Array.from(artists);
  });

  // Add formatHumanDate filter for human-readable date formatting
  eleventyConfig.addFilter("formatHumanDate", (dateString, locale = "en-US") => {
    if (!dateString || typeof dateString !== 'string') return '';
    
    // Trim whitespace
    const trimmed = dateString.trim();
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

  return {
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

