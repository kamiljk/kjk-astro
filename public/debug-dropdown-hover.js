// Debug script to check dropdown button classes and hover states
console.log('=== DROPDOWN HOVER DEBUG ===');

// Wait for the page to load
setTimeout(() => {
    // Find the dropdown menu
    const dropdown = document.querySelector('#filter-sort-menu');
    if (!dropdown) {
        console.log('❌ Dropdown not found');
        return;
    }
    
    console.log('✅ Dropdown found:', dropdown);
    
    // Find all buttons in the dropdown
    const buttons = dropdown.querySelectorAll('button');
    console.log(`Found ${buttons.length} buttons in dropdown`);
    
    buttons.forEach((button, index) => {
        console.log(`\n=== BUTTON ${index + 1} ===`);
        console.log('Text:', button.textContent.trim());
        console.log('Classes:', button.className);
        console.log('Element:', button);
        
        // Check computed styles
        const computedStyle = window.getComputedStyle(button);
        console.log('Background:', computedStyle.backgroundColor);
        console.log('Color:', computedStyle.color);
        console.log('Transition:', computedStyle.transition);
        
        // Add hover event listeners to debug
        button.addEventListener('mouseenter', () => {
            console.log(`🖱️ HOVER START - ${button.textContent.trim()}`);
            const hoverStyle = window.getComputedStyle(button);
            console.log('Hover Background:', hoverStyle.backgroundColor);
            console.log('Hover Color:', hoverStyle.color);
            console.log('Hover Transform:', hoverStyle.transform);
        });
        
        button.addEventListener('mouseleave', () => {
            console.log(`🖱️ HOVER END - ${button.textContent.trim()}`);
        });
    });
    
    // Check if CSS is loaded
    const stylesheets = Array.from(document.styleSheets);
    console.log('\n=== STYLESHEETS ===');
    stylesheets.forEach((sheet, index) => {
        try {
            console.log(`Sheet ${index}:`, sheet.href || 'inline');
            if (sheet.href && sheet.href.includes('NavbarMenu')) {
                console.log('📋 Found NavbarMenu stylesheet');
            }
        } catch (e) {
            console.log(`Sheet ${index}: Cannot access (CORS)`);
        }
    });
    
}, 1000);
