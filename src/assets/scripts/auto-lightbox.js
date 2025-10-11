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
    // Handle carousel images specially - create a single lightbox link for the carousel
    const carousels = document.querySelectorAll('.hero-carousel');
    carousels.forEach(carousel => {
        // Create a single lightbox link for the carousel container
        const carouselLink = document.createElement('a');
        carouselLink.style.position = 'absolute';
        carouselLink.style.top = '0';
        carouselLink.style.left = '0';
        carouselLink.style.width = '100%';
        carouselLink.style.height = '100%';
        carouselLink.style.zIndex = '1';
        carouselLink.style.cursor = 'pointer';
        carouselLink.setAttribute('data-lightbox', 'gallery');
        
        // Set up click handler to always use the currently active image
        carouselLink.addEventListener('click', function(e) {
            e.preventDefault();
            const activeImage = carousel.querySelector('.carousel-image.active');
            if (activeImage && activeImage.src) {
                carouselLink.href = activeImage.src;
                if (activeImage.alt) {
                    carouselLink.setAttribute('data-title', activeImage.alt);
                    carouselLink.setAttribute('data-alt', activeImage.alt);
                }
                // Trigger lightbox
                carouselLink.click();
            }
        });
        
        // Add the link to the carousel
        carousel.style.position = 'relative';
        carousel.appendChild(carouselLink);
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
            'disableScrolling': false
        });
    }
}
