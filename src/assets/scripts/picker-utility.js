/**
 * Generic Year Picker Utility
 * Handles filtering event cards based on selected year
 * Dynamically generates picker buttons based on available years
 * Can be used across multiple pages (art fairs, archive, etc.)
 */

// Disable browser scroll restoration to prevent landing in the middle
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

class YearPicker {
    constructor(options = {}) {
        this.pickerContainer = options.pickerContainer || document.querySelector('.picker');
        this.cardSelector = options.cardSelector || '.event-card';
        this.yearAttribute = options.yearAttribute || 'data-year';
        this.cardContainer = options.cardContainer || document.querySelector('.event-listing-wrapper');
        this.includeAllButton = options.includeAllButton !== false; // Default to true
        this.defaultActiveYear = options.defaultActiveYear || null; // null means newest year
        
        this.eventCards = document.querySelectorAll(this.cardSelector);
        this.pickerButtons = [];
        this.scrollArrows = null;
        
        this.init();
    }
    
    /**
     * Initialize the picker
     */
    init() {
        if (!this.pickerContainer || this.eventCards.length === 0) {
            console.warn('YearPicker: Required elements not found');
            return;
        }
        
        // Extract unique years from event cards
        const availableYears = this.extractAvailableYears();
        
        if (availableYears.length === 0) {
            console.warn('YearPicker: No years found in event cards');
            return;
        }
        
        // Generate picker buttons dynamically
        this.generatePickerButtons(availableYears);
        
        // Create scroll indicator arrows
        this.createScrollArrows();
        
        // Add event listeners
        this.addEventListeners();
        
        // Initialize with default active year (should be "All")
        this.initializeDefaultSelection();
        
        // Reset horizontal scroll to far left
        this.resetHorizontalScroll();
    }
    
    /**
     * Reset horizontal scroll to far left
     * Vanilla JS equivalent of useResetHScroll React hook
     */
    resetHorizontalScroll() {
        if (!this.pickerContainer) return;
        
        const reset = () => {
            if (!this.pickerContainer) return;
            
            // Temporarily disable scroll snapping so the browser can't re-snap mid-init
            const prevSnap = this.pickerContainer.style.scrollSnapType;
            this.pickerContainer.style.scrollSnapType = 'none';
            
            // Force a layout read to flush style changes
            void this.pickerContainer.offsetWidth;
            
            // Hard left, twice in case of late width shifts
            this.pickerContainer.scrollLeft = 0;
            this.pickerContainer.scrollLeft = 0;
            
            // Restore snapping on the next frame
            requestAnimationFrame(() => {
                if (this.pickerContainer) {
                    this.pickerContainer.scrollLeft = 0;
                    this.pickerContainer.style.scrollSnapType = prevSnap || '';
                    this.updateScrollIndicators();
                }
            });
        };
        
        // Stop window/element scroll restoration
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        // Beat hydration/layout thrash with nested RAFs
        requestAnimationFrame(() => {
            reset();
            requestAnimationFrame(reset);
        });
        
        // If web fonts shift widths, reset again
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(reset).catch(() => {});
        }
        
        // One more safety net after the first paint queue
        setTimeout(reset, 0);
        
