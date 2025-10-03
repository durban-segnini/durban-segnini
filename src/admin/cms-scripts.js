/* global CMS */
CMS.registerEventListener({
  name: 'preSave',
  handler: ({ entry }) => {
    const collection = entry.get('collection');
    const data = entry.get('data');

    // Handle artists collection
    if (collection === 'artists') {
      // Read & normalize source fields
      const first = String(data.get('first_name') || '').trim();
      const last  = String(data.get('last_name')  || '').trim();

      // Build "abraham-jay"
      const slugify = (s) =>
        s
          .toLowerCase()
          .normalize('NFKD').replace(/[\u0300-\u036f]/g, '') // strip accents
          .replace(/[^a-z0-9]+/g, '-')                       // non-alnum -> dash
          .replace(/(^-|-$)/g, '');                          // trim dashes

      const computedSlug = [last, first].filter(Boolean).map(slugify).join('-');

      // Build "Last Name, First Name" format for the name field
      const computedName = [last, first].filter(Boolean).join(', ');

      // Return the UPDATED data map with your computed fields set
      return data
        .set('computed_slug', computedSlug)
        .set('name', computedName);
    }

    // Handle works collection
    if (collection === 'works') {
      const title = String(data.get('title') || '').trim();
      const artist = String(data.get('artist') || '').trim();
      const year = String(data.get('year') || '').trim();

      // Extract last name from artist (format: "Last Name, First Name")
      const artistLastName = artist.split(',')[0]?.trim() || 'unknown';
      
      // Create a slug-friendly version of the title
      const slugify = (s) =>
        s
          .toLowerCase()
          .normalize('NFKD').replace(/[\u0300-\u036f]/g, '') // strip accents
          .replace(/[^a-z0-9]+/g, '-')                       // non-alnum -> dash
          .replace(/(^-|-$)/g, '');                          // trim dashes

      // Generate 4-character random string for collision prevention
      const generateRandomSuffix = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      // Generate work_id based on artist last name and title
      let workId;
      if (title.toLowerCase() === 'untitled') {
        // For untitled works, use artist-lastname-untitled-YYYY
        workId = `${slugify(artistLastName)}-untitled-${year}`;
      } else {
        // For titled works, use artist-lastname-title-slug
        const titleSlug = slugify(title);
        workId = `${slugify(artistLastName)}-${titleSlug}`;
      }

      // Always append random suffix to guarantee uniqueness
      const randomSuffix = generateRandomSuffix();
      workId = `${workId}-${randomSuffix}`;

      // If work_id already exists and is different, keep the existing one (for updates)
      const existingWorkId = data.get('work_id');
      if (existingWorkId && existingWorkId !== workId) {
        // Keep existing work_id if it's different (for updates)
        return data;
      }

      return data.set('work_id', workId);
    }

    // Don't modify data for other collections
    return data;
  },
});