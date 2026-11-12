import { StyleSheet } from 'react-native';

/** All visual values are shared across native screens and the web acceptance preview. */
export const theme = {
  color: {
    paper: '#F6F4ED',
    ink: '#202820',
    muted: '#62685C',
    green: '#455B36',
    pale: '#E8EBDD',
    paleBlue: '#E4EFF8',
    blue: '#264B66',
    line: '#D7DACD',
    warning: '#775020',
    warningBg: '#F1E8D8',
    white: '#FDFCF8',
    red: '#913C30',
  },
  font: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    bold: 'DMSans_600SemiBold',
    serif: 'Newsreader_400Regular',
  },
};

/** Mobile-first layout primitives; text stays scalable and no screen has a fixed height. */
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.color.paper },
  content: { padding: 24, paddingBottom: 32, gap: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  eyebrow: {
    fontFamily: theme.font.bold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: theme.color.muted,
  },
  title: { fontFamily: theme.font.serif, fontSize: 40, lineHeight: 44, color: theme.color.ink },
  h2: { fontFamily: theme.font.serif, fontSize: 27, lineHeight: 32, color: theme.color.ink },
  body: { fontFamily: theme.font.regular, fontSize: 15, lineHeight: 23, color: theme.color.ink },
  small: { fontFamily: theme.font.regular, fontSize: 12, lineHeight: 18, color: theme.color.muted },
  strong: { fontFamily: theme.font.bold, fontSize: 15, lineHeight: 23, color: theme.color.ink },
  divider: { height: 1, backgroundColor: theme.color.line },
  notice: {
    padding: 16,
    backgroundColor: theme.color.warningBg,
    borderLeftWidth: 3,
    borderLeftColor: theme.color.warning,
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.color.line,
    borderRadius: 4,
    padding: 14,
    color: theme.color.ink,
    fontFamily: theme.font.regular,
    fontSize: 15,
    backgroundColor: theme.color.white,
    minHeight: 50,
  },
});
