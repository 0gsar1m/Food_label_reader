import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { View } from 'react-native';
import { theme } from '../theme';

/** Small custom stroke set; icons accompany readable labels rather than replacing them. */
export function Icon({
  name,
  size = 22,
  color = theme.color.ink,
}: {
  name:
    | 'scan'
    | 'gallery'
    | 'history'
    | 'observations'
    | 'settings'
    | 'arrow'
    | 'back'
    | 'close'
    | 'check'
    | 'trash'
    | 'share'
    | 'info'
    | 'flash'
    | 'shield';
  size?: number;
  color?: string;
}) {
  const paths: Record<typeof name, string> = {
    scan: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 12h18M8 8h8M8 16h8',
    gallery: 'm3 17 5-5 4 4 4-6 5 7',
    history: 'M3 5v5h5M3.5 9a9 9 0 1 1 .5 7M12 7v5l3 2',
    observations: 'M4 4v16h16M8 15l4-6 4 3 4-7',
    settings: 'M4 7h16M4 17h16M8 4v6m8 4v6',
    arrow: 'M4 12h15m-6-6 6 6-6 6',
    back: 'M20 12H5m6-6-6 6 6 6',
    close: 'm6 6 12 12M6 18 18 6',
    check: 'm5 12 4 4L19 6',
    trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
    share: 'M12 16V3m-5 5 5-5 5 5M5 13v8h14v-8',
    info: 'M12 11v6M12 7h.01',
    flash: 'm13 2-8 12h6l-1 8 9-13h-7l1-7',
    shield: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3m-4 9 3 3 5-6',
  };
  return (
    <View accessible={false} aria-hidden style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {name === 'gallery' && (
          <>
            <Rect x={3} y={3} width={18} height={18} rx={2} />
            <Circle cx={8} cy={8} r={1} />
          </>
        )}
        {name === 'info' && <Circle cx={12} cy={12} r={9} />}
        <Path d={paths[name]} />
      </Svg>
    </View>
  );
}
