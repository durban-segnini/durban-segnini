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