        // BFCache restore (back/forward)
        const handlePageShow = (e) => {
            if (e.persisted && this.pickerContainer) {
                reset();
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        
        // Store cleanup function for pageshow listener
        this._pageShowHandler = handlePageShow;
    }
    
    /**
     * Scroll left
     */
    scrollLeft() {
        const scrollAmount = this.pickerContainer.clientWidth * 0.8;
        this.pickerContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    }
    
    /**
     * Scroll right
     */
    scrollRight() {
        const scrollAmount = this.pickerContainer.clientWidth * 0.8;
        this.pickerContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
    
    /**
     * Update scroll indicator states
     */
    updateScrollIndicators() {
        if (!this.scrollArrows) return;
        
        const { left, right } = this.scrollArrows;
        const { scrollLeft, scrollWidth, clientWidth } = this.pickerContainer;
        const maxScrollLeft = scrollWidth - clientWidth;
        
        // Left arrow is always enabled (never disabled)
        left.classList.remove('disabled');
        
        // Update right arrow
        if (scrollLeft >= maxScrollLeft - 1) {
            right.classList.add('disabled');
        } else {
            right.classList.remove('disabled');
        }
    }
    
    /**
     * Extract unique years from event cards
     * @returns {Array} Array of unique years sorted in descending order
     */
    extractAvailableYears() {
        return Array.from(this.eventCards)
            .map(card => card.getAttribute(this.yearAttribute))
            .filter((year, index, array) => array.indexOf(year) === index) // Remove duplicates
            .sort((a, b) => b - a); // Sort in descending order (newest first)
    }
    
    /**
     * Generate picker buttons dynamically based on available years
     * @param {Array} years - Array of years to create buttons for
     */
    generatePickerButtons(years) {
        // Clear existing buttons
        this.pickerContainer.innerHTML = '';
        this.pickerButtons = [];
        
        // Create "All" button if enabled (must be first)
        if (this.includeAllButton) {
            const allButton = this.createPickerButton('All', 'All');
            this.pickerContainer.appendChild(allButton);
            this.pickerButtons.push(allButton);
        }
        
        // Create year buttons
        years.forEach(year => {
            const button = this.createPickerButton(year, year);
            this.pickerContainer.appendChild(button);
            this.pickerButtons.push(button);
        });
        
    }
    
    /**
     * Create a picker button element
     * @param {string} value - The data-value attribute
     * @param {string} text - The button text
     * @returns {HTMLElement} The created button element
     */
    createPickerButton(value, text) {
        const button = document.createElement('button');
        button.className = 'picker-button';
        button.setAttribute('data-value', value);
        button.textContent = text;
        return button;
    }
    
    /**
     * Create scroll indicator arrows (only for archive page)
     */
    createScrollArrows() {
        // Only create arrows on the archive page
        const isArchivePage = document.body.classList.contains('archive-page') || 
                             window.location.pathname.includes('/archive') ||
                             document.querySelector('.archive-page');
        
        if (!isArchivePage) {
            return;
        }
        
        // Create arrows container
        const arrowsContainer = document.createElement('div');
        arrowsContainer.className = 'picker-scroll-indicators';
        
        // Create left arrow
        const leftArrow = document.createElement('button');
        leftArrow.className = 'picker-scroll-arrow picker-scroll-arrow-left';
        leftArrow.innerHTML = '&larr;';
        leftArrow.setAttribute('aria-label', 'Scroll left');
        leftArrow.setAttribute('tabIndex', '-1'); // Prevent focus stealing
        
        // Create right arrow
        const rightArrow = document.createElement('button');
        rightArrow.className = 'picker-scroll-arrow picker-scroll-arrow-right';
        rightArrow.innerHTML = '&rarr;';
        rightArrow.setAttribute('aria-label', 'Scroll right');
        rightArrow.setAttribute('tabIndex', '-1'); // Prevent focus stealing
        
        // Add arrows to container
        arrowsContainer.appendChild(leftArrow);
        arrowsContainer.appendChild(rightArrow);
        
        // Insert arrows after picker container
        this.pickerContainer.parentNode.insertBefore(arrowsContainer, this.pickerContainer.nextSibling);
        
        // Store references
        this.scrollArrows = {
            container: arrowsContainer,
            left: leftArrow,
            right: rightArrow
        };
        
        // Add click handlers
        leftArrow.addEventListener('click', () => this.scrollLeft());
        rightArrow.addEventListener('click', () => this.scrollRight());
        
        // Add scroll listener to update arrow states
        this.pickerContainer.addEventListener('scroll', () => this.updateScrollIndicators());
    }
    
    /**
     * Add event listeners to picker buttons
     */
    addEventListeners() {
        this.pickerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use currentTarget to ensure we get the button, not a child element
                const targetButton = e.currentTarget || e.target.closest('.picker-button');
                if (targetButton) {
                    this.handleButtonClick(targetButton);
                }
            });
        });
    }
    
    /**
     * Handle picker button click
     * @param {HTMLElement} button - The clicked button
     */
    handleButtonClick(button) {
        if (!button) return;
        
        const selectedYear = button.getAttribute('data-value');
        if (!selectedYear) return;
        
        // Remove active class from all buttons
        this.pickerButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Filter and show/hide event cards based on selected year
        this.filterEventCards(selectedYear);
    }
    
    /**
     * Filter event cards based on selected year
     * @param {string} year - The year to filter by ('All' shows all cards)
     */
    filterEventCards(year) {
        this.eventCards.forEach(card => {
            const cardYear = card.getAttribute(this.yearAttribute);
            const shouldShow = year === 'All' || cardYear === year;
            
            if (shouldShow) {
                // Show the card immediately
                card.style.display = 'grid';
                card.style.opacity = '1';
            } else {
                // Hide the card immediately
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });
    }
    
    /**
     * Initialize with default active year
     */
    initializeDefaultSelection() {
        let activeButton;
        
        if (this.defaultActiveYear) {
            // Use specified default year
            activeButton = this.pickerContainer.querySelector(`[data-value="${this.defaultActiveYear}"]`);
        } else {
            // Use "All" button as default if available, otherwise first year
            activeButton = this.pickerContainer.querySelector('[data-value="All"]') || 
                          this.pickerButtons.find(btn => btn.getAttribute('data-value') !== 'All');
        }
        
        if (activeButton) {
            activeButton.classList.add('active');
            const defaultYear = activeButton.getAttribute('data-value');
            this.filterEventCards(defaultYear);
        }
    }
    
    /**
     * Programmatically set active year
     * @param {string} year - The year to set as active
     */
    setActiveYear(year) {
        const button = this.pickerContainer.querySelector(`[data-value="${year}"]`);
        if (button) {
            this.handleButtonClick(button);
        }
    }
    
    /**
     * Get currently active year
     * @returns {string|null} The currently active year or null
     */
    getActiveYear() {
        const activeButton = this.pickerContainer.querySelector('.picker-button.active');
        return activeButton ? activeButton.getAttribute('data-value') : null;
    }
}

// Auto-initialize if picker container exists
document.addEventListener('DOMContentLoaded', function() {
    const pickerContainer = document.querySelector('.picker');
    if (pickerContainer && !pickerContainer.hasAttribute('data-manual-init')) {
        new YearPicker();
    }
});

// Additional force scroll on window load (backup for any picker instances)
window.addEventListener('load', function() {
    const pickerContainer = document.querySelector('.picker');
    if (pickerContainer) {
        // Use nested requestAnimationFrame for safety
        requestAnimationFrame(() => {
            pickerContainer.scrollLeft = 0;
            requestAnimationFrame(() => {
                pickerContainer.scrollLeft = 0;
            });
        });
        
        // Reset after fonts are ready (if fonts reflow widths)
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                pickerContainer.scrollLeft = 0;
            }).catch(() => {});
        }
    }
});

// Handle bfcache restores globally (backup for any picker instances)
window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
        const pickerContainer = document.querySelector('.picker');
        if (pickerContainer) {
            pickerContainer.scrollLeft = 0;
        }
    }
});

// Export for manual initialization
window.YearPicker = YearPicker;
