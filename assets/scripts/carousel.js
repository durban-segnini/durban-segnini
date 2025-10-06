/**
 * Hero Carousel Functionality
 * Handles image carousel with fade transitions
 * Supports next/previous navigation with smooth ease-in-out transitions
 */

class HeroCarousel {
    constructor() {
        this.carousel = document.querySelector('.hero-carousel');
        this.images = document.querySelectorAll('.carousel-image');
        this.prevButton = document.querySelector('.hero-arrow-prev');
        this.nextButton = document.querySelector('.hero-arrow-next');
        this.figcaption = document.querySelector('.hero-fitcaption');
        this.currentIndex = 0;
        this.isTransitioning = false;
        
        if (this.carousel && this.images.length > 0) {
            this.init();
        }
    }
    
    /**
     * Initialize the carousel
     */
    init() {
        // Set up event listeners
        this.prevButton?.addEventListener('click', () => this.previousImage());
        this.nextButton?.addEventListener('click', () => this.nextImage());
        
        // Initialize first image as active
        this.showImage(0);
    }
    
    /**
     * Show the image at the specified index
     * @param {number} index - The index of the image to show
     */
    showImage(index) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Remove active class from all images
        this.images.forEach(img => img.classList.remove('active'));
        
        // Add active class to current image
        this.images[index].classList.add('active');
        
        // Update figcaption with the current image's data
        if (this.figcaption) {
            const currentImage = this.images[index];
            const title = currentImage.dataset.title || '';
            const artist = currentImage.dataset.artist || '';
            
            if (title && artist) {
                this.figcaption.innerHTML = `<h3>${title}</h3><p>${artist}</p>`;
            } else if (currentImage.dataset.caption) {
                // Fallback for installation view images
                this.figcaption.textContent = currentImage.dataset.caption;
            }
        }
        
        // Update current index
        this.currentIndex = index;
        
        // Reset transition flag after transition completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500); // Match CSS transition duration
    }
    
    /**
     * Go to the next image
     */
    nextImage() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.showImage(nextIndex);
    }
    
    /**
     * Go to the previous image
     */
    previousImage() {
        const prevIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
        this.showImage(prevIndex);
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new HeroCarousel();
});

// Export for manual initialization if needed
window.HeroCarousel = HeroCarousel;
