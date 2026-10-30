import type { Exercise, WordAnalysis, CaseState, Sign, WordKind } from './exercises';

// v071 memisahkan progres bank soal baru dari progres v070 agar jawaban lama
// tidak otomatis dianggap benar untuk kalimat yang telah diperbarui.
export const CURRICULUM_VERSION = 'v071';
export const lessonGroups = [
 {title:'Dasar-dasar kalimah',desc:'Kenali jenis kata dan sifatnya.',topics:['Isim, fi‘il, huruf','Mu‘rab dan mabnī','Ma‘rifah dan nakirah','Mufrad, mutsanna, jamak']},
 {title:'Jumlah ismiyyah',desc:'Susunan kalimat yang diawali isim.',topics:['Mubtada’ dan khabar','Khabar mufrad, jumlah, syibh jumlah','Kāna wa akhawātuhā','Inna wa akhawātuhā']},
 {title:'Jumlah fi‘liyyah',desc:'Fi‘il, pelaku, objek, dan pelengkap.',topics:['Fi‘il māḍī, muḍāri‘, amr','Fā‘il dan nā’ib al-fā‘il','Maf‘ūl bih','Maf‘ūl muṭlaq, li-ajlih, fīh']},
 {title:'Tawābi‘ dan struktur isim',desc:'Kata yang mengikuti kata lain.',topics:['Na‘t dan man‘ūt','‘Aṭaf dan ma‘ṭūf','Taukīd','Badal','Muḍāf dan muḍāf ilaih']},
 {title:'Huruf dan i‘rab lanjutan',desc:'Pengaruh amil pada kata sesudahnya.',topics:['Huruf jar dan isim majrūr','Fi‘il muḍāri‘ manṣūb','Fi‘il muḍāri‘ majzūm','Ḥāl dan tamyīz','Istitsnā’ dan munādā']}
];
export const topics = lessonGroups.flatMap(g=>g.topics);
type Detail = { definiteness?: 'Ma‘rifah'|'Nakirah'|'Tidak berlaku'; number?: 'Mufrad'|'Tatsniyah'|'Jamak'|'Tidak berlaku' };
export type LearningWord = WordAnalysis & Detail;
export type SentenceStructure = 'Jumlah ismiyyah'|'Jumlah fi‘liyyah'|'Jumlah ismiyyah dengan khabar fi‘liyyah'|'Jumlah ismiyyah dengan nāsikh';
export type LearningExercise = Omit<Exercise,'words'> & {words:LearningWord[];structure:SentenceStructure};
const arPositions:Record<string,string> = {'Mubtada’':'مبتدأ','Khabar':'خبر','Fā‘il':'فاعل','Nā’ib al-fā‘il':'نائب فاعل','Maf‘ūl bih':'مفعول به','Na‘t':'نعت','Ma‘ṭūf':'معطوف','Taukīd':'توكيد معنوي','Badal':'بدل','Muḍāf ilaih':'مضاف إليه','Isim كان':'اسم كان','Khabar كان':'خبر كان','Isim إنّ':'اسم إنّ','Khabar إنّ':'خبر إنّ','Maf‘ūl muṭlaq':'مفعول مطلق','Maf‘ūl li-ajlih':'مفعول لأجله','Ẓarf zamān':'ظرف زمان','Ẓarf makān':'ظرف مكان','Ḥāl':'حال','Tamyīz':'تمييز','Mustatsnā':'مستثنى','Munādā':'منادى'};
const arStates:Record<string,string> = {'Marfū‘':'مرفوع','Manṣūb':'منصوب','Majrūr':'مجرور','Majzūm':'مجزوم'};
const arSigns:Record<string,string> = {'Ḍammah':'الضمة','Fatḥah':'الفتحة','Kasrah':'الكسرة','Sukūn':'السكون','Alif':'الألف','Wāw':'الواو','Yā’':'الياء'};
function noun(token:string,position:string,state:CaseState='Marfū‘',sign:Sign='Ḍammah',extra:Detail={},note=''):LearningWord {
 return {token,kind:'Isim',position,state,sign,...extra,explanation:`${token} berkedudukan sebagai ${position}, ${state} dengan tanda ${sign}. ${note}`.trim(),fullIrab:`${token}: ${arPositions[position]||position} ${arStates[state]||state}، وعلامة إعرابه ${arSigns[sign]||sign}.`};
}
function verb(token:string,tense:'past'|'present'|'command'='past',state:CaseState=tense==='present'?'Marfū‘':'Mabnī',sign:Sign=tense==='present'?'Ḍammah':tense==='command'?'Sukūn':'Fatḥah',note=''):LearningWord {
 const position=['كَانَ','أَصْبَحَ','صَارَ','لَيْسَ','ظَلَّ'].includes(token)?'Fi‘il nāqiṣ':tense==='past'?'Fi‘il māḍī':tense==='command'?'Fi‘il amr':'Fi‘il muḍāri‘';
 return {token,kind:'Fi‘il',position,state,sign,explanation:`${token} adalah ${position}; ${state} dengan ${sign}. ${note}`.trim(),fullIrab:`${token}: فعل ${tense==='past'?'ماض':tense==='command'?'أمر':'مضارع'} ${state==='Mabnī'?'مبني على '+arSigns[sign]:arStates[state]+' وعلامة إعرابه '+arSigns[sign]}.`};
}
function particle(token:string,position:string,note=''):LearningWord {return {token,kind:'Huruf',position,state:'Tidak berlaku',sign:'Tidak berlaku',explanation:`${token} adalah ${position}; huruf mabnī dan tidak mempunyai محل i‘rab. ${note}`.trim(),fullIrab:`${token}: حرف مبني لا محل له من الإعراب.`};}
const n=noun,v=verb,h=particle;
type Row = [string,LearningWord[]];

