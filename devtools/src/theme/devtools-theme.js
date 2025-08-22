/**
 * JSG Logger DevTools Panel - Custom Dark Theme
 * Professional dark theme optimized for development tools
 */

import { defaultTheme } from 'evergreen-ui'
import merge from 'lodash.merge'

export const devToolsTheme = merge({}, defaultTheme, {
  // Color system optimized for dark DevTools
  colors: {
    // Background colors
    background: {
      tint1: '#1E1E1E',      // Main panel background
      tint2: '#2A2A2A',      // Card/section backgrounds  
      overlay: 'rgba(0,0,0,0.9)'  // Modal overlays
    },
    
    // Border colors
    border: {
      default: '#333333',     // Primary borders
      muted: '#2A2A2A'       // Subtle borders
    },
    
    // Text colors
    text: {
      default: '#FFFFFF',     // Primary text
      muted: '#CCCCCC',      // Secondary text
      dark: '#888888'        // Tertiary text
    },
    
    // Brand colors (matches JSG Logger branding)
    palette: {
      primary: {
        base: '#4A90E2',     // Primary blue
        dark: '#357ABD',     // Darker blue for hover
        light: '#5BA0F2'     // Lighter blue for active
      },
      
      // Status colors
      success: {
        base: '#27AE60',     // Green for success states
        dark: '#229954',
        light: '#2ECC71'
      },
      
      warning: {
        base: '#F39C12',     // Orange for warning states  
        dark: '#D68910',
        light: '#F1C40F'
      },
      
      danger: {
        base: '#E74C3C',     // Red for error states
        dark: '#C0392B', 
        light: '#EC7063'
      },
      
      neutral: {
        base: '#95A5A6',     // Gray for neutral states
        dark: '#7F8C8D',
        light: '#BDC3C7'
      }
    },
    
    // Intent colors (Evergreen's semantic colors)
    intent: {
      success: '#27AE60',
      warning: '#F39C12',
      danger: '#E74C3C',
      none: '#95A5A6'
    }
  },
  
  // Typography system
  typography: {
    fontFamilies: {
      display: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      ui: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'Monaco, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
    },
    
    fontSizes: {
      caption: 11,   // Small captions
      body: 13,      // Body text (DevTools standard)
      heading: 16,   // Section headings
      title: 20      // Panel title
    },
    
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  // Component-specific overrides
  components: {
    // Button component customization
    Button: {
      baseStyle: {
        borderRadius: '6px',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      
      appearances: {
        // Primary button (Debug All, Trace All)
        primary: {
          backgroundColor: '#4A90E2',
          color: '#FFFFFF',
          border: 'none',
          
          _hover: {
            backgroundColor: '#5BA0F2',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)'
          },
          
          _active: {
            backgroundColor: '#357ABD',
            transform: 'translateY(0)',
            boxShadow: '0 1px 4px rgba(74, 144, 226, 0.3)'
          },
          
          _disabled: {
            backgroundColor: '#555555',
            color: '#888888',
            transform: 'none',
            boxShadow: 'none'
          }
        },
        
        // Minimal button (secondary actions)
        minimal: {
          backgroundColor: 'transparent',
          color: '#CCCCCC',
          border: '1px solid #333333',
          
          _hover: {
            backgroundColor: '#2A2A2A',
            borderColor: '#4A90E2',
            color: '#FFFFFF'
          },
          
          _active: {
            backgroundColor: '#1E1E1E',
            borderColor: '#357ABD'
          }
        },
        
        // Danger button (Reset, destructive actions)
        default: {
          backgroundColor: '#E74C3C',
          color: '#FFFFFF', 
          border: 'none',
          
          _hover: {
            backgroundColor: '#EC7063',
            transform: 'translateY(-1px)'
          },
          
          _active: {
            backgroundColor: '#C0392B',
            transform: 'translateY(0)'
          }
        }
      },
      
      sizes: {
        small: {
          height: 28,
          paddingX: 12,
          fontSize: 12
        },
        medium: {
          height: 32,
          paddingX: 16,
          fontSize: 13
        },
        large: {
          height: 36,
          paddingX: 20, 
          fontSize: 14
        }
      }
    },
    
    // Switch component (for component toggles)
    Switch: {
      baseStyle: {
        backgroundColor: '#444444'
      },
      
      appearances: {
        default: {
          backgroundColor: '#444444',
          
          _checked: {
            backgroundColor: '#4A90E2'
          },
          
          _hover: {
            backgroundColor: '#555555'
          },
          
          _checkedHover: {
            backgroundColor: '#5BA0F2'
          }
        }
      }
    },
    
    // Pane component (containers, panels)
    Pane: {
      baseStyle: {
        backgroundColor: '#1E1E1E',
        border: '1px solid #333333',
        borderRadius: '8px'
      }
    },
    
    // Card component (content cards)
    Card: {
      baseStyle: {
        backgroundColor: '#2A2A2A',
        border: '1px solid #333333', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }
    },
    
    // Text components
    Text: {
      baseStyle: {
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      
      appearances: {
        default: {
          color: '#FFFFFF'
        },
        muted: {
          color: '#CCCCCC'
        },
        disabled: {
          color: '#888888'  
        }
      }
    },
    
    // Heading components
    Heading: {
      baseStyle: {
        color: '#4A90E2',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600
      }
    },
    
    // Badge component (for log counts)
    Badge: {
      appearances: {
        default: {
          backgroundColor: '#E74C3C',
          color: '#FFFFFF'
        }
      }
    }
  }
})

export default devToolsTheme
