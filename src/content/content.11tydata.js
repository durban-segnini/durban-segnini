module.exports = {
    eleventyComputed: {
      permalink: data => {
        // page.filePathStem is like "/content/artists/artist-name"
        const stem = data.page.filePathStem.replace(/^\/content/, "");
        // ensures folder-style URLs → index.html
        return `${stem}/`;
      }
    }
  };