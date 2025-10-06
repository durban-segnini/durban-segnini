// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const navbarSection = document.querySelector('.navbar-section');
  
  if (hamburgerMenu && navbarSection) {
    hamburgerMenu.addEventListener('click', function() {
      const isExpanded = hamburgerMenu.getAttribute('aria-expanded') === 'true';
      
      // Toggle aria-expanded attribute
      hamburgerMenu.setAttribute('aria-expanded', !isExpanded);
      navbarSection.setAttribute('aria-expanded', !isExpanded);
      
      // Prevent body scroll when menu is open
      if (!isExpanded) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Close menu when clicking on a link
    const menuLinks = navbarSection.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburgerMenu.setAttribute('aria-expanded', 'false');
        navbarSection.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!hamburgerMenu.contains(event.target) && !navbarSection.contains(event.target)) {
        hamburgerMenu.setAttribute('aria-expanded', 'false');
        navbarSection.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        hamburgerMenu.setAttribute('aria-expanded', 'false');
        navbarSection.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
});
