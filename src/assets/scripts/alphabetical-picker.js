/**
 * Alphabetical Picker Utility
 * Handles filtering artist cards based on selected letter
 * Dynamically generates picker buttons based on available first letters
 * Can be used for any alphabetical filtering needs
 */

class AlphabeticalPicker {
    constructor(options = {}) {
        this.pickerContainer = options.pickerContainer || document.querySelector('.picker');
        this.cardSelector = options.cardSelector || '.artist-card-link';
        this.nameSelector = options.nameSelector || 'h3'; // Selector for the name element within each card
        this.cardContainer = options.cardContainer || document.querySelector('.artist-card-list');
        this.includeAllButton = options.includeAllButton !== false; // Default to true
        this.defaultActiveLetter = options.defaultActiveLetter || null; // null means first available letter
        
        this.artistCards = document.querySelectorAll(this.cardSelector);
        this.pickerButtons = [];
        this.hiddenCards = [];
        
        this.init();
    }
    
    /**
     * Initialize the picker
     */
    init() {
        if (!this.pickerContainer || this.artistCards.length === 0) {
            console.warn('AlphabeticalPicker: Required elements not found');
            return;
        }
        
        // Extract unique first letters from artist names
        const availableLetters = this.extractAvailableLetters();
        
        if (availableLetters.length === 0) {
            console.warn('AlphabeticalPicker: No letters found in artist names');
            return;
        }
        
        // Generate picker buttons dynamically
        this.generatePickerButtons(availableLetters);
        
        // Add event listeners
        this.addEventListeners();
        
        // Initialize with default active letter
        this.initializeDefaultSelection();
    }
    
    /**
     * Extract unique first letters from artist names
     * @returns {Array} Array of unique letters sorted alphabetically
     */
    extractAvailableLetters() {
        // Get all cards (both visible and hidden)
        const allCards = Array.from(this.artistCards).concat(this.hiddenCards);
        
        return allCards
            .map(card => {
                const nameElement = card.querySelector(this.nameSelector);
                if (nameElement) {
                    const name = nameElement.textContent.trim();
                    return name.charAt(0).toUpperCase();
                }
                return null;
            })
            .filter(letter => letter !== null)
            .filter((letter, index, array) => array.indexOf(letter) === index) // Remove duplicates
            .sort(); // Sort alphabetically
    }
    
    /**
     * Generate picker buttons dynamically based on available letters
     * @param {Array} letters - Array of letters to create buttons for
     */
    generatePickerButtons(letters) {
        // Clear existing buttons
        this.pickerContainer.innerHTML = '';
        this.pickerButtons = [];
        
        // Create "All" button if enabled
        if (this.includeAllButton) {
            const allButton = this.createPickerButton('ALL', 'All');
            this.pickerContainer.appendChild(allButton);
            this.pickerButtons.push(allButton);
        }
        
        // Create letter buttons
        letters.forEach(letter => {
            const button = this.createPickerButton(letter, letter);
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
        const selectedLetter = button.getAttribute('data-value');
        
        // Remove active class from all buttons
        this.pickerButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Filter and show/hide artist cards based on selected letter
        this.filterArtistCards(selectedLetter);
    }
    
    /**
     * Filter artist cards based on selected letter
     * @param {string} letter - The letter to filter by ('ALL' shows all cards)
     */
    filterArtistCards(letter) {
        // If "ALL" is selected, restore all cards
        if (letter === 'ALL') {
            this.restoreAllCards();
            return;
        }
        
        const visibleCards = [];
        const hiddenCards = [];
        
        this.artistCards.forEach(card => {
            const nameElement = card.querySelector(this.nameSelector);
            if (!nameElement) return;
            
            const artistName = nameElement.textContent.trim();
            const firstLetter = artistName.charAt(0).toUpperCase();
            const shouldShow = firstLetter === letter;
            
            if (shouldShow) {
                visibleCards.push(card);
            } else {
                hiddenCards.push(card);
            }
        });
        
        // Remove all cards from the DOM temporarily
        this.artistCards.forEach(card => {
            if (card.parentNode) {
                card.parentNode.removeChild(card);
            }
        });
        
        // Re-append only the visible cards to maintain proper grid reflow
        visibleCards.forEach(card => {
            this.cardContainer.appendChild(card);
        });
        
        // Store hidden cards for potential future use
        this.hiddenCards = hiddenCards;
    }
    
    /**
     * Restore all cards to the DOM (useful for "ALL" selection)
     */
    restoreAllCards() {
        // Remove all currently visible cards
        Array.from(this.cardContainer.children).forEach(child => {
            if (child.classList.contains('artist-card-link')) {
                this.cardContainer.removeChild(child);
            }
        });
        
        // Re-append all original cards
        this.artistCards.forEach(card => {
            this.cardContainer.appendChild(card);
        });
        
        // Clear hidden cards
        this.hiddenCards = [];
    }
    
    /**
     * Initialize with default active letter
     */
    initializeDefaultSelection() {
        let activeButton;
        
        if (this.defaultActiveLetter) {
            // Use specified default letter
            activeButton = this.pickerContainer.querySelector(`[data-value="${this.defaultActiveLetter}"]`);
        } else {
            // Use "All" button as default if available, otherwise first letter
            activeButton = this.pickerContainer.querySelector('[data-value="ALL"]') || 
                          this.pickerButtons.find(btn => btn.getAttribute('data-value') !== 'ALL');
        }
        
        if (activeButton) {
            activeButton.classList.add('active');
            const defaultLetter = activeButton.getAttribute('data-value');
            this.filterArtistCards(defaultLetter);
        }
    }
    
    /**
     * Programmatically set active letter
     * @param {string} letter - The letter to set as active
     */
    setActiveLetter(letter) {
        const button = this.pickerContainer.querySelector(`[data-value="${letter}"]`);
        if (button) {
            this.handleButtonClick(button);
        }
    }
    
    /**
     * Get currently active letter
     * @returns {string|null} The currently active letter or null
     */
    getActiveLetter() {
        const activeButton = this.pickerContainer.querySelector('.picker-button.active');
        return activeButton ? activeButton.getAttribute('data-value') : null;
    }
}

// Auto-initialize if picker container exists
document.addEventListener('DOMContentLoaded', function() {
    const pickerContainer = document.querySelector('.picker');
    if (pickerContainer && !pickerContainer.hasAttribute('data-manual-init')) {
        // Check if this is an alphabetical picker (has artist cards)
        const artistCards = document.querySelectorAll('.artist-card');
        if (artistCards.length > 0) {
            new AlphabeticalPicker();
        }
    }
});

// Export for manual initialization
window.AlphabeticalPicker = AlphabeticalPicker;
