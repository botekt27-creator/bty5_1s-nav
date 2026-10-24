// Sınav soruları (sadece soru metinleri). DOĞRU CEVAPLAR burada YOK, Supabase'deki answer_key tablosunda.
// Bir soruyu değiştirirseniz doğru cevabı da veritabanında güncellemek gerekir (Claude'dan isteyin).
// type: 'mcq' (çoktan seçmeli), 'tf' (doğru/yanlış), 'match' (eşleştirme), 'short' (kısa cevap)
// Her soru 5 puandır (toplam 20 soru = 100 puan).

export const POINTS_PER_QUESTION = 5

export const TF_OPTIONS = ['Doğru', 'Yanlış']

const DIJITAL_GRUP = [
  'Çevrim içi ortamlardaki varlığımızı temsil eder',
  'İnternette bıraktığımız e-posta, paylaşım ve arama geçmişi',
  'Bilgilerimizi kimlerin göreceğini belirler',
  'Dijital dünyada güvenli, etik ve sorumlu birey olmak',
]

const UZANTI_GRUP = ['Müzik (ses)', 'Fotoğraf (görüntü)', 'Düz yazı dosyası']

export const questions = [
  // Konu 1 – Bilişim Teknolojilerinin Sınıflandırılması
  {
    id: 1, topic: 1, type: 'mcq',
    text: 'Aşağıdakilerden hangisi bir yazılım örneğidir?',
    options: ['Fare', 'Resim çizme uygulaması', 'Klavye', 'Ekran'],
  },
  {
    id: 2, topic: 1, type: 'tf',
    text: 'Klavye ve ekran donanım örnekleridir.',
  },

  // Konu 2 – Etkileri ve Dijital Sağlık
  {
    id: 3, topic: 2, type: 'mcq',
    text: 'Aşağıdakilerden hangisi ergonomik olmayan bir kullanımdır?',
    options: [
      'Belirli aralıklarla mola vermek',
      'Odayı yeterince aydınlık tutmak',
      'Ekrana bir kol mesafesinde dik oturmak',
      'Kambur oturup ekrana çok yakından bakmak',
    ],
  },
  {
    id: 4, topic: 2, type: 'tf',
    text: 'Karanlıkta ekrana bakmak gözler için çok iyidir.',
  },
  {
    id: 5, topic: 2, type: 'short',
    text: 'İnsan sağlığına uygun çalışma ortamı tasarlama bilimine ________ denir.',
  },

  // Konu 3 – Dijital Vatandaşlık Uygulamaları (eşleştirme)
  {
    id: 6, topic: 3, type: 'match', group: 'dijital',
    groupTitle: 'Kavramları açıklamalarıyla eşleştir.',
    groupOptions: DIJITAL_GRUP,
    text: 'Dijital kimlik',
  },
  {
    id: 7, topic: 3, type: 'match', group: 'dijital',
    groupTitle: 'Kavramları açıklamalarıyla eşleştir.',
    groupOptions: DIJITAL_GRUP,
    text: 'Dijital ayak izi',
  },
  {
    id: 8, topic: 3, type: 'match', group: 'dijital',
    groupTitle: 'Kavramları açıklamalarıyla eşleştir.',
    groupOptions: DIJITAL_GRUP,
    text: 'Gizlilik ayarları',
  },

  // Konu 4 – Yapay Zekâ
  {
    id: 9, topic: 4, type: 'mcq',
    text: 'Aşağıdakilerden hangisi yapay zekâ örneği değildir?',
    options: ['Sesli asistan', 'Kitap', 'Yüz tanıma sistemi', 'Çevrim içi öneri sistemi'],
  },
  {
    id: 10, topic: 4, type: 'tf',
    text: 'Hesap makinesi yapay zekâ örneğidir.',
  },
  {
    id: 11, topic: 4, type: 'short',
    text: 'Sürücüsüz yol alabilen araçlara ________ araç denir.',
  },
  {
    id: 12, topic: 4, type: 'short',
    text: 'İnsanda bulunan düşünme ve öğrenme yetisine ________ denir.',
  },

  // Konu 5 – Bilgisayar Sistemlerinin Kullanımı
  {
    id: 13, topic: 5, type: 'mcq',
    text: 'Aşağıdaki dijital hafıza birimlerinden hangisi en büyüktür?',
    options: ['Terabyte', 'Kilobyte', 'Megabyte', 'Gigabyte'],
  },
  {
    id: 14, topic: 5, type: 'mcq',
    text: 'Aşağıdakilerden hangisi bir çıkış birimidir?',
    options: ['Mikrofon', 'Fare', 'Klavye', 'Hoparlör'],
  },
  {
    id: 15, topic: 5, type: 'tf',
    text: 'İşletim sistemi bir donanım parçasıdır.',
  },
  {
    id: 16, topic: 5, type: 'short',
    text: 'Dosyalarımızı internette saklamamızı sağlayan depolama yöntemine ________ depolama denir.',
  },

  // Konu 6 – Dosya ve Klasör Yönetimi
  {
    id: 17, topic: 6, type: 'match', group: 'uzanti',
    groupTitle: 'Uzantıları dosya türleriyle eşleştir.',
    groupOptions: UZANTI_GRUP,
    text: '.mp3',
  },
  {
    id: 18, topic: 6, type: 'match', group: 'uzanti',
    groupTitle: 'Uzantıları dosya türleriyle eşleştir.',
    groupOptions: UZANTI_GRUP,
    text: '.jpg',
  },
  {
    id: 19, topic: 6, type: 'tf',
    text: 'Sıkıştırılmış dosyalar daha az yer kaplar.',
  },
  {
    id: 20, topic: 6, type: 'short',
    text: 'Bir dosyanın adını değiştirmeye ________ denir.',
  },
]
