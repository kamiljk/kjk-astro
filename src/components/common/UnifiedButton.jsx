import React, { forwardRef } from 'react';

/**
 * UnifiedButton - A wrapper component that ensures buttons use the global unified button system
 * This bypasses CSS Module scoping issues by using a pure global class approach
 */
const UnifiedButton = forwardRef(({ 
  type = 'pill', 
  active = false, 
  children, 
  onClick, 
  disabled = false,
  ariaLabel,
  ariaCurrent,
  ariaExpanded,
  tabIndex = 0,
  style,
  ...props 
}, ref) => {
  const baseClass = type; // 'pill', 'button', 'menu-toggle-btn', etc.
  const className = `${baseClass}${active ? ' active' : ''}`;
  
  return (
    <button
      ref={ref}
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      aria-expanded={ariaExpanded}
      tabIndex={tabIndex}
      type="button"
      style={style}
      {...props}
    >
      {children}
    </button>
  );
});

export default UnifiedButton;
