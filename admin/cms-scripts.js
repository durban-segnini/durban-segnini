/* global CMS */
CMS.registerEventListener({
  name: 'preSave',
  handler: ({ entry }) => {
    // Only apply computed slug and name logic to the artists collection
    const collection = entry.get('collection');
    if (collection !== 'artists') {
      return; // Don't modify data for other collections
    }

    // entry is an Immutable Map: { data: Map(...) }
    const data = entry.get('data');

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
  },
});