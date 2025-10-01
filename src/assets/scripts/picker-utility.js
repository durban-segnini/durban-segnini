/**
 * Generic Year Picker Utility
 * Handles filtering event cards based on selected year
 * Dynamically generates picker buttons based on available years
 * Can be used across multiple pages (art fairs, archive, etc.)
 */

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
        
        // Add event listeners
        this.addEventListeners();
        
        // Initialize with default active year
        this.initializeDefaultSelection();
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
        
        // Create "All" button if enabled
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
     * Add event listeners to picker buttons
     */
    addEventListeners() {
        this.pickerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
            });
        });
    }
    
    /**
     * Handle picker button click
     * @param {HTMLElement} button - The clicked button
     */
    handleButtonClick(button) {
        const selectedYear = button.getAttribute('data-value');
        
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

// Export for manual initialization
window.YearPicker = YearPicker;
