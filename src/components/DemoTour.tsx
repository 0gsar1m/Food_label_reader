import resultImage from '../../docs/screenshots/result-summary.png';
import diaryImage from '../../docs/screenshots/meal-diary.png';
import ingredientsImage from '../../docs/screenshots/result-ingredients.png';
import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Image, Modal, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Button } from './Controls';
import { theme, ui } from '../theme';

const slides = [
  {
    title: 'Bu demoda sizi ne bekliyor?',
    text: 'Bir etiket okuyacağız, örnek günlüğe bakacağız ve ikisini bir araya getireceğiz.',
  },
  {
    title: 'Etiketi okut',
    text: 'Bir fotoğraf çek. Nazif, ürünün içindekileri ve alerjenleri göstersin.',
    image: ingredientsImage,
  },
  {
    title: 'Günlüğe göz at',
    text: 'Örnek profilde neler yenmiş, sonrasında nasıl hissedilmiş, birlikte bakalım.',
    image: diaryImage,
  },
  {
    title: 'Sana özel yorumu gör',
    text: 'Nazif etiketi günlükle karşılaştırır. Sonuç ve öneri ayrı kartlarda görünür.',
    image: resultImage,
  },
];

export function DemoDialog({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          backgroundColor: '#20282099',
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            width: '100%',
            maxWidth: 420,
            maxHeight: '100%',
            backgroundColor: theme.color.paper,
            borderRadius: 8,
            padding: 16,
            gap: 12,
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function DemoTour() {
  const [visible, setVisible] = useState(true);
  const [page, setPage] = useState(0);
  const pager = useRef<ComponentRef<typeof ScrollView>>(null);
  const { width, height } = useWindowDimensions();
  const slideWidth = Math.min(width - 32, 420) - 32;
  const close = () => setVisible(false);
  const last = page === slides.length - 1;

  return (
    <DemoDialog visible={visible} onClose={close}>
      <View style={{ height: Math.max(140, Math.min(420, height - 180)) }}>
        <ScrollView
          ref={pager}
          horizontal
          pagingEnabled
          snapToInterval={slideWidth}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={32}
          onScroll={(event) =>
            setPage(
              Math.max(
                0,
                Math.min(
                  slides.length - 1,
                  Math.round(event.nativeEvent.contentOffset.x / slideWidth),
                ),
              ),
            )
          }
        >
          {slides.map((slide, index) => (
            <View
              key={slide.title}
              accessibilityElementsHidden={page !== index}
              importantForAccessibility={page === index ? 'auto' : 'no-hide-descendants'}
              style={{ width: slideWidth, gap: 8 }}
            >
              <Text accessibilityRole="header" style={ui.h2}>
                {slide.title}
              </Text>
              <Text style={ui.body}>{slide.text}</Text>
              {slide.image && (
                <Image
                  accessible={false}
                  source={slide.image}
                  resizeMode="contain"
                  style={{ flex: 1, width: '100%' }}
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Turu geç" secondary onPress={close} style={{ flex: 1 }} />
        <Button
          label={last ? 'Turu bitir' : 'İleri'}
          onPress={() => {
            if (last) close();
            else pager.current?.scrollTo({ x: (page + 1) * slideWidth, animated: true });
          }}
          style={{ flex: 1 }}
        />
      </View>
    </DemoDialog>
  );
}
