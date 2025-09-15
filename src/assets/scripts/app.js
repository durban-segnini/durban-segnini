// app.js
document.querySelector('.hero-next')?.addEventListener('click', () => {
  alert('Next exhibition…');
});

// Archive page year filtering functionality
document.addEventListener('DOMContentLoaded', function() {
  const yearLinks = document.querySelectorAll('.year-list a');
  const exhibitionCards = document.querySelectorAll('.exhibition-grid .card');

  // Add click event listeners to year navigation links
  yearLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active state from all links
      yearLinks.forEach(l => l.removeAttribute('aria-current'));
      
      // Add active state to clicked link
      this.setAttribute('aria-current', 'page');
      
      // Get the target year from the href
      const targetYear = this.getAttribute('href').replace('#', '');
      
      // Filter exhibitions based on selected year
      filterExhibitionsByYear(targetYear);
    });
  });

  function filterExhibitionsByYear(year) {
    exhibitionCards.forEach(card => {
      const cardYear = card.getAttribute('data-year');
      
      if (year === 'All' || cardYear === year) {
        // Show the card
        card.classList.remove('hidden');
      } else {
        // Hide the card
        card.classList.add('hidden');
      }
    });
  }
});