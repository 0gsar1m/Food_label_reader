import Svg, { Path, Rect, Text, G, Line } from 'react-native-svg';
import { theme } from '../theme';

/** Original vector illustration depicts a label, not a fabricated scan result. */
export function LabelIllustration() {
  return (
    <Svg
      width="100%"
      height={206}
      viewBox="0 0 340 206"
      accessibilityLabel="İçindekiler bölümünü çerçeveye hizalamayı gösteren çizim"
      role="img"
    >
      <G transform="translate(95 8) rotate(-7 78 90)">
        <Rect
          x={0}
          y={0}
          width={152}
          height={185}
          rx={4}
          fill={theme.color.paper}
          stroke="#B3BBA5"
        />
        <Text
          x={18}
          y={30}
          fill={theme.color.ink}
          fontSize={12}
          fontWeight="bold"
          letterSpacing={1}
        >
          İÇİNDEKİLER
        </Text>
        <Line x1={18} x2={134} y1={43} y2={43} stroke="#BDC3B2" />
        {[58, 69, 80, 91, 102].map((y, index) => (
          <Line
            key={y}
            x1={18}
            x2={index === 4 ? 94 : 132}
            y1={y}
            y2={y}
            stroke={index === 1 ? '#6A7A58' : '#AFB7A2'}
            strokeWidth={index === 1 ? 3 : 2}
          />
        ))}
        <Text x={18} y={128} fill={theme.color.green} fontSize={8} letterSpacing={1}>
          ALERJEN BİLGİSİ
        </Text>
        <Line x1={18} x2={128} y1={139} y2={139} stroke="#AFB7A2" strokeWidth={2} />
        {[0, 4, 7, 13, 16, 20, 26, 30, 35, 39, 43, 49, 52, 58, 64, 69, 74, 78, 84, 89].map(
          (x, index) => (
            <Line
              key={x}
              x1={25 + x}
              x2={25 + x}
              y1={155}
              y2={171}
              stroke="#69755E"
              strokeWidth={index % 3 === 0 ? 2 : 1}
            />
          ),
        )}
      </G>
      <Path
        d="M65 56V30h26m158 0h26v26M65 151v26h26m158 0h26v-26"
        fill="none"
        stroke={theme.color.green}
        strokeWidth={2}
      />
      <Line x1={57} x2={283} y1={103} y2={103} stroke={theme.color.green} strokeWidth={1} />
      <Rect x={279} y={100} width={6} height={6} fill={theme.color.green} />
    </Svg>
  );
}
