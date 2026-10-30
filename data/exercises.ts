export type SourceType = 'Umum' | 'Teks klasik';
export type WordKind = 'Isim' | 'Fi‘il' | 'Huruf';
export type CaseState = 'Marfū‘' | 'Manṣūb' | 'Majrūr' | 'Majzūm' | 'Mabnī' | 'Tidak berlaku';
export type Sign = 'Ḍammah' | 'Fatḥah' | 'Kasrah' | 'Sukūn' | 'Alif' | 'Wāw' | 'Yā’' | 'Mabnī' | 'Tidak berlaku';
export type Position = string;
export interface WordAnalysis { token: string; kind: WordKind; position: Position; state: CaseState; sign: Sign; explanation: string; fullIrab: string }
export interface Exercise { id: string; source: SourceType; title: string; sentence: string; translation: string; topic: string; context: string; words: WordAnalysis[]; reference?: string }
const baseExercises: Exercise[] = [
  {
    "id": "u01",
    "source": "Umum",
    "title": "Jumlah fi‘liyyah: fā‘il dan maf‘ūl",
    "sentence": "كَتَبَ الطَّالِبُ الدَّرْسَ",
    "translation": "Siswa itu menulis pelajaran.",
    "topic": "Fi‘il, fā‘il, maf‘ūl bih",
    "context": "Kalimat verbal dasar.",
    "words": [
      {
        "token": "كَتَبَ",
        "kind": "Fi‘il",
        "position": "Fi‘il māḍī",
        "state": "Mabnī",
        "sign": "Fatḥah",
        "explanation": "Fi‘il māḍī menunjukkan pekerjaan lampau dan mabnī di atas fatḥah.",
        "fullIrab": "كَتَبَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ."
      },
      {
        "token": "الطَّالِبُ",
        "kind": "Isim",
        "position": "Fā‘il",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pelaku dari pekerjaan menulis; fā‘il marfū‘ dengan ḍammah.",
        "fullIrab": "الطَّالِبُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ."
      },
      {
        "token": "الدَّرْسَ",
        "kind": "Isim",
        "position": "Maf‘ūl bih",
        "state": "Manṣūb",
        "sign": "Fatḥah",
        "explanation": "Objek yang ditulis; maf‘ūl bih berstatus manṣūb.",
        "fullIrab": "الدَّرْسَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ الظَّاهِرَةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u02",
    "source": "Umum",
    "title": "Jumlah ismiyyah: mubtada’ dan khabar",
    "sentence": "الْعِلْمُ نَافِعٌ",
    "translation": "Ilmu itu bermanfaat.",
    "topic": "Mubtada’ dan khabar",
    "context": "Khabar memberi informasi tentang mubtada’.",
    "words": [
      {
        "token": "الْعِلْمُ",
        "kind": "Isim",
        "position": "Mubtada’",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pokok pembicaraan dalam jumlah ismiyyah.",
        "fullIrab": "الْعِلْمُ: مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      },
      {
        "token": "نَافِعٌ",
        "kind": "Isim",
        "position": "Khabar",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Informasi tentang mubtada’ dan berstatus marfū‘.",
        "fullIrab": "نَافِعٌ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u03",
    "source": "Umum",
    "title": "Na‘t dan man‘ūt",
    "sentence": "جَاءَ الطَّالِبُ الْمُجْتَهِدُ",
    "translation": "Siswa yang rajin itu telah datang.",
    "topic": "Na‘t–man‘ūt",
    "context": "Na‘t mengikuti man‘ūt dalam i‘rab dan kesesuaian lainnya.",
    "words": [
      {
        "token": "جَاءَ",
        "kind": "Fi‘il",
        "position": "Fi‘il māḍī",
        "state": "Mabnī",
        "sign": "Fatḥah",
        "explanation": "Menunjukkan peristiwa lampau.",
        "fullIrab": "جَاءَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ."
      },
      {
        "token": "الطَّالِبُ",
        "kind": "Isim",
        "position": "Fā‘il",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pelaku dari جَاءَ.",
        "fullIrab": "الطَّالِبُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      },
      {
        "token": "الْمُجْتَهِدُ",
        "kind": "Isim",
        "position": "Na‘t",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Sifat yang mengikuti الطَّالِبُ; karena man‘ūt marfū‘, na‘t juga marfū‘.",
        "fullIrab": "الْمُجْتَهِدُ: نَعْتٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u04",
    "source": "Umum",
    "title": "Iḍāfah: muḍāf dan muḍāf ilaih",
    "sentence": "كِتَابُ الطَّالِبِ جَدِيدٌ",
    "translation": "Buku siswa itu baru.",
    "topic": "Muḍāf–muḍāf ilaih",
    "context": "Muḍāf ilaih selalu majrūr; kata pertama menjadi mubtada’.",
    "words": [
      {
        "token": "كِتَابُ",
        "kind": "Isim",
        "position": "Mubtada’",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Muḍāf yang menjadi mubtada’ dalam kalimat.",
        "fullIrab": "كِتَابُ: مُبْتَدَأٌ مَرْفُوعٌ وَهُوَ مُضَافٌ."
      },
      {
        "token": "الطَّالِبِ",
        "kind": "Isim",
        "position": "Muḍāf ilaih",
        "state": "Majrūr",
        "sign": "Kasrah",
        "explanation": "Menjadi muḍāf ilaih dan berstatus majrūr.",
        "fullIrab": "الطَّالِبِ: مُضَافٌ إِلَيْهِ مَجْرُورٌ وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ."
      },
      {
        "token": "جَدِيدٌ",
        "kind": "Isim",
        "position": "Khabar",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Khabar yang menerangkan buku.",
        "fullIrab": "جَدِيدٌ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u05",
    "source": "Umum",
    "title": "Huruf jar dan isim majrūr",
    "sentence": "ذَهَبْتُ إِلَى الْمَدْرَسَةِ",
    "translation": "Aku pergi ke sekolah.",
    "topic": "Jar–majrūr",
    "context": "Huruf إِلَى menyebabkan isim sesudahnya majrūr.",
    "words": [
      {
        "token": "ذَهَبْتُ",
        "kind": "Fi‘il",
        "position": "Fi‘il māḍī",
        "state": "Mabnī",
        "sign": "Sukūn",
        "explanation": "Fi‘il lampau yang bersambung dengan tā’ fā‘il.",
        "fullIrab": "ذَهَبْتُ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى السُّكُونِ."
      },
      {
        "token": "إِلَى",
        "kind": "Huruf",
        "position": "Huruf jar",
        "state": "Tidak berlaku",
        "sign": "Tidak berlaku",
        "explanation": "Huruf jar yang menjadikan isim setelahnya majrūr.",
        "fullIrab": "إِلَى: حَرْفُ جَرٍّ."
      },
      {
        "token": "الْمَدْرَسَةِ",
        "kind": "Isim",
        "position": "Isim majrūr",
        "state": "Majrūr",
        "sign": "Kasrah",
        "explanation": "Isim setelah إِلَى; tanda jarnya kasrah.",
        "fullIrab": "الْمَدْرَسَةِ: اسْمٌ مَجْرُورٌ بِإِلَى وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u06",
    "source": "Umum",
    "title": "Inna wa akhawātuhā",
    "sentence": "إِنَّ الطَّالِبَ مُجْتَهِدٌ",
    "translation": "Sesungguhnya siswa itu rajin.",
    "topic": "Inna dan isim-khabarnya",
    "context": "إِنَّ menashabkan isim dan merafa‘kan khabar.",
    "words": [
      {
        "token": "إِنَّ",
        "kind": "Huruf",
        "position": "Huruf nāsikh",
        "state": "Tidak berlaku",
        "sign": "Tidak berlaku",
        "explanation": "Huruf taukid dan naṣb yang bekerja pada isim dan khabar.",
        "fullIrab": "إِنَّ: حَرْفُ تَوْكِيدٍ وَنَصْبٍ."
      },
      {
        "token": "الطَّالِبَ",
        "kind": "Isim",
        "position": "Isim إنّ",
        "state": "Manṣūb",
        "sign": "Fatḥah",
        "explanation": "Isim إِنَّ berstatus manṣūb dengan fatḥah.",
        "fullIrab": "الطَّالِبَ: اسْمُ إِنَّ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ."
      },
      {
        "token": "مُجْتَهِدٌ",
        "kind": "Isim",
        "position": "Khabar إنّ",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Khabar إِنَّ tetap marfū‘.",
        "fullIrab": "مُجْتَهِدٌ: خَبَرُ إِنَّ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u07",
    "source": "Umum",
    "title": "Kāna wa akhawātuhā",
    "sentence": "كَانَ الْجَوُّ جَمِيلًا",
    "translation": "Cuacanya dahulu indah.",
    "topic": "Kāna dan isim-khabarnya",
    "context": "كَانَ merafa‘kan isim dan menashabkan khabar.",
    "words": [
      {
        "token": "كَانَ",
        "kind": "Fi‘il",
        "position": "Fi‘il nāqiṣ",
        "state": "Mabnī",
        "sign": "Fatḥah",
        "explanation": "Fi‘il nāqiṣ yang mengubah susunan mubtada’-khabar.",
        "fullIrab": "كَانَ: فِعْلٌ مَاضٍ نَاقِصٌ مَبْنِيٌّ عَلَى الْفَتْحِ."
      },
      {
        "token": "الْجَوُّ",
        "kind": "Isim",
        "position": "Isim كان",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Isim كَانَ tetap marfū‘.",
        "fullIrab": "الْجَوُّ: اسْمُ كَانَ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      },
      {
        "token": "جَمِيلًا",
        "kind": "Isim",
        "position": "Khabar كان",
        "state": "Manṣūb",
        "sign": "Fatḥah",
        "explanation": "Khabar كَانَ berstatus manṣūb.",
        "fullIrab": "جَمِيلًا: خَبَرُ كَانَ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u08",
    "source": "Umum",
    "title": "Fi‘il muḍāri‘ marfū‘",
    "sentence": "يَكْتُبُ الْوَلَدُ",
    "translation": "Anak laki-laki itu sedang menulis.",
    "topic": "Fi‘il muḍāri‘",
    "context": "Fi‘il muḍāri‘ tidak didahului nāṣib atau jāzim pada contoh ini.",
    "words": [
      {
        "token": "يَكْتُبُ",
        "kind": "Fi‘il",
        "position": "Fi‘il muḍāri‘",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Fi‘il muḍāri‘ marfū‘ karena tidak didahului amil naṣb atau jazm.",
        "fullIrab": "يَكْتُبُ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      },
      {
        "token": "الْوَلَدُ",
        "kind": "Isim",
        "position": "Fā‘il",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pelaku dari يَكْتُبُ.",
        "fullIrab": "الْوَلَدُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u09",
    "source": "Umum",
    "title": "Fi‘il muḍāri‘ manṣūb setelah لن",
    "sentence": "لَنْ يُهْمِلَ الطَّالِبُ وَاجِبَهُ",
    "translation": "Siswa itu tidak akan mengabaikan tugasnya.",
    "topic": "Fi‘il muḍāri‘ manṣūb",
    "context": "لَنْ menashabkan fi‘il muḍāri‘ setelahnya.",
    "words": [
      {
        "token": "لَنْ",
        "kind": "Huruf",
        "position": "Huruf naṣb",
        "state": "Tidak berlaku",
        "sign": "Tidak berlaku",
        "explanation": "Huruf naṣb dan penafian untuk masa depan.",
        "fullIrab": "لَنْ: حَرْفُ نَصْبٍ وَنَفْيٍ وَاسْتِقْبَالٍ."
      },
      {
        "token": "يُهْمِلَ",
        "kind": "Fi‘il",
        "position": "Fi‘il muḍāri‘",
        "state": "Manṣūb",
        "sign": "Fatḥah",
        "explanation": "Fi‘il muḍāri‘ menjadi manṣūb karena didahului لَنْ.",
        "fullIrab": "يُهْمِلَ: فِعْلٌ مُضَارِعٌ مَنْصُوبٌ بِلَنْ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ."
      },
      {
        "token": "الطَّالِبُ",
        "kind": "Isim",
        "position": "Fā‘il",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pelaku dari يُهْمِلَ.",
        "fullIrab": "الطَّالِبُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ"
      },
      {
        "token": "وَاجِبَهُ",
        "kind": "Isim",
        "position": "Maf‘ūl bih",
        "state": "Manṣūb",
        "sign": "Fatḥah",
        "explanation": "Objek dari يُهْمِلَ; dhamir ـهُ menjadi muḍāf ilaih.",
        "fullIrab": "وَاجِبَهُ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَهُوَ مُضَافٌ وَالْهَاءُ مُضَافٌ إِلَيْهِ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u10",
    "source": "Umum",
    "title": "Fi‘il muḍāri‘ majzūm setelah لم",
    "sentence": "لَمْ يَذْهَبْ مُحَمَّدٌ",
    "translation": "Muhammad belum pergi.",
    "topic": "Fi‘il muḍāri‘ majzūm",
    "context": "لَمْ menjazmkan fi‘il muḍāri‘.",
    "words": [
      {
        "token": "لَمْ",
        "kind": "Huruf",
        "position": "Huruf jazm",
        "state": "Tidak berlaku",
        "sign": "Tidak berlaku",
        "explanation": "Huruf nafy, qalb, dan jazm.",
        "fullIrab": "لَمْ: حَرْفُ نَفْيٍ وَجَزْمٍ وَقَلْبٍ."
      },
      {
        "token": "يَذْهَبْ",
        "kind": "Fi‘il",
        "position": "Fi‘il muḍāri‘",
        "state": "Majzūm",
        "sign": "Sukūn",
        "explanation": "Fi‘il muḍāri‘ majzūm karena didahului لَمْ.",
        "fullIrab": "يَذْهَبْ: فِعْلٌ مُضَارِعٌ مَجْزُومٌ بِلَمْ وَعَلَامَةُ جَزْمِهِ السُّكُونُ."
      },
      {
        "token": "مُحَمَّدٌ",
        "kind": "Isim",
        "position": "Fā‘il",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pelaku dari يَذْهَبْ.",
        "fullIrab": "مُحَمَّدٌ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u11",
    "source": "Umum",
    "title": "Maf‘ūl fīh (ẓarf makān)",
    "sentence": "جَلَسَ الطَّالِبُ أَمَامَ الْمُعَلِّمِ",
    "translation": "Siswa duduk di depan guru.",
    "topic": "Ẓarf makān",
    "context": "أَمَامَ menunjukkan keterangan tempat dan menjadi muḍāf.",
    "words": [
      {
        "token": "جَلَسَ",
        "kind": "Fi‘il",
        "position": "Fi‘il māḍī",
        "state": "Mabnī",
        "sign": "Fatḥah",
        "explanation": "Fi‘il lampau.",
        "fullIrab": "جَلَسَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ."
      },
      {
        "token": "الطَّالِبُ",
        "kind": "Isim",
        "position": "Fā‘il",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pelaku dari جَلَسَ.",
        "fullIrab": "الطَّالِبُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      },
      {
        "token": "أَمَامَ",
        "kind": "Isim",
        "position": "Ẓarf makān",
        "state": "Manṣūb",
        "sign": "Fatḥah",
        "explanation": "Keterangan tempat yang berstatus manṣūb dan menjadi muḍāf.",
        "fullIrab": "أَمَامَ: ظَرْفُ مَكَانٍ مَنْصُوبٌ وَهُوَ مُضَافٌ."
      },
      {
        "token": "الْمُعَلِّمِ",
        "kind": "Isim",
        "position": "Muḍāf ilaih",
        "state": "Majrūr",
        "sign": "Kasrah",
        "explanation": "Muḍāf ilaih setelah أَمَامَ.",
        "fullIrab": "الْمُعَلِّمِ: مُضَافٌ إِلَيْهِ مَجْرُورٌ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u12",
    "source": "Umum",
    "title": "Ḥāl",
    "sentence": "جَاءَ الطَّالِبُ مُبْتَسِمًا",
    "translation": "Siswa itu datang sambil tersenyum.",
    "topic": "Ḥāl",
    "context": "مُبْتَسِمًا menerangkan keadaan pelaku ketika datang.",
    "words": [
      {
        "token": "جَاءَ",
        "kind": "Fi‘il",
        "position": "Fi‘il māḍī",
        "state": "Mabnī",
        "sign": "Fatḥah",
        "explanation": "Menunjukkan kejadian lampau.",
        "fullIrab": "جَاءَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ."
      },
      {
        "token": "الطَّالِبُ",
        "kind": "Isim",
        "position": "Fā‘il",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pelaku dari جَاءَ.",
        "fullIrab": "الطَّالِبُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ."
      },
      {
        "token": "مُبْتَسِمًا",
        "kind": "Isim",
        "position": "Ḥāl",
        "state": "Manṣūb",
        "sign": "Fatḥah",
        "explanation": "Menerangkan keadaan pelaku saat peristiwa terjadi.",
        "fullIrab": "مُبْتَسِمًا: حَالٌ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ."
      }
    ],
    "reference": ""
  },
  {
    "id": "u13",
    "source": "Teks klasik",
    "title": "Jumlah ismiyyah: khabar mufrad",
    "sentence": "الصَّبْرُ مِفْتَاحُ الْفَرَجِ",
    "translation": "Kesabaran adalah kunci kelapangan.",
    "topic": "Mubtada’, khabar, iḍāfah",
    "context": "Contoh susunan yang lazim dijumpai dalam nasihat dan teks klasik; bukan kutipan kitab tertentu.",
    "words": [
      {
        "token": "الصَّبْرُ",
        "kind": "Isim",
        "position": "Mubtada’",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pokok pembicaraan kalimat.",
        "fullIrab": "الصَّبْرُ: مُبْتَدَأٌ مَرْفُوعٌ."
      },
      {
        "token": "مِفْتَاحُ",
        "kind": "Isim",
        "position": "Khabar",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Khabar dan sekaligus muḍāf.",
        "fullIrab": "مِفْتَاحُ: خَبَرٌ مَرْفُوعٌ وَهُوَ مُضَافٌ."
      },
      {
        "token": "الْفَرَجِ",
        "kind": "Isim",
        "position": "Muḍāf ilaih",
        "state": "Majrūr",
        "sign": "Kasrah",
        "explanation": "Muḍāf ilaih dari مِفْتَاحُ.",
        "fullIrab": "الْفَرَجِ: مُضَافٌ إِلَيْهِ مَجْرُورٌ."
      }
    ],
    "reference": ""
  },
  {
    "id": "c14",
    "source": "Teks klasik",
    "title": "Na‘t man‘ūt majrūr",
    "sentence": "مَرَرْتُ بِطَالِبٍ مُجْتَهِدٍ",
    "translation": "Aku melewati seorang siswa yang rajin.",
    "topic": "Huruf jar, man‘ūt, na‘t",
    "context": "Na‘t mengikuti man‘ūt dalam status i‘rab; keduanya majrūr di sini.",
    "words": [
      {
        "token": "مَرَرْتُ",
        "kind": "Fi‘il",
        "position": "Fi‘il māḍī",
        "state": "Mabnī",
        "sign": "Sukūn",
        "explanation": "Fi‘il lampau yang bersambung dengan tā’ fā‘il.",
        "fullIrab": "مَرَرْتُ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى السُّكُونِ."
      },
      {
        "token": "بِ",
        "kind": "Huruf",
        "position": "Huruf jar",
        "state": "Tidak berlaku",
        "sign": "Tidak berlaku",
        "explanation": "Bā’ adalah huruf jar.",
        "fullIrab": "بِ: حَرْفُ جَرٍّ."
      },
      {
        "token": "طَالِبٍ",
        "kind": "Isim",
        "position": "Isim majrūr",
        "state": "Majrūr",
        "sign": "Kasrah",
        "explanation": "Isim setelah bā’ menjadi majrūr.",
        "fullIrab": "طَالِبٍ: اسْمٌ مَجْرُورٌ بِالْبَاءِ."
      },
      {
        "token": "مُجْتَهِدٍ",
        "kind": "Isim",
        "position": "Na‘t",
        "state": "Majrūr",
        "sign": "Kasrah",
        "explanation": "Na‘t mengikuti man‘ūt طَالِبٍ yang majrūr.",
        "fullIrab": "مُجْتَهِدٍ: نَعْتٌ مَجْرُورٌ."
      }
    ],
    "reference": ""
  },
  {
    "id": "c15",
    "source": "Teks klasik",
    "title": "‘Aṭaf",
    "sentence": "حَضَرَ زَيْدٌ وَعَمْرٌو",
    "translation": "Zaid dan Amr telah hadir.",
    "topic": "‘Aṭaf dan ma‘ṭūf",
    "context": "Ma‘ṭūf mengikuti ma‘ṭūf ‘alaih dalam i‘rab.",
    "words": [
      {
        "token": "حَضَرَ",
        "kind": "Fi‘il",
        "position": "Fi‘il māḍī",
        "state": "Mabnī",
        "sign": "Fatḥah",
        "explanation": "Fi‘il lampau.",
        "fullIrab": "حَضَرَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ."
      },
      {
        "token": "زَيْدٌ",
        "kind": "Isim",
        "position": "Fā‘il",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Pelaku dari حَضَرَ.",
        "fullIrab": "زَيْدٌ: فَاعِلٌ مَرْفُوعٌ."
      },
      {
        "token": "وَ",
        "kind": "Huruf",
        "position": "Huruf ‘aṭaf",
        "state": "Tidak berlaku",
        "sign": "Tidak berlaku",
        "explanation": "Menghubungkan kata dengan kata sebelumnya.",
        "fullIrab": "وَ: حَرْفُ عَطْفٍ."
      },
      {
        "token": "عَمْرٌو",
        "kind": "Isim",
        "position": "Ma‘ṭūf",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Mengikuti زَيْدٌ dalam i‘rab.",
        "fullIrab": "عَمْرٌو: مَعْطُوفٌ مَرْفُوعٌ."
      }
    ],
    "reference": ""
  },
  {
    "id": "c16",
    "source": "Teks klasik",
    "title": "Badal",
    "sentence": "جَاءَ أَخُوكَ زَيْدٌ",
    "translation": "Saudaramu, Zaid, telah datang.",
    "topic": "Badal",
    "context": "Pada contoh ini زَيْدٌ dapat dianalisis sebagai badal dari أَخُوكَ.",
    "words": [
      {
        "token": "جَاءَ",
        "kind": "Fi‘il",
        "position": "Fi‘il māḍī",
        "state": "Mabnī",
        "sign": "Fatḥah",
        "explanation": "Fi‘il lampau.",
        "fullIrab": "جَاءَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ."
      },
      {
        "token": "أَخُوكَ",
        "kind": "Isim",
        "position": "Fā‘il",
        "state": "Marfū‘",
        "sign": "Wāw",
        "explanation": "Termasuk al-asmā’ al-khamsah; marfū‘ dengan wāw dan menjadi muḍāf.",
        "fullIrab": "أَخُوكَ: فَاعِلٌ مَرْفُوعٌ بِالْوَاوِ وَهُوَ مُضَافٌ."
      },
      {
        "token": "زَيْدٌ",
        "kind": "Isim",
        "position": "Badal",
        "state": "Marfū‘",
        "sign": "Ḍammah",
        "explanation": "Badal yang mengikuti kata sebelumnya dalam i‘rab.",
        "fullIrab": "زَيْدٌ: بَدَلٌ مَرْفُوعٌ."
      }
    ],
    "reference": ""
  },
];
type CompactWord = [string, WordKind, string, CaseState, Sign, string, string];
function makeExercise(id: string, title: string, sentence: string, translation: string, topic: string, words: CompactWord[], source: SourceType = 'Umum', reference = ''): Exercise {
  return { id, source, title, sentence, translation, topic, context: `Latihan tambahan untuk materi ${topic}. Analisis setiap kata berdasarkan fungsi dan tanda i‘rabnya.`, reference,
    words: words.map(([token, kind, position, state, sign, explanation, fullIrab]) => ({token, kind, position, state, sign, explanation, fullIrab})) };
}
const extraExercises: Exercise[] = [
 makeExercise('x21','Mubtada’ dan khabar: latihan 2','الْبَيْتُ كَبِيرٌ','Rumah itu besar.','Mubtada’ dan khabar',[
  ['الْبَيْتُ','Isim','Mubtada’','Marfū‘','Ḍammah','Pokok pembicaraan; mubtada’ marfū‘ dengan ḍammah.','الْبَيْتُ: مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['كَبِيرٌ','Isim','Khabar','Marfū‘','Ḍammah','Informasi tentang mubtada’; khabar marfū‘.','كَبِيرٌ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x22','Mubtada’ dan khabar: latihan 3','الطَّعَامُ لَذِيذٌ','Makanan itu lezat.','Mubtada’ dan khabar',[
  ['الطَّعَامُ','Isim','Mubtada’','Marfū‘','Ḍammah','Isim yang menjadi pokok pembicaraan.','الطَّعَامُ: مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['لَذِيذٌ','Isim','Khabar','Marfū‘','Ḍammah','Khabar yang menerangkan الطَّعَامُ.','لَذِيذٌ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x23','Mubtada’ dan khabar: latihan 4','الْجَوُّ بَارِدٌ','Cuaca itu dingin.','Mubtada’ dan khabar',[
  ['الْجَوُّ','Isim','Mubtada’','Marfū‘','Ḍammah','Mubtada’ marfū‘ dengan tanda ḍammah.','الْجَوُّ: مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['بَارِدٌ','Isim','Khabar','Marfū‘','Ḍammah','Khabar yang memberikan informasi tentang cuaca.','بَارِدٌ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x24','Na‘t–man‘ūt: latihan 2','قَرَأْتُ كِتَابًا مُفِيدًا','Aku membaca buku yang bermanfaat.','Na‘t–man‘ūt',[
  ['قَرَأْتُ','Fi‘il','Fi‘il māḍī','Mabnī','Sukūn','Fi‘il māḍī yang bersambung dengan tā’ fā‘il, mabnī ‘alā as-sukūn.','قَرَأْتُ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى السُّكُونِ وَالتَّاءُ فَاعِلٌ.'],['كِتَابًا','Isim','Maf‘ūl bih','Manṣūb','Fatḥah','Objek yang dibaca; maf‘ūl bih manṣūb.','كِتَابًا: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.'],['مُفِيدًا','Isim','Na‘t','Manṣūb','Fatḥah','Sifat mengikuti man‘ūt كِتَابًا dalam status i‘rab.','مُفِيدًا: نَعْتٌ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x25','Na‘t–man‘ūt: latihan 3','مَرَرْتُ بِطَالِبٍ مُجْتَهِدٍ','Aku melewati siswa yang rajin.','Na‘t–man‘ūt',[
  ['مَرَرْتُ','Fi‘il','Fi‘il māḍī','Mabnī','Sukūn','Fi‘il lampau yang bersambung dengan tā’ fā‘il.','مَرَرْتُ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى السُّكُونِ وَالتَّاءُ فَاعِلٌ.'],['بِ','Huruf','Huruf jar','Tidak berlaku','Tidak berlaku','Bā’ adalah huruf jar.','بِ: حَرْفُ جَرٍّ.'],['طَالِبٍ','Isim','Isim majrūr','Majrūr','Kasrah','Isim setelah huruf jar bā’.','طَالِبٍ: اسْمٌ مَجْرُورٌ بِالْبَاءِ وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ.'],['مُجْتَهِدٍ','Isim','Na‘t','Majrūr','Kasrah','Na‘t mengikuti man‘ūt طَالِبٍ yang majrūr.','مُجْتَهِدٍ: نَعْتٌ مَجْرُورٌ وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ.']]),
 makeExercise('x26','Na‘t–man‘ūt: latihan 4','هَذِهِ بِنْتٌ صَالِحَةٌ','Ini seorang anak perempuan yang salehah.','Na‘t–man‘ūt',[
  ['هَذِهِ','Isim','Isim isyārah','Mabnī','Mabnī','Kata tunjuk yang mabnī dan berkedudukan sebagai mubtada’.','هَذِهِ: اسْمُ إِشَارَةٍ مَبْنِيٌّ فِي مَحَلِّ رَفْعٍ مُبْتَدَأٌ.'],['بِنْتٌ','Isim','Khabar','Marfū‘','Ḍammah','Khabar marfū‘ untuk هَذِهِ.','بِنْتٌ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['صَالِحَةٌ','Isim','Na‘t','Marfū‘','Ḍammah','Sifat untuk بِنْتٌ dan mengikuti i‘rabnya.','صَالِحَةٌ: نَعْتٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x27','Iḍāfah: latihan 2','بَابُ الْمَسْجِدِ مَفْتُوحٌ','Pintu masjid itu terbuka.','Muḍāf–muḍāf ilaih',[
  ['بَابُ','Isim','Mubtada’','Marfū‘','Ḍammah','Mubtada’ sekaligus muḍāf.','بَابُ: مُبْتَدَأٌ مَرْفُوعٌ وَهُوَ مُضَافٌ.'],['الْمَسْجِدِ','Isim','Muḍāf ilaih','Majrūr','Kasrah','Muḍāf ilaih selalu majrūr.','الْمَسْجِدِ: مُضَافٌ إِلَيْهِ مَجْرُورٌ وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ.'],['مَفْتُوحٌ','Isim','Khabar','Marfū‘','Ḍammah','Khabar yang menerangkan بَابُ الْمَسْجِدِ.','مَفْتُوحٌ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x28','Iḍāfah: latihan 3','قَلَمُ الْمُعَلِّمِ جَدِيدٌ','Pena guru itu baru.','Muḍāf–muḍāf ilaih',[
  ['قَلَمُ','Isim','Mubtada’','Marfū‘','Ḍammah','Muḍāf yang menjadi mubtada’.','قَلَمُ: مُبْتَدَأٌ مَرْفُوعٌ وَهُوَ مُضَافٌ.'],['الْمُعَلِّمِ','Isim','Muḍāf ilaih','Majrūr','Kasrah','Muḍāf ilaih yang majrūr.','الْمُعَلِّمِ: مُضَافٌ إِلَيْهِ مَجْرُورٌ وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ.'],['جَدِيدٌ','Isim','Khabar','Marfū‘','Ḍammah','Khabar marfū‘.','جَدِيدٌ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x29','Iḍāfah: latihan 4','نُورُ الْعِلْمِ قَوِيٌّ','Cahaya ilmu itu kuat.','Muḍāf–muḍāf ilaih',[
  ['نُورُ','Isim','Mubtada’','Marfū‘','Ḍammah','Mubtada’ dan muḍāf.','نُورُ: مُبْتَدَأٌ مَرْفُوعٌ وَهُوَ مُضَافٌ.'],['الْعِلْمِ','Isim','Muḍāf ilaih','Majrūr','Kasrah','Muḍāf ilaih berstatus majrūr.','الْعِلْمِ: مُضَافٌ إِلَيْهِ مَجْرُورٌ وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ.'],['قَوِيٌّ','Isim','Khabar','Marfū‘','Ḍammah','Khabar untuk نُورُ الْعِلْمِ.','قَوِيٌّ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x30','Fā‘il dan maf‘ūl bih: latihan 2','فَتَحَ الْوَلَدُ الْبَابَ','Anak laki-laki itu membuka pintu.','Fi‘il, fā‘il, maf‘ūl bih',[
  ['فَتَحَ','Fi‘il','Fi‘il māḍī','Mabnī','Fatḥah','Fi‘il lampau mabnī di atas fatḥah.','فَتَحَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['الْوَلَدُ','Isim','Fā‘il','Marfū‘','Ḍammah','Pelaku pekerjaan membuka.','الْوَلَدُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['الْبَابَ','Isim','Maf‘ūl bih','Manṣūb','Fatḥah','Objek yang dibuka.','الْبَابَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x31','Fā‘il dan maf‘ūl bih: latihan 3','حَفِظَ الطَّالِبُ الْقَاعِدَةَ','Siswa itu menghafal kaidah.','Fi‘il, fā‘il, maf‘ūl bih',[
  ['حَفِظَ','Fi‘il','Fi‘il māḍī','Mabnī','Fatḥah','Fi‘il māḍī mabnī ‘alā al-fatḥ.','حَفِظَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['الطَّالِبُ','Isim','Fā‘il','Marfū‘','Ḍammah','Pelaku yang menghafal.','الطَّالِبُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['الْقَاعِدَةَ','Isim','Maf‘ūl bih','Manṣūb','Fatḥah','Objek yang dihafal.','الْقَاعِدَةَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x32','Fā‘il dan maf‘ūl bih: latihan 4','غَسَلَتْ فَاطِمَةُ الثَّوْبَ','Fatimah mencuci pakaian.','Fi‘il, fā‘il, maf‘ūl bih',[
  ['غَسَلَتْ','Fi‘il','Fi‘il māḍī','Mabnī','Fatḥah','Fi‘il māḍī; tā’ ta’nīts adalah penanda feminin.','غَسَلَتْ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ وَالتَّاءُ لِلتَّأْنِيثِ.'],['فَاطِمَةُ','Isim','Fā‘il','Marfū‘','Ḍammah','Pelaku pekerjaan mencuci.','فَاطِمَةُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['الثَّوْبَ','Isim','Maf‘ūl bih','Manṣūb','Fatḥah','Objek yang dicuci.','الثَّوْبَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x33','Inna wa akhawātuhā: latihan 2','إِنَّ الْعِلْمَ نُورٌ','Sesungguhnya ilmu adalah cahaya.','Inna dan isim-khabarnya',[
  ['إِنَّ','Huruf','Huruf nāsikh','Tidak berlaku','Tidak berlaku','Huruf taukid dan naṣb.','إِنَّ: حَرْفُ تَوْكِيدٍ وَنَصْبٍ.'],['الْعِلْمَ','Isim','Isim إنّ','Manṣūb','Fatḥah','Isim إنّ berstatus manṣūb.','الْعِلْمَ: اسْمُ إِنَّ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.'],['نُورٌ','Isim','Khabar إنّ','Marfū‘','Ḍammah','Khabar إنّ berstatus marfū‘.','نُورٌ: خَبَرُ إِنَّ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x34','Inna wa akhawātuhā: latihan 3','لَعَلَّ الْمَرِيضَ سَالِمٌ','Semoga orang sakit itu selamat.','Inna dan isim-khabarnya',[
  ['لَعَلَّ','Huruf','Huruf nāsikh','Tidak berlaku','Tidak berlaku','لعلّ termasuk saudara إِنَّ; menunjukkan harapan.','لَعَلَّ: حَرْفُ تَرَجٍّ وَنَصْبٍ.'],['الْمَرِيضَ','Isim','Isim لعلّ','Manṣūb','Fatḥah','Isim لعلّ manṣūb.','الْمَرِيضَ: اسْمُ لَعَلَّ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.'],['سَالِمٌ','Isim','Khabar لعلّ','Marfū‘','Ḍammah','Khabar لعلّ marfū‘.','سَالِمٌ: خَبَرُ لَعَلَّ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x35','Inna wa akhawātuhā: latihan 4','كَأَنَّ الْقَمَرَ مِصْبَاحٌ','Seakan-akan bulan itu lampu.','Inna dan isim-khabarnya',[
  ['كَأَنَّ','Huruf','Huruf nāsikh','Tidak berlaku','Tidak berlaku','كَأَنَّ termasuk saudara إنّ dan bermakna seakan-akan.','كَأَنَّ: حَرْفُ تَشْبِيهٍ وَنَصْبٍ.'],['الْقَمَرَ','Isim','Isim كأنّ','Manṣūb','Fatḥah','Isim كأنّ berstatus manṣūb.','الْقَمَرَ: اسْمُ كَأَنَّ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.'],['مِصْبَاحٌ','Isim','Khabar كأنّ','Marfū‘','Ḍammah','Khabar كأنّ berstatus marfū‘.','مِصْبَاحٌ: خَبَرُ كَأَنَّ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x36','Kāna wa akhawātuhā: latihan 2','كَانَ الطَّرِيقُ طَوِيلًا','Jalan itu dahulu panjang.','Kāna dan isim-khabarnya',[
  ['كَانَ','Fi‘il','Fi‘il nāqiṣ','Mabnī','Fatḥah','Kāna adalah fi‘il nāqiṣ yang merafa‘kan isim dan menashabkan khabar.','كَانَ: فِعْلٌ مَاضٍ نَاقِصٌ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['الطَّرِيقُ','Isim','Isim كان','Marfū‘','Ḍammah','Isim كان tetap marfū‘.','الطَّرِيقُ: اسْمُ كَانَ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['طَوِيلًا','Isim','Khabar كان','Manṣūb','Fatḥah','Khabar كان berstatus manṣūb.','طَوِيلًا: خَبَرُ كَانَ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x37','Kāna wa akhawātuhā: latihan 3','أَصْبَحَ الْجَوُّ صَافِيًا','Cuaca menjadi cerah pada pagi hari.','Kāna dan isim-khabarnya',[
  ['أَصْبَحَ','Fi‘il','Fi‘il nāqiṣ','Mabnī','Fatḥah','أصبح termasuk saudara كان dan menunjukkan keadaan pada pagi hari.','أَصْبَحَ: فِعْلٌ مَاضٍ نَاقِصٌ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['الْجَوُّ','Isim','Isim أصبح','Marfū‘','Ḍammah','Isim أصبح marfū‘.','الْجَوُّ: اسْمُ أَصْبَحَ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['صَافِيًا','Isim','Khabar أصبح','Manṣūb','Fatḥah','Khabar أصبح manṣūb.','صَافِيًا: خَبَرُ أَصْبَحَ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x38','Kāna wa akhawātuhā: latihan 4','لَيْسَ الْكَسُولُ مَحْبُوبًا','Orang malas tidak disukai.','Kāna dan isim-khabarnya',[
  ['لَيْسَ','Fi‘il','Fi‘il nāqiṣ','Mabnī','Fatḥah','ليس adalah fi‘il nāqiṣ yang menafikan khabar.','لَيْسَ: فِعْلٌ مَاضٍ نَاقِصٌ جَامِدٌ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['الْكَسُولُ','Isim','Isim ليس','Marfū‘','Ḍammah','Isim ليس marfū‘.','الْكَسُولُ: اسْمُ لَيْسَ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['مَحْبُوبًا','Isim','Khabar ليس','Manṣūb','Fatḥah','Khabar ليس manṣūb.','مَحْبُوبًا: خَبَرُ لَيْسَ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x39','Fi‘il muḍāri‘ marfū‘: latihan 2','يَفْهَمُ الطَّالِبُ الدَّرْسَ','Siswa itu memahami pelajaran.','Fi‘il muḍāri‘',[
  ['يَفْهَمُ','Fi‘il','Fi‘il muḍāri‘','Marfū‘','Ḍammah','Fi‘il muḍāri‘ tidak didahului nāṣib atau jāzim, maka marfū‘.','يَفْهَمُ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['الطَّالِبُ','Isim','Fā‘il','Marfū‘','Ḍammah','Pelaku memahami.','الطَّالِبُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['الدَّرْسَ','Isim','Maf‘ūl bih','Manṣūb','Fatḥah','Objek yang dipahami.','الدَّرْسَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x40','Fi‘il muḍāri‘ manṣūb: latihan 2','لَنْ أُهْمِلَ الدَّرْسَ','Aku tidak akan mengabaikan pelajaran.','Fi‘il muḍāri‘ manṣūb',[
  ['لَنْ','Huruf','Huruf naṣb','Tidak berlaku','Tidak berlaku','لَنْ menashabkan fi‘il muḍāri‘ sesudahnya.','لَنْ: حَرْفُ نَصْبٍ وَاسْتِقْبَالٍ.'],['أُهْمِلَ','Fi‘il','Fi‘il muḍāri‘','Manṣūb','Fatḥah','Fi‘il muḍāri‘ manṣūb karena didahului لَنْ.','أُهْمِلَ: فِعْلٌ مُضَارِعٌ مَنْصُوبٌ بِلَنْ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.'],['الدَّرْسَ','Isim','Maf‘ūl bih','Manṣūb','Fatḥah','Objek yang tidak akan diabaikan.','الدَّرْسَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x41','Fi‘il muḍāri‘ majzūm: latihan 2','لَمْ يَخْرُجْ عَلِيٌّ','Ali belum keluar.','Fi‘il muḍāri‘ majzūm',[
  ['لَمْ','Huruf','Huruf jazm','Tidak berlaku','Tidak berlaku','لَمْ men-jazm-kan fi‘il muḍāri‘ dan menafikan masa lampau.','لَمْ: حَرْفُ نَفْيٍ وَجَزْمٍ وَقَلْبٍ.'],['يَخْرُجْ','Fi‘il','Fi‘il muḍāri‘','Majzūm','Sukūn','Fi‘il muḍāri‘ majzūm karena didahului لَمْ.','يَخْرُجْ: فِعْلٌ مُضَارِعٌ مَجْزُومٌ بِلَمْ وَعَلَامَةُ جَزْمِهِ السُّكُونُ.'],['عَلِيٌّ','Isim','Fā‘il','Marfū‘','Ḍammah','Pelaku dari يَخْرُجْ.','عَلِيٌّ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
 makeExercise('x42','Jar–majrūr: latihan 2','جَلَسْتُ عَلَى الْكُرْسِيِّ','Aku duduk di atas kursi.','Jar–majrūr',[
  ['جَلَسْتُ','Fi‘il','Fi‘il māḍī','Mabnī','Sukūn','Fi‘il māḍī bersambung dengan tā’ fā‘il.','جَلَسْتُ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى السُّكُونِ وَالتَّاءُ فَاعِلٌ.'],['عَلَى','Huruf','Huruf jar','Tidak berlaku','Tidak berlaku','عَلَى adalah huruf jar.','عَلَى: حَرْفُ جَرٍّ.'],['الْكُرْسِيِّ','Isim','Isim majrūr','Majrūr','Kasrah','Isim setelah عَلَى; tanda jarnya kasrah.','الْكُرْسِيِّ: اسْمٌ مَجْرُورٌ بِعَلَى وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ.']]),
 makeExercise('x43','Jar–majrūr: latihan 3','الْمَاءُ فِي الْإِنَاءِ','Air itu berada di dalam wadah.','Jar–majrūr',[
  ['الْمَاءُ','Isim','Mubtada’','Marfū‘','Ḍammah','Mubtada’ marfū‘.','الْمَاءُ: مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['فِي','Huruf','Huruf jar','Tidak berlaku','Tidak berlaku','فِي adalah huruf jar.','فِي: حَرْفُ جَرٍّ.'],['الْإِنَاءِ','Isim','Isim majrūr','Majrūr','Kasrah','Isim setelah فِي; rangkaian jar-majrūr menjadi khabar.','الْإِنَاءِ: اسْمٌ مَجْرُورٌ بِفِي وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ.']]),
 makeExercise('x44','Jar–majrūr: latihan 4','خَرَجَ الْوَلَدُ مِنَ الْبَيْتِ','Anak laki-laki itu keluar dari rumah.','Jar–majrūr',[
  ['خَرَجَ','Fi‘il','Fi‘il māḍī','Mabnī','Fatḥah','Fi‘il lampau mabnī di atas fatḥah.','خَرَجَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['الْوَلَدُ','Isim','Fā‘il','Marfū‘','Ḍammah','Pelaku dari خَرَجَ.','الْوَلَدُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['مِنَ','Huruf','Huruf jar','Tidak berlaku','Tidak berlaku','مِنْ adalah huruf jar; harakat fathah sementara untuk menghindari pertemuan dua sukun.','مِنْ: حَرْفُ جَرٍّ.'],['الْبَيْتِ','Isim','Isim majrūr','Majrūr','Kasrah','Isim setelah مِنْ berstatus majrūr.','الْبَيْتِ: اسْمٌ مَجْرُورٌ بِمِنْ وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ.']]),
 makeExercise('x45','Ḥāl: latihan 2','جَاءَ الطِّفْلُ بَاكِيًا','Anak itu datang sambil menangis.','Ḥāl',[
  ['جَاءَ','Fi‘il','Fi‘il māḍī','Mabnī','Fatḥah','Fi‘il lampau.','جَاءَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['الطِّفْلُ','Isim','Fā‘il','Marfū‘','Ḍammah','Pelaku dari جَاءَ.','الطِّفْلُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['بَاكِيًا','Isim','Ḥāl','Manṣūb','Fatḥah','Menjelaskan keadaan anak saat datang; ḥāl biasanya manṣūb.','بَاكِيًا: حَالٌ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x46','Ḥāl: latihan 3','عَادَ الْجُنْدِيُّ مُنْتَصِرًا','Prajurit itu pulang dalam keadaan menang.','Ḥāl',[
  ['عَادَ','Fi‘il','Fi‘il māḍī','Mabnī','Fatḥah','Fi‘il lampau.','عَادَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['الْجُنْدِيُّ','Isim','Fā‘il','Marfū‘','Ḍammah','Pelaku dari عَادَ.','الْجُنْدِيُّ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['مُنْتَصِرًا','Isim','Ḥāl','Manṣūb','Fatḥah','Menjelaskan keadaan الْجُنْدِيُّ saat pulang.','مُنْتَصِرًا: حَالٌ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x47','‘Aṭaf: latihan 2','حَضَرَ زَيْدٌ وَعَمْرٌو','Zaid dan Amr hadir.','‘Aṭaf dan ma‘ṭūf',[
  ['حَضَرَ','Fi‘il','Fi‘il māḍī','Mabnī','Fatḥah','Fi‘il lampau.','حَضَرَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['زَيْدٌ','Isim','Fā‘il','Marfū‘','Ḍammah','Fā‘il yang pertama.','زَيْدٌ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['وَ','Huruf','Huruf ‘aṭaf','Tidak berlaku','Tidak berlaku','Wāw menghubungkan dua isim.','وَ: حَرْفُ عَطْفٍ.'],['عَمْرٌو','Isim','Ma‘ṭūf','Marfū‘','Ḍammah','Ma‘ṭūf mengikuti i‘rab زَيْدٌ yang marfū‘.','عَمْرٌو: مَعْطُوفٌ عَلَى زَيْدٍ مَرْفُوعٌ.']]),
 makeExercise('x48','Ẓarf makān: latihan 2','الْقِطُّ تَحْتَ الطَّاوِلَةِ','Kucing itu berada di bawah meja.','Ẓarf makān',[
  ['الْقِطُّ','Isim','Mubtada’','Marfū‘','Ḍammah','Mubtada’ marfū‘.','الْقِطُّ: مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['تَحْتَ','Isim','Ẓarf makān','Manṣūb','Fatḥah','Kata keterangan tempat dan menjadi muḍāf.','تَحْتَ: ظَرْفُ مَكَانٍ مَنْصُوبٌ وَهُوَ مُضَافٌ.'],['الطَّاوِلَةِ','Isim','Muḍāf ilaih','Majrūr','Kasrah','Muḍāf ilaih setelah تَحْتَ.','الطَّاوِلَةِ: مُضَافٌ إِلَيْهِ مَجْرُورٌ.']]),
 makeExercise('x49','Maf‘ūl bih: latihan 4','شَرِبَ الطِّفْلُ اللَّبَنَ','Anak itu meminum susu.','Maf‘ūl bih',[
  ['شَرِبَ','Fi‘il','Fi‘il māḍī','Mabnī','Fatḥah','Fi‘il lampau.','شَرِبَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['الطِّفْلُ','Isim','Fā‘il','Marfū‘','Ḍammah','Pelaku yang minum.','الطِّفْلُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.'],['اللَّبَنَ','Isim','Maf‘ūl bih','Manṣūb','Fatḥah','Objek yang diminum.','اللَّبَنَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ.']]),
 makeExercise('x50','Badal: latihan 2','جَاءَ أَخُوكَ زَيْدٌ','Saudaramu, Zaid, telah datang.','Badal',[
  ['جَاءَ','Fi‘il','Fi‘il māḍī','Mabnī','Fatḥah','Fi‘il lampau.','جَاءَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ.'],['أَخُوكَ','Isim','Fā‘il','Marfū‘','Wāw','Fā‘il termasuk al-asmā’ al-khamsah, marfū‘ dengan wāw; وهو مضاف والكاف مضاف إليه.','أَخُوكَ: فَاعِلٌ مَرْفُوعٌ بِالْوَاوِ وَهُوَ مُضَافٌ وَالْكَافُ مُضَافٌ إِلَيْهِ.'],['زَيْدٌ','Isim','Badal','Marfū‘','Ḍammah','Badal yang menjelaskan siapa yang dimaksud dengan أَخُوكَ.','زَيْدٌ: بَدَلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ.']]),
];
export const exercises: Exercise[] = [...baseExercises, ...extraExercises];

export const wordKinds: WordKind[] = ['Isim', 'Fi‘il', 'Huruf'];
export const positions: Position[] = [...new Set(exercises.flatMap(e => e.words.map(w => w.position)))].sort();
export const caseStates: CaseState[] = ['Marfū‘', 'Manṣūb', 'Majrūr', 'Majzūm', 'Mabnī', 'Tidak berlaku'];
export const signs: Sign[] = ['Ḍammah', 'Fatḥah', 'Kasrah', 'Sukūn', 'Alif', 'Wāw', 'Yā’', 'Mabnī', 'Tidak berlaku'];

