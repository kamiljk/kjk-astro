// Debug search width constraints
console.log('=== SEARCH WIDTH DEBUGGING ===');

const searchContainer = document.querySelector('.search-container-inline');
const searchBar = document.querySelector('.search-bar-inline');
const searchResults = document.querySelector('.search-results-container');
const pagefindForm = document.querySelector('.pagefind-ui__form');
const pagefindInput = document.querySelector('.pagefind-ui__search-input');

function logElementStyles(element, name) {
    if (!element) {
        console.log(`${name}: NOT FOUND`);
        return;
    }
    
    const computed = window.getComputedStyle(element);
    console.log(`\n--- ${name} ---`);
    console.log('Width:', computed.width);
    console.log('Max-width:', computed.maxWidth);
    console.log('Min-width:', computed.minWidth);
    console.log('Flex:', computed.flex);
    console.log('Flex-grow:', computed.flexGrow);
    console.log('Flex-shrink:', computed.flexShrink);
    console.log('Flex-basis:', computed.flexBasis);
    console.log('Display:', computed.display);
    console.log('Position:', computed.position);
}

logElementStyles(searchContainer, 'Search Container');
logElementStyles(searchBar, 'Search Bar');
logElementStyles(searchResults, 'Search Results Container');
logElementStyles(pagefindForm, 'Pagefind Form');
logElementStyles(pagefindInput, 'Pagefind Input');

// Check parent navbar structure
const navbar = document.querySelector('.navbar-header-row');
if (navbar) {
    console.log('\n--- NAVBAR HEADER ROW ---');
    const computed = window.getComputedStyle(navbar);
    console.log('Width:', computed.width);
    console.log('Display:', computed.display);
    console.log('Justify-content:', computed.justifyContent);
    console.log('Gap:', computed.gap);
}
