// app.js
// Copilot: Refactored to keep archive-year sections centered and allow switching back to all exhibitions.
document.querySelector('.hero-next')?.addEventListener('click', () => {
  alert('Next exhibition…');
});

// Archive page year filtering functionality
// Copilot: Now supports 'All' option and keeps alignment consistent.
document.addEventListener('DOMContentLoaded', function() {
  const yearLinks = document.querySelectorAll('.year-list a');
  const archiveSections = document.querySelectorAll('.archive-year');

  yearLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      // Remove active state from all links
      yearLinks.forEach(l => l.removeAttribute('aria-current'));
      // Add active state to clicked link
      this.setAttribute('aria-current', 'page');
      // Get the target year from the href
      const targetYear = this.getAttribute('href').replace('#', '');
      // Show all sections if 'All' is selected
      if (targetYear.toLowerCase() === 'all') {
        archiveSections.forEach(section => {
          section.style.display = '';
        });
      } else {
        archiveSections.forEach(section => {
          if (section.id === targetYear) {
            section.style.display = '';
            section.style.justifyContent = 'center';
          } else {
            section.style.display = 'none';
            section.style.justifyContent = 'center';
          }
        });
      }
    });
  });
});