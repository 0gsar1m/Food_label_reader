import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { theme, ui } from '../theme';
import type { ComponentProps, ReactNode } from 'react';

/** Native buttons share a 52dp target and expose disabled/busy state to assistive technology. */
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: ComponentProps<typeof Icon>['name'];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minHeight: 54,
          borderRadius: 5,
          paddingHorizontal: 18,
          paddingVertical: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          backgroundColor: secondary ? 'transparent' : theme.color.green,
          borderWidth: secondary ? 1 : 0,
          borderColor: theme.color.line,
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
        },
        style,
      ]}
    >
      {icon && (
        <Icon name={icon} color={secondary ? theme.color.ink : theme.color.paper} size={20} />
      )}
      <Text style={[ui.strong, { color: secondary ? theme.color.ink : theme.color.paper }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Icon-only actions retain explicit accessible labels and generous touch targets. */
export function IconButton({
  label,
  icon,
  onPress,
  color,
}: {
  label: string;
  icon: ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Icon name={icon} color={color} />
    </Pressable>
  );
}

/** Uniform back navigation still uses the native Android hardware-back handler. */
export function ScreenHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack: () => void;
  action?: ReactNode;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: theme.color.line,
      }}
    >
      <View style={ui.between}>
        <IconButton label="Geri" icon="back" onPress={onBack} />
        <Text accessibilityRole="header" style={ui.strong}>
          {title}
        </Text>
        <View style={{ minWidth: 48 }}>{action}</View>
      </View>
    </View>
  );
}

/** Consistent inline notice; error information is also announced by screen readers. */
export function Notice({ children }: { children: ReactNode }) {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={ui.notice}>
      <Text style={[ui.body, { color: theme.color.warning }]}>{children}</Text>
    </View>
  );
}
