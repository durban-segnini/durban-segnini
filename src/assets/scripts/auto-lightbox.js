/**
 * Auto Lightbox Setup
 * Automatically adds lightbox functionality to all images on the site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for lightbox to be loaded
    if (typeof lightbox === 'undefined') {
        console.warn('Lightbox2 not loaded yet, retrying...');
        setTimeout(initAutoLightbox, 100);
        return;
    }
    
    // Set the image path before initializing
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'imagePath': '/assets/images/lightbox/'
        });
    }
    
    initAutoLightbox();
});

function initAutoLightbox() {
    // Handle carousel images specially - create individual lightbox links for each carousel image
    const carousels = document.querySelectorAll('.hero-carousel');
    carousels.forEach(carousel => {
        const carouselImages = carousel.querySelectorAll('.carousel-image');
        
        // Create individual lightbox links for each carousel image
        carouselImages.forEach((img, index) => {
            // Create a lightbox link for this specific image
            const lightboxLink = document.createElement('a');
            lightboxLink.href = img.src;
            lightboxLink.setAttribute('data-lightbox', 'carousel-gallery');
            lightboxLink.setAttribute('data-title', img.alt || img.dataset.title || '');
            lightboxLink.setAttribute('data-alt', img.alt || '');
            
            // Position the link to cover the entire carousel area
            lightboxLink.style.position = 'absolute';
            lightboxLink.style.top = '0';
            lightboxLink.style.left = '0';
            lightboxLink.style.width = '100%';
            lightboxLink.style.height = '100%';
            lightboxLink.style.zIndex = '1';
            lightboxLink.style.cursor = 'pointer';
            lightboxLink.style.display = img.classList.contains('active') ? 'block' : 'none';
            
            // Add the link to the carousel
            carousel.style.position = 'relative';
            carousel.appendChild(lightboxLink);
            
            // Update link visibility when carousel changes
            const updateLinkVisibility = () => {
                const allLinks = carousel.querySelectorAll('a[data-lightbox="carousel-gallery"]');
                allLinks.forEach((link, linkIndex) => {
                    link.style.display = linkIndex === index && carouselImages[linkIndex].classList.contains('active') ? 'block' : 'none';
                });
            };
            
            // Listen for carousel changes
            const observer = new MutationObserver(updateLinkVisibility);
            observer.observe(carousel, { 
                attributes: true, 
                attributeFilter: ['class'],
                subtree: true 
            });
        });
    });
    
    // Find all other images on the page (excluding carousel images)
    const images = document.querySelectorAll('img:not(.carousel-image)');
    
    images.forEach((img, index) => {
        // Skip if already has lightbox functionality
        if (img.closest('a[data-lightbox]')) {
            return;
        }
        
        // Skip if image is inside navigation that shouldn't be lightboxed
        if (img.closest('.hero-navigation') || 
            img.closest('nav')) {
            return;
        }
        
        // Skip if image is an artist card image (should link to artist page)
        if (img.closest('.artist-card') || 
            img.closest('.artist-card-link') ||
            img.classList.contains('artist-image') && img.closest('a[href*="/artists/"]')) {
            return;
        }
        
        // Skip if image is in exhibition artist cards (should link to artist page)
        if (img.closest('.artist-bio') || 
            img.closest('.section-bio-artist-link')) {
            return;
        }
        
        // Create a wrapper link for the image
        const link = document.createElement('a');
        link.href = img.src;
        link.setAttribute('data-lightbox', 'gallery');
        
        // Add title if available
        if (img.alt) {
            link.setAttribute('data-title', img.alt);
        }
        
        // Add alt attribute if available
        if (img.alt) {
            link.setAttribute('data-alt', img.alt);
        }
        
        // Wrap the image with the link
        img.parentNode.insertBefore(link, img);
        link.appendChild(img);
        
        // Add cursor pointer style
        link.style.cursor = 'pointer';
        img.style.cursor = 'pointer';
    });
    
    // Configure lightbox options
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true,
            'showImageNumberLabel': true,
            'albumLabel': 'Image %1 of %2',
            'fadeDuration': 600,
            'imageFadeDuration': 600,
            'fitImagesInViewport': true,
            'disableScrolling': false,
            'alwaysShowNavOnTouchDevices': true
        });
    }
}
