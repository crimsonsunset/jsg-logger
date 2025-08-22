/**
 * Theme Demo - Visual test of custom DevTools theme
 * This file shows how Evergreen components look with our dark theme
 */

import { Button, Pane, Text, Heading, Card, Switch, Badge } from 'evergreen-ui'

export function ThemeDemo() {
  return (
    <Pane padding={20} background="tint1">
      <Heading size={600} marginBottom={16}>🎨 DevTools Theme Demo</Heading>
      
      {/* Button Variants */}
      <Card padding={16} marginBottom={16} background="tint2">
        <Text size={400} marginBottom={12} display="block">Button Variants:</Text>
        <Pane display="flex" gap={8}>
          <Button appearance="primary">Primary (Debug All)</Button>
          <Button appearance="minimal">Minimal (Secondary)</Button>
          <Button appearance="default">Default (Reset)</Button>
        </Pane>
      </Card>
      
      {/* Switch Components */}
      <Card padding={16} marginBottom={16} background="tint2">
        <Text size={400} marginBottom={12} display="block">Component Toggles:</Text>
        <Pane display="flex" alignItems="center" gap={12}>
          <Switch checked={true} />
          <Text>API Component</Text>
          <Badge color="green" marginLeft={8}>ON</Badge>
        </Pane>
        <Pane display="flex" alignItems="center" gap={12} marginTop={8}>
          <Switch checked={false} />
          <Text>Database Component</Text>
          <Badge color="red" marginLeft={8}>OFF</Badge>
        </Pane>
      </Card>
      
      {/* Typography */}
      <Card padding={16} marginBottom={16} background="tint2">
        <Text size={400} marginBottom={12} display="block">Typography:</Text>
        <Heading size={500} color="blue" marginBottom={8}>🎛️ Logger Controls</Heading>
        <Text size={400} color="muted" display="block" marginBottom={4}>
          Component filtering and global controls
        </Text>
        <Text size={300} color="default" fontFamily="mono">
          logger.controls.enableDebugMode()
        </Text>
      </Card>
      
      {/* Status Indicators */}
      <Card padding={16} background="tint2">
        <Text size={400} marginBottom={12} display="block">Status Colors:</Text>
        <Pane display="flex" gap={8}>
          <Badge color="blue">Primary</Badge>
          <Badge color="green">Success</Badge>
          <Badge color="orange">Warning</Badge>
          <Badge color="red">Danger</Badge>
          <Badge color="neutral">Neutral</Badge>
        </Pane>
      </Card>
    </Pane>
  )
}
