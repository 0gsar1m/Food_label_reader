# Gıda Etiketi Okuyucu: faz planı

Tarih: 1 Kasım 2026. Ürün adı: **Etiket**. Hedef: Android öncelikli, iOS uyumlu gerçek React Native mobil uygulama.
Kullanıcı fazlar arasında soru ve onay istemiyor. Makul kararlar bu planda kayıt altına alınır.

## Yöntem
Eski projenin CLAUDE.md, FAZ00_KARARLAR.md, ACTIVE_CONTEXT.md, PHASE_STATUS.md ve DESIGN_SYSTEM.md dosyaları incelendi.
Karar → bağımlılık → uygulama → kanıt → durum güncelleme döngüsü korunur.
Eski projedeki web/CMS/işletme kararları bu projeye taşınmaz. MASTER_PLAN.md referansı vardı, dosya mevcut değildi.
Her fazın kabulü kodla ve çalıştırılmış doğrulamayla yapılır; kullanıcı hesabına bağlı işlemler ayrı belirtilir.

## Faz 00: kararlar ve sınırlar
Çıktı: brief, teknik kararlar, AI çalışma rehberi ve AI Slop rehberi.
Kabul: ana akış, saklanan veri, model ve demo davranışı tanımlı.

## Faz 01: mobil temel ve API
Expo Go uyumlu React Native/TypeScript, paylaşılmış Zod sözleşmesi, Node API, ortam şablonları.
Kabul: temiz kurulum, typecheck, sağlık uç noktası; API anahtarı istemcide bulunmaz.

## Faz 02: görsel sistem ve temsili ana ekran
Kırık beyaz/mürekkep/zeytin, sistem sans + editoryal serif, özgün tarama illüstrasyonu.
Kabul: 360px telefon ve geniş web önizlemesinde ana aksiyon/hiyerarşi; taşma yok.

## Faz 03: fotoğraf ve tarama akışı
Kamera, galeri, görsel önizleme, EXIF taşımadan JPEG küçültme, açık aktarım izni, iptal/yeniden deneme.
Kabul: izin reddi, boş görsel, büyük dosya, ağ kesintisi ve zaman aşımı durumları tasarlanmış.

## Faz 04: Vision analizi ve güvenilirlik
Gemini Flash tek istekle OCR + açıklama; JSON Schema + Zod; etiket kanıtı zorunlu.
İçerir/eser miktarda ayrı; okunamayan fotoğraf yeniden çekime döner; sağlık puanı yok.
Kabul: bozuk model yanıtı, enjeksiyon, eksik alerjen bildirimi ve servis hatası testleri.
Canlı model kabulü gerçek sunucu API anahtarı gerektirir; yokluğu demo ile gizlenmez.

## Faz 05: sonuç, arşiv ve alerjen tercihleri
Sade özet, içerik açıklamaları, katkılar, orijinal okunan metin, kişisel alerjen vurguları.
Geçmiş yalnız cihazda, en fazla 50 kayıt; tekil/tam silme ve paylaşma. Örnekler işaretli.
Kabul: yeniden başlatmada kalıcılık, bozuk veri toleransı, yanlış 'güvenli' mesajı olmaması.

## Faz 06: erişilebilirlik ve veri pratikleri
En az 48dp dokunma, ekran okuyucu etiketleri, büyük yazı, geri tuşu, sakin hareket.
Gizlilik ve kullanım koşulları gerçek veri akışını açıklar; hukuki işletmeci bilgisi taslak işaretli.
Kabul: hiçbir görsel diske/loga sunucuda yazılmaz; erişim token'ı varsa korumalı API; kota sınırı.

## Faz 07: kabul ve teslim
Lint, strict typecheck, anlamlı birim/API testleri, Android/iOS/web bundle ve görsel akış kabulü.
Android bulut APK profili, Docker API, kurulum ve yayın runbook'u; sır taraması.
En sonda doğrulanan kod git commit + istenen repoya normal push.
Mağaza yayını, ücretli hesap veya olmayan anahtar varmış gibi tamamlandı yazılmaz.
