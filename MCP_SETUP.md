# MCP Design System Extractor Setup

This project is now configured to connect to the Smartcat design system Storybook using the MCP (Model Context Protocol) design system extractor.

## Configuration

The MCP server is configured in `.claude_code_config.json` to connect to:
- **Storybook URL**: https://design-system.smartcat.com
- **MCP Server**: `mcp-design-system-extractor/dist/index.js`

## Available Tools

Once connected, you can use the following MCP tools to interact with the Smartcat design system:

### Core Discovery Tools
- **`list_components`** - List all available components from the Storybook
- **`search_components`** - Search components by name, title, or category
- **`get_component_variants`** - Get all story variants for a specific component

### Component Analysis Tools
- **`get_component_html`** - Extract HTML from specific component stories
- **`get_component_props`** - Get component props/API documentation
- **`get_component_dependencies`** - Analyze component dependencies

### Design System Tools
- **`get_theme_info`** - Extract design system theme information (colors, spacing, typography)
- **`get_layout_components`** - Get layout components with usage examples
- **`get_component_by_purpose`** - Find components by purpose (form inputs, navigation, feedback, etc.)
- **`get_component_composition_examples`** - Get examples of component combinations
- **`get_external_css`** - Extract design tokens and CSS variables

## Smartcat Design System Components

The Smartcat design system includes:

### Form Components
- **Input** - Various input types (default, with icon, multi-input, password, slider, textarea)
- **Checkbox** - Standard and card-based checkboxes
- **Radio** - Standard and card-based radio buttons
- **Select** - Dropdown selections with various configurations
- **Multiselect** - Multi-selection components
- **Datepicker** - Single and range date pickers
- **Switch** - Toggle switches

### Button Components
- **ScButton** - Primary button component with variants
- **ScButtonAvatar** - Avatar-based buttons
- **ScButtonChips** - Chip-style buttons
- **ScButtonCircle** - Circular buttons
- **ScButtonDropdown** - Dropdown buttons
- **ScButtonLogo** - Logo buttons
- **ScButtonMulti** - Multi-action buttons
- **ScButtonSmartwords** - Smart word buttons
- **UiButtons** - UI button variants

### Layout Components
- **Flex** - Flexible layout component
- **Table** - Data tables with various configurations
- **Sidebar** - Sidebar navigation
- **Sideline** - Side content layout
- **ScScrollable** - Scrollable containers

### Feedback Components
- **Dialog** - Modal dialogs
- **Popup** - Various popup types (confirm, onboarding)
- **Notification** - Notification components
- **Notice** - Notice/alert components
- **Tooltip** - Tooltip components
- **ScTip** - Tip components

### Navigation Components
- **Tab** - Tab navigation (simple, rounded, with notifications)
- **Dropdown** - Dropdown menus
- **ScAccordion** - Accordion components

### Display Components
- **Avatar** - User avatars with various states
- **Badge** - Badge components
- **Banner** - Banner components
- **Card** - Card components
- **Skeleton** - Loading skeleton components
- **Progress** - Progress indicators
- **Loader** - Loading spinners

### Text Components
- **Text** - Text components with various styles
- **H1, H2, H3** - Heading components
- **UiText** - UI text with various configurations

## Usage Examples

### List all components
```
list_components({ category: "all" })
```

### Search for button components
```
search_components({ query: "button", searchIn: "name" })
```

### Get button variants
```
get_component_variants({ componentName: "ScButton" })
```

### Extract button HTML
```
get_component_html({ 
  componentId: "components-button-scbutton--default",
  includeStyles: true 
})
```

### Get component props
```
get_component_props({ 
  componentId: "components-button-scbutton--default" 
})
```

### Find form input components
```
get_component_by_purpose({ purpose: "form inputs" })
```

### Get theme information
```
get_theme_info({ includeAll: false })
```

## Troubleshooting

1. **Connection Issues**: Ensure the Storybook URL is accessible
2. **Component Not Found**: Use `list_components` first to see available components
3. **Story ID Format**: Use exact story ID format: "component-name--story-name"
4. **MCP Server**: The server runs on stdio and is managed by Claude Code

## Resources

- [Smartcat Design System](https://design-system.smartcat.com)
- [MCP Design System Extractor](https://github.com/freema/mcp-design-system-extractor)
- [Storybook Documentation](https://storybook.js.org/)
