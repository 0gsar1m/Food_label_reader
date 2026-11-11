import { View, Text } from 'react-native';
import { ui } from '../theme';

export function MealTimeFields({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [date, time] = value.split(' ');
  const [day, month, year] = date.split('.');
  return (
    <View style={{ gap: 8 }}>
      <Text style={ui.strong}>Öğün tarihi ve saati</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <input
          aria-label="Öğün tarihi"
          type="date"
          min="2000-01-01"
          max="2100-12-31"
          value={`${year}-${month}-${day}`}
          onChange={(event) => {
            if (!event.currentTarget.value) return;
            const [y, m, d] = event.currentTarget.value.split('-');
            onChange(`${d}.${m}.${y} ${time}`);
          }}
        />
        <input
          aria-label="Öğün saati"
          type="time"
          value={time}
          onChange={(event) => {
            if (event.currentTarget.value) onChange(`${date} ${event.currentTarget.value}`);
          }}
        />
      </View>
    </View>
  );
}
