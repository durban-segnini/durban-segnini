module.exports = function (eleventyConfig) {
  // Copy assets from src/assets → /assets in _site
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets");

  // Add Decap CMS passthrough copy
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

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

