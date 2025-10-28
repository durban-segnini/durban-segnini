/**
 * Carousel Functionality
 * Handles image carousel with fade transitions
 * Supports next/previous navigation with smooth ease-in-out transitions
 * Works for both hero carousel and exhibition carousels
 */

class Carousel {
    constructor(container) {
        this.carousel = container;
        this.images = container.querySelectorAll('.carousel-image');
        this.prevButton = container.parentElement.querySelector('.hero-arrow-prev, .exhibition-arrow-prev');
        this.nextButton = container.parentElement.querySelector('.hero-arrow-next, .exhibition-arrow-next');
        this.figcaption = container.parentElement.querySelector('.hero-fitcaption');
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
        
        // Hide navigation if only one image is present
        if (this.images.length <= 1) {
            if (this.prevButton) {
                this.prevButton.style.display = 'none';
                this.prevButton.setAttribute('aria-hidden', 'true');
            }
            if (this.nextButton) {
                this.nextButton.style.display = 'none';
                this.nextButton.setAttribute('aria-hidden', 'true');
            }
        }

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
    // Initialize all hero carousels (multiple hero sections)
    const heroCarousels = document.querySelectorAll('.hero-carousel');
    heroCarousels.forEach(carousel => {
        new Carousel(carousel);
    });
});

// Export for manual initialization if needed
window.Carousel = Carousel;
