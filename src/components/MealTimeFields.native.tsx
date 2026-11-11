import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { formatMealTime, parseMealTime } from '../../shared/mealTime';
import { Button } from './Controls';
import { ui } from '../theme';

type Mode = 'date' | 'time';

export function MealTimeFields({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [date, time] = value.split(' ');
  let selected: Date;
  try {
    selected = new Date(parseMealTime(value));
  } catch {
    selected = new Date();
  }
  function select(part: Mode, next: Date): void {
    const [nextDate, nextTime] = formatMealTime(next.toISOString()).split(' ');
    const merged = part === 'date' ? `${nextDate} ${time}` : `${date} ${nextTime}`;
    try {
      parseMealTime(merged);
      onChange(merged);
    } catch {
      onChange(formatMealTime(next.toISOString()));
    }
  }
  function open(part: Mode): void {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selected,
        mode: part,
        is24Hour: true,
        minimumDate: new Date(2000, 0, 1),
        maximumDate: new Date(2100, 11, 31),
        onValueChange: (_, next) => select(part, next),
      });
    } else {
      setMode(part);
    }
  }
  return (
    <View style={{ gap: 8 }}>
      <Text style={ui.strong}>Öğün tarihi ve saati</Text>
      <Button label={`Tarih: ${date}`} secondary onPress={() => open('date')} />
      <Button label={`Saat: ${time}`} secondary onPress={() => open('time')} />
      {mode && (
        <>
          <DateTimePicker
            value={selected}
            mode={mode}
            display="spinner"
            minimumDate={new Date(2000, 0, 1)}
            maximumDate={new Date(2100, 11, 31)}
            onValueChange={(_, next) => select(mode, next)}
          />
          <Button label="Tamam" secondary onPress={() => setMode(null)} />
        </>
      )}
    </View>
  );
}
