import { Pressable, Text, View } from 'react-native';
import { Icon } from './Icon';
import { theme } from '../theme';

/** Main destinations remain visible with labeled native touch targets. */
export function Navigation({
  active,
  onChange,
}: {
  active: 'home' | 'history' | 'settings' | 'insights';
  onChange: (tab: 'home' | 'history' | 'settings' | 'insights') => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderColor: theme.color.line,
        backgroundColor: theme.color.paper,
        paddingTop: 8,
        paddingBottom: 5,
      }}
    >
      {(
        [
          ['home', 'Tara', 'scan'],
          ['history', 'Geçmiş', 'history'],
          ['insights', 'Gözlemler', 'observations'],
          ['settings', 'Tercihler', 'settings'],
        ] as const
      ).map(([value, label, icon]) => (
        <Pressable
          key={value}
          accessibilityRole="tab"
          accessibilityLabel={label}
          accessibilityState={{ selected: value === active }}
          aria-selected={value === active}
          onPress={() => onChange(value)}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 54, gap: 4 }}
        >
          <Icon
            name={icon}
            color={value === active ? theme.color.green : theme.color.muted}
            size={22}
          />
          <Text
            style={{
              fontFamily: value === active ? theme.font.bold : theme.font.regular,
              fontSize: 11,
              color: value === active ? theme.color.green : theme.color.muted,
            }}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
