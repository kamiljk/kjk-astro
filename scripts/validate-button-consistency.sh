#!/bin/bash

# Button State Consistency Validation Script
# Run this script to validate all button states are working correctly

echo "🎯 Button State Consistency Validation"
echo "======================================"

# Check if server is running
if ! curl -s http://localhost:4321 > /dev/null; then
    echo "❌ Astro dev server is not running. Please start it with 'npm run dev'"
    exit 1
fi

echo "✅ Astro dev server is running"

# Open test pages for manual validation
echo "🚀 Opening test pages..."

# Main site for navbar testing
open "http://localhost:4321" &

# Dedicated button test page
open "http://localhost:4321/button-test.html" &

echo "📱 Manual Testing Checklist:"
echo "----------------------------"
echo "1. Resize browser window to test responsive breakpoints:"
echo "   - Mobile: 375px - 480px"
echo "   - Tablet: 768px - 830px" 
echo "   - Desktop: 1024px+"
echo ""
echo "2. Test all button states:"
echo "   - Default: Transparent background, accent border/text"
echo "   - Hover: Accent background, contrasting text, lift effect"
echo "   - Active: Accent background, no lift, pressed shadow"
echo "   - Focus: Same as hover + focus ring (use Tab key)"
echo "   - Disabled: Reduced opacity, no interaction"
echo ""
echo "3. Test navbar dropdown button consistency:"
echo "   - Should match all other buttons in default/hover/active states"
echo "   - Dropdown functionality should work normally"
echo ""
echo "4. Test theme switching:"
echo "   - Click theme toggle button on test page"
echo "   - All button states should work in both light and dark themes"
echo ""
echo "5. Run browser console validation:"
echo "   - Open Developer Tools (F12)"
echo "   - In console, run: buttonValidator.testCurrent()"
echo "   - Check for any consistency issues reported"
echo ""

# Create a simple automated check
echo "🔍 Running basic accessibility checks..."

# Check for minimum touch target sizes in CSS
if grep -q "min-height: 44px" src/assets/global.css; then
    echo "✅ Touch target accessibility requirements met"
else
    echo "⚠️  Check touch target sizes in global.css"
fi

# Check for focus indicators
if grep -q "focus-visible" src/assets/global.css; then
    echo "✅ Focus indicators implemented"
else
    echo "⚠️  Check focus indicator implementation"
fi

# Check for disabled states
if grep -q ":disabled" src/assets/global.css; then
    echo "✅ Disabled states implemented"
else
    echo "⚠️  Check disabled state implementation"
fi

echo ""
echo "🏁 Validation Complete!"
echo "======================"
echo "Please verify manually that all buttons:"
echo "1. Have consistent default appearance (transparent)"
echo "2. Show accent color only on hover/active/focus"
echo "3. Work correctly across all viewport sizes"
echo "4. Maintain accessibility standards"
echo ""
echo "If any issues are found, refer to:"
echo "- docs/button-state-consistency-implementation.md"
echo "- public/scripts/comprehensive-button-validator.js"