// Bank aktif: tepat tiga soal per submateri (66 soal total).
// Komposisi keseluruhan seimbang: 34 jumlah ismiyyah (termasuk nāsikh/khabar fi‘liyyah) dan 32 jumlah fi‘liyyah.
const rows:Row[][] = [
 // 1. Isim, fi‘il, huruf — variasi jumlah ismiyyah dan fi‘liyyah.
 [
  ['Ilmu itu cahaya.',[n('الْعِلْمُ','Mubtada’'),n('نُورٌ','Khabar')]],
  ['Siswa itu menulis pelajaran.',[v('يَكْتُبُ','present'),n('الطَّالِبُ','Fā‘il'),n('الدَّرْسَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Pena itu berada di dalam tas.',[n('الْقَلَمُ','Mubtada’'),h('فِي','Huruf jar','Frasa jar-majrūr menjadi khabar.'),n('الْحَقِيبَةِ','Isim majrūr','Majrūr','Kasrah',{},'Frasa فِي الْحَقِيبَةِ merupakan syibh jumlah yang menjadi khabar.')]]
 ],
 // 2. Mu‘rab dan mabnī — fi‘il māḍī, isim mu‘rab, dan fi‘il muḍāri‘ majzūm.
 [
  ['Zaid menyelesaikan pekerjaan.',[v('أَنْجَزَ'),n('زَيْدٌ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),n('الْعَمَلَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Siswa itu rajin.',[n('الطَّالِبُ','Mubtada’'),n('مُجْتَهِدٌ','Khabar')]],
  ['Aisyah belum membuka pintu.',[h('لَمْ','Huruf jazm'),v('تَفْتَحْ','present','Majzūm','Sukūn','Fi‘il muḍāri‘ mu‘rab; jazm karena didahului لَمْ.'),n('عَائِشَةُ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),n('الْبَابَ','Maf‘ūl bih','Manṣūb','Fatḥah',{definiteness:'Ma‘rifah'})]]
 ],
 // 3. Ma‘rifah dan nakirah — isim tertentu dan tidak tertentu dalam dua struktur.
 [
  ['Rumah itu besar.',[n('الْبَيْتُ','Mubtada’','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),n('كَبِيرٌ','Khabar','Marfū‘','Ḍammah',{definiteness:'Nakirah'})]],
  ['Aku melihat seorang siswa di perpustakaan.',[v('رَأَيْتُ','past','Mabnī','Sukūn','Tā’ mutakallim adalah fā‘il.'),n('طَالِبًا','Maf‘ūl bih','Manṣūb','Fatḥah',{definiteness:'Nakirah'}),h('فِي','Huruf jar'),n('الْمَكْتَبَةِ','Isim majrūr','Majrūr','Kasrah',{definiteness:'Ma‘rifah'})]],
  ['Guru itu hadir.',[n('الْمُعَلِّمُ','Mubtada’','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),n('حَاضِرٌ','Khabar','Marfū‘','Ḍammah',{definiteness:'Nakirah'})]]
 ],
 // 4. Mufrad, mutsannā, jamak — contoh nominal dengan tanda i‘rab berbeda.
 [
  ['Seorang siswa hadir.',[n('الطَّالِبُ','Mubtada’','Marfū‘','Ḍammah',{number:'Mufrad'}),n('حَاضِرٌ','Khabar','Marfū‘','Ḍammah',{number:'Mufrad'})]],
  ['Dua siswa hadir.',[n('الطَّالِبَانِ','Mubtada’','Marfū‘','Alif',{number:'Tatsniyah'}),n('حَاضِرَانِ','Khabar','Marfū‘','Alif',{number:'Tatsniyah'})]],
  ['Para guru laki-laki rajin.',[n('الْمُعَلِّمُونَ','Mubtada’','Marfū‘','Wāw',{number:'Jamak'}),n('مُجْتَهِدُونَ','Khabar','Marfū‘','Wāw',{number:'Jamak'})]]
 ],
 // 5. Mubtada’ dan khabar — khabar mufrad, syibh jumlah, dan jumlah fi‘liyyah.
 [
  ['Taman itu indah.',[n('الْحَدِيقَةُ','Mubtada’'),n('جَمِيلَةٌ','Khabar')]],
  ['Dua siswa berada di kelas.',[n('الطَّالِبَانِ','Mubtada’','Marfū‘','Alif',{number:'Tatsniyah'}),h('فِي','Huruf jar'),n('الْفَصْلِ','Isim majrūr','Majrūr','Kasrah',{},'Frasa فِي الْفَصْلِ menjadi khabar syibh jumlah.')]],
  ['Kakak perempuan itu menyiapkan makanan.',[n('الْأُخْتُ','Mubtada’','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),v('تُعِدُّ','present','Marfū‘','Ḍammah','Jumlah fi‘liyyah تُعِدُّ الطَّعَامَ menjadi khabar; fā‘il berupa ḍamīr tersembunyi هِيَ.'),n('الطَّعَامَ','Maf‘ūl bih','Manṣūb','Fatḥah',{definiteness:'Ma‘rifah'})]]
 ],
 // 6. Jenis khabar: mufrad, jumlah fi‘liyyah, dan syibh jumlah.
 [
  ['Cuaca itu sejuk.',[n('الْجَوُّ','Mubtada’'),n('مُعْتَدِلٌ','Khabar')]],
  ['Burung itu membawa ranting.',[n('الطَّائِرُ','Mubtada’','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),v('يَحْمِلُ','present','Marfū‘','Ḍammah','Jumlah fi‘liyyah يَحْمِلُ غُصْنًا menjadi khabar; fā‘il berupa ḍamīr tersembunyi هُوَ.'),n('غُصْنًا','Maf‘ūl bih','Manṣūb','Fatḥah',{definiteness:'Nakirah'})]],
  ['Guru perempuan itu berada di perpustakaan.',[n('الْمُعَلِّمَةُ','Mubtada’'),h('فِي','Huruf jar'),n('الْمَكْتَبَةِ','Isim majrūr','Majrūr','Kasrah',{},'Frasa فِي الْمَكْتَبَةِ menjadi khabar syibh jumlah.')]]
 ],
 // 7. Kāna wa akhawātuhā.
 [
  ['Rumah itu dahulu luas.',[v('كَانَ','past','Mabnī','Fatḥah','Fi‘il nāqiṣ; merafa‘kan isim dan menashabkan khabar.'),n('الْبَيْتُ','Isim كان'),n('وَاسِعًا','Khabar كان','Manṣūb','Fatḥah')]],
  ['Jalan itu tetap padat.',[v('ظَلَّ','past','Mabnī','Fatḥah','Termasuk saudara kāna; menunjukkan keadaan yang berlanjut.'),n('الطَّرِيقُ','Isim كان'),n('مُزْدَحِمًا','Khabar كان','Manṣūb','Fatḥah')]],
  ['Pintu itu tidak terbuka.',[v('لَيْسَ','past','Mabnī','Fatḥah','Fi‘il nāqiṣ untuk menafikan khabar.'),n('الْبَابُ','Isim كان'),n('مَفْتُوحًا','Khabar كان','Manṣūb','Fatḥah')]]
 ],
 // 8. Inna wa akhawātuhā.
 [
  ['Sesungguhnya ilmu itu bermanfaat.',[h('إِنَّ','Huruf nāsikh'),n('الْعِلْمَ','Isim إنّ','Manṣūb','Fatḥah'),n('نَافِعٌ','Khabar إنّ')]],
  ['Semoga musafir itu kembali.',[h('لَعَلَّ','Huruf nāsikh'),n('الْمُسَافِرَ','Isim إنّ','Manṣūb','Fatḥah'),n('عَائِدٌ','Khabar إنّ')]],
  ['Seolah-olah bulan itu lampu.',[h('كَأَنَّ','Huruf nāsikh'),n('الْقَمَرَ','Isim إنّ','Manṣūb','Fatḥah'),n('مِصْبَاحٌ','Khabar إنّ')]]
 ],
 // 9. Fi‘il māḍī, muḍāri‘, dan amr.
 [
  ['Petani itu menanam gandum.',[v('زَرَعَ','past','Mabnī','Fatḥah'),n('الْفَلَّاحُ','Fā‘il'),n('الْقَمْحَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Anak perempuan itu menghafal puisi.',[n('الْبِنْتُ','Mubtada’'),v('تَحْفَظُ','present','Marfū‘','Ḍammah','Jumlah fi‘liyyah تَحْفَظُ الْقَصِيدَةَ menjadi khabar; fā‘il berupa ḍamīr tersembunyi هِيَ.'),n('الْقَصِيدَةَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Bukalah jendela itu!',[v('اِفْتَحْ','command','Mabnī','Sukūn','Fā‘il berupa ḍamīr tersembunyi أَنْتَ.'),n('النَّافِذَةَ','Maf‘ūl bih','Manṣūb','Fatḥah')]]
 ],
 // 10. Fā‘il dan nā’ib al-fā‘il — aktif, pasif, dan khabar berupa fi‘liyyah pasif.
 [
  ['Dokter itu hadir.',[v('حَضَرَ'),n('الطَّبِيبُ','Fā‘il')]],
  ['Pintu itu dibuka.',[v('فُتِحَ','past','Mabnī','Fatḥah','Fi‘il māḍī pasif; isim sesudahnya nā’ib al-fā‘il.'),n('الْبَابُ','Nā’ib al-fā‘il')]],
  ['Surat itu sedang dibaca.',[n('الرِّسَالَةُ','Mubtada’'),v('تُقْرَأُ','present','Marfū‘','Ḍammah','Jumlah fi‘liyyah pasif menjadi khabar; nā’ib al-fā‘il berupa ḍamīr tersembunyi هِيَ yang kembali kepada الرِّسَالَةُ.')]]
 ],
 // 11. Maf‘ūl bih — dua fi‘liyyah dan satu jumlah ismiyyah dengan khabar fi‘liyyah.
 [
  ['Fatimah menggambar bunga.',[v('رَسَمَتْ','past','Mabnī','Fatḥah','Tā’ ta’nīts sākinah adalah penanda feminin, bukan fā‘il.'),n('فَاطِمَةُ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),n('زَهْرَةً','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Pedagang itu memajang barang dagangan.',[n('التَّاجِرُ','Mubtada’'),v('يَعْرِضُ','present','Marfū‘','Ḍammah','Jumlah fi‘liyyah يَعْرِضُ الْبِضَاعَةَ menjadi khabar; fā‘il berupa ḍamīr tersembunyi هُوَ.'),n('الْبِضَاعَةَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Anak itu meminum susu.',[v('شَرِبَ'),n('الطِّفْلُ','Fā‘il'),n('اللَّبَنَ','Maf‘ūl bih','Manṣūb','Fatḥah')]]
 ],
 // 12. Maf‘ūl muṭlaq, li-ajlih, dan ẓarf.
 [
  ['Pelari itu berlari dengan sungguh-sungguh.',[v('رَكَضَ'),n('الْعَدَّاءُ','Fā‘il'),n('رَكْضًا','Maf‘ūl muṭlaq','Manṣūb','Fatḥah',{},'Maṣdar seakar dengan fi‘il untuk menguatkan perbuatan.')]],
  ['Siswa itu berdiri untuk menghormati guru.',[v('وَقَفَ'),n('الطَّالِبُ','Fā‘il'),n('اِحْتِرَامًا','Maf‘ūl li-ajlih','Manṣūb','Fatḥah',{},'Menjelaskan alasan siswa berdiri.'),h('لِ','Huruf jar'),n('الْمُعَلِّمِ','Isim majrūr','Majrūr','Kasrah',{},'Isim majrūr oleh lām; huruf jar ditampilkan terpisah.')]],
  ['Musafir itu tiba pada malam hari.',[n('الْمُسَافِرُ','Mubtada’'),v('يَصِلُ','present','Marfū‘','Ḍammah','Jumlah fi‘liyyah menjadi khabar; fā‘il berupa ḍamīr tersembunyi هُوَ.'),n('لَيْلًا','Ẓarf zamān','Manṣūb','Fatḥah')]]
 ],
 // 13. Na‘t dan man‘ūt — fi‘liyyah, ismiyyah, dan maf‘ūl plus na‘t.
 [
  ['Seorang dokter yang terampil datang.',[v('وَصَلَ'),n('طَبِيبٌ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Nakirah'}),n('مَاهِرٌ','Na‘t','Marfū‘','Ḍammah',{definiteness:'Nakirah'})]],
  ['Jalan yang panjang itu aman.',[n('الطَّرِيقُ','Mubtada’'),n('الطَّوِيلُ','Na‘t'),n('آمِنٌ','Khabar')]],
  ['Aku membaca sebuah cerita pendek.',[v('قَرَأْتُ','past','Mabnī','Sukūn','Tā’ mutakallim adalah fā‘il.'),n('قِصَّةً','Maf‘ūl bih','Manṣūb','Fatḥah',{definiteness:'Nakirah'}),n('قَصِيرَةً','Na‘t','Manṣūb','Fatḥah',{definiteness:'Nakirah'})]]
 ],
 // 14. ‘Aṭaf dan ma‘ṭūf — susunan nominal dan verbal.
 [
  ['Zaid dan Khalid hadir.',[n('زَيْدٌ','Mubtada’','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),h('وَ','Huruf ‘aṭaf'),n('خَالِدٌ','Ma‘ṭūf','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),n('حَاضِرَانِ','Khabar','Marfū‘','Alif',{number:'Tatsniyah'})]],
  ['Ayah dan ibu itu pulang.',[v('عَادَ'),n('الْأَبُ','Fā‘il'),h('وَ','Huruf ‘aṭaf'),n('الْأُمُّ','Ma‘ṭūf')]],
  ['Siswa itu membeli buku dan pena.',[v('اِشْتَرَى','past','Mabnī','Fatḥah','Fatḥah diperkirakan pada alif maqṣūrah.'),n('الطَّالِبُ','Fā‘il'),n('كِتَابًا','Maf‘ūl bih','Manṣūb','Fatḥah'),h('وَ','Huruf ‘aṭaf'),n('قَلَمًا','Ma‘ṭūf','Manṣūb','Fatḥah')]]
 ],
 // 15. Taukīd — penegasan dengan nafs, kull, dan jamī‘.
 [
  ['Direktur itu sendiri hadir.',[v('حَضَرَ'),n('الْمُدِيرُ','Fā‘il'),n('نَفْسُهُ','Taukīd','Marfū‘','Ḍammah',{},'نَفْسُهُ menegaskan الْمُدِيرُ; ḍamīr هُ menjadi muḍāf ilaih.')]],
  ['Para siswi semuanya hadir.',[n('الطَّالِبَاتُ','Mubtada’','Marfū‘','Ḍammah',{number:'Jamak'}),n('كُلُّهُنَّ','Taukīd','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'},'كُلُّهُنَّ menguatkan الطَّالِبَاتُ; ḍamīr هُنَّ menjadi muḍāf ilaih.'),n('حَاضِرَاتٌ','Khabar','Marfū‘','Ḍammah',{number:'Jamak'})]],
  ['Para musafir itu semuanya mengunjungi museum.',[v('زَارَ'),n('الْمُسَافِرُونَ','Fā‘il','Marfū‘','Wāw',{number:'Jamak'}),n('جَمِيعُهُمْ','Taukīd','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'},'جَمِيعُهُمْ menguatkan الْمُسَافِرُونَ; ḍamīr هُمْ menjadi muḍāf ilaih.'),n('الْمَتْحَفَ','Maf‘ūl bih','Manṣūb','Fatḥah',{definiteness:'Ma‘rifah'})]]
 ],
 // 16. Badal — badal marfū‘ dan manṣūb dalam dua jenis jumlah.
 [
  ['Musafir itu, Ahmad, telah kembali.',[v('رَجَعَ'),n('الْمُسَافِرُ','Fā‘il'),n('أَحْمَدُ','Badal','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'})]],
  ['Khalifah itu, Umar, adil.',[n('الْخَلِيفَةُ','Mubtada’'),n('عُمَرُ','Badal','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),n('عَادِلٌ','Khabar')]],
  ['Aku melihat direktur itu, Khalid.',[v('رَأَيْتُ','past','Mabnī','Sukūn','Tā’ mutakallim adalah fā‘il.'),n('الْمُدِيرَ','Maf‘ūl bih','Manṣūb','Fatḥah'),n('خَالِدًا','Badal','Manṣūb','Fatḥah',{definiteness:'Ma‘rifah'})]]
 ],
 // 17. Iḍāfah — dua jumlah ismiyyah dan satu jumlah fi‘liyyah.
 [
  ['Buku siswa itu baru.',[n('كِتَابُ','Mubtada’','Marfū‘','Ḍammah'),n('الطَّالِبِ','Muḍāf ilaih','Majrūr','Kasrah'),n('جَدِيدٌ','Khabar')]],
  ['Kunci-kunci rumah itu hilang.',[n('مَفَاتِيحُ','Mubtada’','Marfū‘','Ḍammah',{number:'Jamak'}),n('الْبَيْتِ','Muḍāf ilaih','Majrūr','Kasrah'),n('مَفْقُودَةٌ','Khabar')]],
  ['Guru itu duduk di depan papan tulis.',[v('جَلَسَ'),n('الْمُعَلِّمُ','Fā‘il'),n('أَمَامَ','Ẓarf makān','Manṣūb','Fatḥah',{},'Ẓarf sekaligus muḍāf.'),n('السَّبُّورَةِ','Muḍāf ilaih','Majrūr','Kasrah')]]
 ],
 // 18. Huruf jar — jumlah ismiyyah dengan khabar syibh jumlah dan fi‘liyyah.
 [
  ['Buku itu berada di atas meja.',[n('الْكِتَابُ','Mubtada’'),h('عَلَى','Huruf jar'),n('الْمَكْتَبِ','Isim majrūr','Majrūr','Kasrah',{},'Frasa عَلَى الْمَكْتَبِ menjadi khabar syibh jumlah.')]],
  ['Anak itu pergi ke sekolah.',[v('ذَهَبَ'),n('الطِّفْلُ','Fā‘il'),h('إِلَى','Huruf jar'),n('الْمَدْرَسَةِ','Isim majrūr','Majrūr','Kasrah')]],
  ['Fatimah menulis dengan pena.',[v('كَتَبَتْ','past','Mabnī','Fatḥah','Tā’ ta’nīts sākinah menandai subjek perempuan.'),n('فَاطِمَةُ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),h('بِ','Huruf jar'),n('الْقَلَمِ','Isim majrūr','Majrūr','Kasrah')]]
 ],
 // 19. Fi‘il muḍāri‘ manṣūb.
 [
  ['Siswa itu tidak akan mengabaikan tugasnya.',[h('لَنْ','Huruf naṣb'),v('يُهْمِلَ','present','Manṣūb','Fatḥah'),n('الطَّالِبُ','Fā‘il'),n('وَاجِبَهُ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Aku ingin mempelajari ilmu Nahwu.',[v('أُرِيدُ','present','Marfū‘','Ḍammah','Fā‘il berupa ḍamīr tersembunyi أَنَا.'),h('أَنْ','Huruf naṣb','Menashabkan fi‘il muḍāri‘ sesudahnya.'),v('أَتَعَلَّمَ','present','Manṣūb','Fatḥah'),n('النَّحْوَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Musafir itu tidak akan meninggalkan tasnya.',[n('الْمُسَافِرُ','Mubtada’'),h('لَنْ','Huruf naṣb'),v('يَتْرُكَ','present','Manṣūb','Fatḥah','Jumlah fi‘liyyah لَنْ يَتْرُكَ حَقِيبَتَهُ menjadi khabar; fā‘il tersembunyi هُوَ.'),n('حَقِيبَتَهُ','Maf‘ūl bih','Manṣūb','Fatḥah',{},'Ḍamīr هُ menjadi muḍāf ilaih.')]]
 ],
 // 20. Fi‘il muḍāri‘ majzūm — lam, lā nāhiyah, dan syarat.
 [
  ['Anak itu belum menyelesaikan latihan.',[n('الطِّفْلُ','Mubtada’'),h('لَمْ','Huruf jazm'),v('يُكْمِلْ','present','Majzūm','Sukūn','Jumlah fi‘liyyah لَمْ يُكْمِلْ التَّمْرِينَ menjadi khabar; fā‘il tersembunyi هُوَ.'),n('التَّمْرِينَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Jangan mengabaikan tugasmu!',[h('لَا','Huruf nahy'),v('تُهْمِلْ','present','Majzūm','Sukūn','Fi‘il muḍāri‘ majzūm oleh لَا النَّاهِيَةُ.'),n('وَاجِبَكَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
  ['Jika kamu bersungguh-sungguh, kamu berhasil.',[h('إِنْ','Huruf syarṭ wa jazm'),v('تَجْتَهِدْ','present','Majzūm','Sukūn','Fi‘il syarṭ majzūm; fā‘il berupa ḍamīr tersembunyi أَنْتَ.'),v('تَنْجَحْ','present','Majzūm','Sukūn','Jawāb syarṭ majzūm; fā‘il berupa ḍamīr tersembunyi أَنْتَ.')]]
 ],
 // 21. Ḥāl dan tamyīz — dua fi‘liyyah dan satu ismiyyah.
 [
  ['Siswa itu datang sambil tersenyum.',[v('جَاءَ'),n('الطَّالِبُ','Fā‘il'),n('مُبْتَسِمًا','Ḥāl','Manṣūb','Fatḥah')]],
  ['Direktur itu keluar dengan marah.',[v('خَرَجَ'),n('الْمُدِيرُ','Fā‘il'),n('غَاضِبًا','Ḥāl','Manṣūb','Fatḥah')]],
  ['Air itu lebih jernih.',[n('الْمَاءُ','Mubtada’'),n('أَكْثَرُ','Khabar'),n('صَفَاءً','Tamyīz','Manṣūb','Fatḥah',{},'Tamyīz menjelaskan sisi perbandingan pada أَكْثَرُ.')]]
 ],
 // 22. Istitsnā’ dan munādā — dua pola fi‘liyyah dan satu ismiyyah.
 [
  ['Para siswa hadir kecuali Zaid.',[v('حَضَرَ'),n('الطُّلَّابُ','Fā‘il','Marfū‘','Ḍammah',{number:'Jamak'}),h('إِلَّا','Huruf istitsnā’'),n('زَيْدًا','Mustatsnā','Manṣūb','Fatḥah',{definiteness:'Ma‘rifah'},'Istitsnā’ tām mūjab; mustatsnā wajib manṣūb.')]],
  ['Wahai pencari ilmu, bersungguh-sungguhlah!',[h('يَا','Huruf nidā’'),n('طَالِبَ','Munādā','Manṣūb','Fatḥah',{},'Munādā muḍāf wajib manṣūb.'),n('الْعِلْمِ','Muḍāf ilaih','Majrūr','Kasrah'),v('اِجْتَهِدْ','command','Mabnī','Sukūn','Fā‘il berupa ḍamīr tersembunyi أَنْتَ.')]],
  ['Para guru hadir kecuali Muhammad.',[n('الْمُعَلِّمُونَ','Mubtada’','Marfū‘','Wāw',{number:'Jamak'}),n('حَاضِرُونَ','Khabar','Marfū‘','Wāw',{number:'Jamak'}),h('إِلَّا','Huruf istitsnā’'),n('مُحَمَّدًا','Mustatsnā','Manṣūb','Fatḥah',{definiteness:'Ma‘rifah'},'Istitsnā’ tām mūjab dalam jumlah ismiyyah.')]]
 ]
];

const sentenceStructures:SentenceStructure[][] = [
 ['Jumlah ismiyyah','Jumlah fi‘liyyah','Jumlah ismiyyah'],
 ['Jumlah fi‘liyyah','Jumlah ismiyyah','Jumlah fi‘liyyah'],
 ['Jumlah ismiyyah','Jumlah fi‘liyyah','Jumlah ismiyyah'],
 ['Jumlah ismiyyah','Jumlah ismiyyah','Jumlah ismiyyah'],
 ['Jumlah ismiyyah','Jumlah ismiyyah','Jumlah ismiyyah dengan khabar fi‘liyyah'],
 ['Jumlah ismiyyah','Jumlah ismiyyah dengan khabar fi‘liyyah','Jumlah ismiyyah'],
 ['Jumlah ismiyyah dengan nāsikh','Jumlah ismiyyah dengan nāsikh','Jumlah ismiyyah dengan nāsikh'],
 ['Jumlah ismiyyah dengan nāsikh','Jumlah ismiyyah dengan nāsikh','Jumlah ismiyyah dengan nāsikh'],
 ['Jumlah fi‘liyyah','Jumlah fi‘liyyah','Jumlah fi‘liyyah'],
 ['Jumlah fi‘liyyah','Jumlah fi‘liyyah','Jumlah ismiyyah dengan khabar fi‘liyyah'],
 ['Jumlah fi‘liyyah','Jumlah ismiyyah dengan khabar fi‘liyyah','Jumlah fi‘liyyah'],
 ['Jumlah fi‘liyyah','Jumlah fi‘liyyah','Jumlah ismiyyah dengan khabar fi‘liyyah'],
 ['Jumlah fi‘liyyah','Jumlah ismiyyah','Jumlah fi‘liyyah'],
 ['Jumlah ismiyyah','Jumlah fi‘liyyah','Jumlah fi‘liyyah'],
 ['Jumlah fi‘liyyah','Jumlah ismiyyah','Jumlah fi‘liyyah'],
 ['Jumlah fi‘liyyah','Jumlah ismiyyah','Jumlah fi‘liyyah'],
 ['Jumlah ismiyyah','Jumlah ismiyyah','Jumlah fi‘liyyah'],
 ['Jumlah ismiyyah','Jumlah fi‘liyyah','Jumlah fi‘liyyah'],
 ['Jumlah fi‘liyyah','Jumlah fi‘liyyah','Jumlah ismiyyah dengan khabar fi‘liyyah'],
 ['Jumlah ismiyyah dengan khabar fi‘liyyah','Jumlah fi‘liyyah','Jumlah fi‘liyyah'],
 ['Jumlah fi‘liyyah','Jumlah fi‘liyyah','Jumlah ismiyyah'],
 ['Jumlah fi‘liyyah','Jumlah fi‘liyyah','Jumlah ismiyyah']
];

export const learningQuestions:LearningExercise[]=rows.flatMap((group,ti)=>group.map(([translation,words],qi)=>({
 id:`${CURRICULUM_VERSION}-${ti}-${qi}`,source:'Umum',title:`${topics[ti]} — Soal ${qi+1}`,sentence:words.map(w=>w.token).join(' '),translation,topic:topics[ti],words,structure:sentenceStructures[ti][qi],
 context:`Struktur: ${sentenceStructures[ti][qi]}. Fokus: ${topics[ti]}. Analisis setiap kata. Huruf yang menempel ditampilkan terpisah untuk latihan.`,reference:''
})));
export const positions=[...new Set(learningQuestions.flatMap(e=>e.words.map(w=>w.position)))].sort();
export type Answer={kind:WordKind|'';position:string;state:CaseState|'';sign:Sign|'';wordClass?:'Mu‘rab'|'Mabnī'|'';definiteness?:'Ma‘rifah'|'Nakirah'|'Tidak berlaku'|'';number?:'Mufrad'|'Tatsniyah'|'Jamak'|'Tidak berlaku'|''};
export const blank:Answer={kind:'',position:'',state:'',sign:'',wordClass:'',definiteness:'',number:''};
export function getFoundationStage(topic:string){const i=lessonGroups[0].topics.indexOf(topic);return i<0?5:i+1;}
export function expectedState(w:LearningWord):CaseState{return w.kind==='Huruf'||w.state==='Tidak berlaku'?'Mabnī':w.state;}
export function expectedWordClass(w:LearningWord){return expectedState(w)==='Mabnī'?'Mabnī':'Mu‘rab';}
export function expectedDefiniteness(w:LearningWord):NonNullable<Answer['definiteness']>{if(w.kind!=='Isim')return 'Tidak berlaku';return w.definiteness??(w.token.replace(/[ًٌٍَُِّْٰـ]/g,'').startsWith('ال')?'Ma‘rifah':'Nakirah');}
export function expectedNumber(w:LearningWord):NonNullable<Answer['number']>{return w.kind==='Isim'?(w.number??'Mufrad'):'Tidak berlaku';}
export function expectedAnswer(e:LearningExercise,index:number):Answer{const w=e.words[index];const stage=getFoundationStage(e.topic);return {kind:w.kind,position:w.position,state:stage<=4?expectedState(w):w.state,sign:w.sign,wordClass:expectedWordClass(w),definiteness:expectedDefiniteness(w),number:expectedNumber(w)};}
export function gradeAnswer(e:LearningExercise,index:number,answer:Answer){const expected=expectedAnswer(e,index);const stage=getFoundationStage(e.topic);const fields:(keyof Answer)[]=stage===5?['kind','position','state','sign']:['kind','state',...(stage>=2?['wordClass' as const]:[]),...(stage>=3?['definiteness' as const]:[]),...(stage>=4?['number' as const]:[])];return fields.every(f=>answer[f]===expected[f]);}
export function topicUnlocked(topic:string,completed:string[]){const ti=topics.indexOf(topic);return ti>=0&&topics.slice(0,ti).every(t=>{const previous=learningQuestions.filter(q=>q.topic===t);return previous.length===3&&previous.every(q=>q.words.every((_,i)=>completed.includes(`${q.id}:${i}`)));});}
