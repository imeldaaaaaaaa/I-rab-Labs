import type { Exercise, WordAnalysis, CaseState, Sign, WordKind } from './exercises';

export const CURRICULUM_VERSION = 'v070';
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
export type LearningExercise = Omit<Exercise,'words'> & {words:LearningWord[]};
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
const rows:Row[][] = [
 // 1. Jenis kata: kelima kalimat memuat isim, fi‘il, dan huruf.
 [
 ['Siswa itu pergi ke sekolah.',[v('ذَهَبَ'),n('الطَّالِبُ','Fā‘il'),h('إِلَى','Huruf jar'),n('الْمَدْرَسَةِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Guru itu duduk di dalam kelas.',[v('جَلَسَ'),n('الْمُعَلِّمُ','Fā‘il'),h('فِي','Huruf jar'),n('الْفَصْلِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Burung itu terbang di langit.',[v('طَارَ'),n('الطَّائِرُ','Fā‘il'),h('فِي','Huruf jar'),n('السَّمَاءِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Anak itu kembali dari pasar.',[v('رَجَعَ'),n('الْوَلَدُ','Fā‘il'),h('مِنَ','Huruf jar'),n('السُّوقِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Tamu itu masuk ke dalam rumah.',[v('دَخَلَ'),n('الضَّيْفُ','Fā‘il'),h('فِي','Huruf jar'),n('الْبَيْتِ','Isim majrūr','Majrūr','Kasrah')]]
 ],
 [
 ['Dokter itu bekerja di rumah sakit.',[v('يَعْمَلُ','present'),n('الطَّبِيبُ','Fā‘il'),h('فِي','Huruf jar'),n('الْمُسْتَشْفَى','Isim majrūr','Majrūr','Kasrah',{},'Kasrah diperkirakan pada alif maqṣūrah.')]],
 ['Petani itu berdiri di ladang.',[v('وَقَفَ'),n('الْفَلَّاحُ','Fā‘il'),h('فِي','Huruf jar'),n('الْحَقْلِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Bayi itu tidur di atas ranjang.',[v('نَامَ'),n('الرَّضِيعُ','Fā‘il'),h('عَلَى','Huruf jar'),n('السَّرِيرِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Pedagang itu bepergian ke kota.',[v('سَافَرَ'),n('التَّاجِرُ','Fā‘il'),h('إِلَى','Huruf jar'),n('الْمَدِينَةِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Penumpang itu turun dari kereta.',[v('نَزَلَ'),n('الرَّاكِبُ','Fā‘il'),h('مِنَ','Huruf jar'),n('الْقِطَارِ','Isim majrūr','Majrūr','Kasrah')]]
 ],
 [
 ['Seorang guru hadir.',[v('حَضَرَ'),n('مُعَلِّمٌ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Nakirah'})]],
 ['Guru itu hadir.',[v('حَضَرَ'),n('الْمُعَلِّمُ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'})]],
 ['Zaid membaca sebuah buku.',[v('قَرَأَ'),n('زَيْدٌ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),n('كِتَابًا','Maf‘ūl bih','Manṣūb','Fatḥah',{definiteness:'Nakirah'})]],
 ['Seorang anak membuka pintu itu.',[v('فَتَحَ'),n('وَلَدٌ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Nakirah'}),n('الْبَابَ','Maf‘ūl bih','Manṣūb','Fatḥah',{definiteness:'Ma‘rifah'})]],
 ['Khalid mengunjungi seorang teman.',[v('زَارَ'),n('خَالِدٌ','Fā‘il','Marfū‘','Ḍammah',{definiteness:'Ma‘rifah'}),n('صَدِيقًا','Maf‘ūl bih','Manṣūb','Fatḥah',{definiteness:'Nakirah'})]]
 ],
 [
 ['Seorang pelajar hadir.',[v('حَضَرَ'),n('طَالِبٌ','Fā‘il','Marfū‘','Ḍammah',{number:'Mufrad',definiteness:'Nakirah'})]],
 ['Dua pelajar hadir.',[v('حَضَرَ'),n('طَالِبَانِ','Fā‘il','Marfū‘','Alif',{number:'Tatsniyah',definiteness:'Nakirah'})]],
 ['Para guru laki-laki hadir.',[v('حَضَرَ'),n('الْمُعَلِّمُونَ','Fā‘il','Marfū‘','Wāw',{number:'Jamak',definiteness:'Ma‘rifah'})]],
 ['Para siswi hadir.',[v('حَضَرَتْ','past','Mabnī','Fatḥah','Tā’ ta’nīts sākinah menandai subjek perempuan.'),n('الطَّالِبَاتُ','Fā‘il','Marfū‘','Ḍammah',{number:'Jamak',definiteness:'Ma‘rifah'})]],
 ['Buku-buku itu bermanfaat.',[n('الْكُتُبُ','Mubtada’','Marfū‘','Ḍammah',{number:'Jamak',definiteness:'Ma‘rifah'}),n('مُفِيدَةٌ','Khabar','Marfū‘','Ḍammah',{number:'Mufrad',definiteness:'Nakirah'})]]
 ],
 [
 ['Kebun itu indah.',[n('الْحَدِيقَةُ','Mubtada’'),n('جَمِيلَةٌ','Khabar')]],
 ['Jalan itu lebar.',[n('الشَّارِعُ','Mubtada’'),n('وَاسِعٌ','Khabar')]],
 ['Pelajaran itu mudah.',[n('الدَّرْسُ','Mubtada’'),n('سَهْلٌ','Khabar')]],
 ['Jendela itu terbuka.',[n('النَّافِذَةُ','Mubtada’'),n('مَفْتُوحَةٌ','Khabar')]],
 ['Kamar itu bersih.',[n('الْغُرْفَةُ','Mubtada’'),n('نَظِيفَةٌ','Khabar')]]
 ],
 [
 ['Perpustakaan itu luas.',[n('الْمَكْتَبَةُ','Mubtada’'),n('وَاسِعَةٌ','Khabar')]],
 ['Buku itu berada di dalam tas.',[n('الْكِتَابُ','Mubtada’'),h('فِي','Huruf jar','Rangkaian jar-majrūr terkait dengan khabar yang dihapus.'),n('الْحَقِيبَةِ','Isim majrūr','Majrūr','Kasrah',{},'Syibh jumlah فِي الْحَقِيبَةِ mengisi khabar.')]],
 ['Burung itu berada di atas pohon.',[n('الْعُصْفُورُ','Mubtada’'),h('عَلَى','Huruf jar'),n('الشَّجَرَةِ','Isim majrūr','Majrūr','Kasrah',{},'Rangkaian عَلَى الشَّجَرَةِ merupakan syibh jumlah khabar.')]],
 ['Pelajar itu membaca pelajaran.',[n('الطَّالِبُ','Mubtada’'),v('يَقْرَأُ','present','Marfū‘','Ḍammah','Fā‘il berupa ḍamīr tersembunyi هو yang kembali kepada mubtada’; jumlah fi‘liyyah menjadi khabar.'),n('الدَّرْسَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Guru itu menjelaskan kaidah.',[n('الْمُعَلِّمُ','Mubtada’'),v('يَشْرَحُ','present','Marfū‘','Ḍammah','Fā‘il berupa ḍamīr tersembunyi هو; jumlah fi‘liyyah menjadi khabar.'),n('الْقَاعِدَةَ','Maf‘ūl bih','Manṣūb','Fatḥah')]]
 ],
 [
 ['Cuaca tadi dingin.',[v('كَانَ','past','Mabnī','Fatḥah','Fi‘il nāqiṣ: merafa‘kan isim dan menaṣabkan khabar.'),n('الْجَوُّ','Isim كان'),n('بَارِدًا','Khabar كان','Manṣūb','Fatḥah')]],
 ['Pelajar itu menjadi rajin.',[v('أَصْبَحَ','past','Mabnī','Fatḥah','Termasuk saudara kāna, fi‘il nāqiṣ.'),n('الطَّالِبُ','Isim كان'),n('نَشِيطًا','Khabar كان','Manṣūb','Fatḥah')]],
 ['Air itu berubah menjadi es.',[v('صَارَ','past','Mabnī','Fatḥah','Fi‘il nāqiṣ yang menyatakan perubahan.'),n('الْمَاءُ','Isim كان'),n('ثَلْجًا','Khabar كان','Manṣūb','Fatḥah')]],
 ['Pintu itu tidak terbuka.',[v('لَيْسَ','past','Mabnī','Fatḥah','Fi‘il nāqiṣ jāmid untuk penyangkalan.'),n('الْبَابُ','Isim كان'),n('مَفْتُوحًا','Khabar كان','Manṣūb','Fatḥah')]],
 ['Pekerja itu tetap sibuk pada siang hari.',[v('ظَلَّ','past','Mabnī','Fatḥah','Fi‘il nāqiṣ dari saudara kāna.'),n('الْعَامِلُ','Isim كان'),n('مَشْغُولًا','Khabar كان','Manṣūb','Fatḥah')]]
 ],
 [
 ['Sesungguhnya ilmu itu berguna.',[h('إِنَّ','Huruf nāsikh'),n('الْعِلْمَ','Isim إنّ','Manṣūb','Fatḥah'),n('نَافِعٌ','Khabar إنّ')]],
 ['Semoga musafir itu kembali.',[h('لَعَلَّ','Huruf nāsikh'),n('الْمُسَافِرَ','Isim إنّ','Manṣūb','Fatḥah'),n('عَائِدٌ','Khabar إنّ')]],
 ['Seandainya masa muda itu kembali.',[h('لَيْتَ','Huruf nāsikh'),n('الشَّبَابَ','Isim إنّ','Manṣūb','Fatḥah'),n('عَائِدٌ','Khabar إنّ')]],
 ['Seolah-olah bulan itu sebuah lampu.',[h('كَأَنَّ','Huruf nāsikh'),n('الْقَمَرَ','Isim إنّ','Manṣūb','Fatḥah'),n('مِصْبَاحٌ','Khabar إنّ')]],
 ['Sesungguhnya kejujuran itu terpuji.',[h('إِنَّ','Huruf nāsikh'),n('الصِّدْقَ','Isim إنّ','Manṣūb','Fatḥah'),n('مَحْمُودٌ','Khabar إنّ')]]
 ],
 [
 ['Anak itu menulis surat.',[v('كَتَبَ'),n('الْوَلَدُ','Fā‘il'),n('رِسَالَةً','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Anak perempuan itu menulis pelajaran.',[v('تَكْتُبُ','present'),n('الْبِنْتُ','Fā‘il'),n('الدَّرْسَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Tulislah sebuah kalimat!',[v('اُكْتُبْ','command','Mabnī','Sukūn','Fā‘il berupa ḍamīr tersembunyi أنت.'),n('جُمْلَةً','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Dengarkanlah pelajaran!',[v('اِسْمَعْ','command','Mabnī','Sukūn','Fā‘il berupa ḍamīr tersembunyi أنت.'),n('الدَّرْسَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Pekerja itu membuka toko.',[v('يَفْتَحُ','present'),n('الْعَامِلُ','Fā‘il'),n('الدُّكَّانَ','Maf‘ūl bih','Manṣūb','Fatḥah')]]
 ],
 [
 ['Penjaga itu membuka pintu.',[v('فَتَحَ'),n('الْحَارِسُ','Fā‘il'),n('الْبَابَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Pintu itu dibuka.',[v('فُتِحَ','past','Mabnī','Fatḥah','Bentuk pasif; isim sesudahnya nā’ib al-fā‘il.'),n('الْبَابُ','Nā’ib al-fā‘il')]],
 ['Pelajaran itu ditulis.',[v('كُتِبَ','past','Mabnī','Fatḥah','Fi‘il māḍī pasif.'),n('الدَّرْسُ','Nā’ib al-fā‘il')]],
 ['Para pekerja itu tiba.',[v('وَصَلَ'),n('الْعُمَّالُ','Fā‘il')]],
 ['Surat itu dibaca.',[v('تُقْرَأُ','present','Marfū‘','Ḍammah','Fi‘il muḍāri‘ pasif.'),n('الرِّسَالَةُ','Nā’ib al-fā‘il')]]
 ],
 [
 ['Pelajar itu menghafal syair.',[v('حَفِظَ'),n('الطَّالِبُ','Fā‘il'),n('الْقَصِيدَةَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Anak itu meminum air.',[v('شَرِبَ'),n('الْوَلَدُ','Fā‘il'),n('الْمَاءَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Guru itu membawa tas.',[v('حَمَلَ'),n('الْمُعَلِّمُ','Fā‘il'),n('الْحَقِيبَةَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Anak perempuan itu menggambar bunga.',[v('رَسَمَتْ','past','Mabnī','Fatḥah','Tā’ ta’nīts sākinah bukan fā‘il.'),n('الْبِنْتُ','Fā‘il'),n('زَهْرَةً','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Pekerja itu membersihkan jalan.',[v('نَظَّفَ'),n('الْعَامِلُ','Fā‘il'),n('الشَّارِعَ','Maf‘ūl bih','Manṣūb','Fatḥah')]]
 ],
 [
 ['Pelari itu berlari dengan sungguh-sungguh.',[v('رَكَضَ'),n('الْعَدَّاءُ','Fā‘il'),n('رَكْضًا','Maf‘ūl muṭlaq','Manṣūb','Fatḥah',{},'Maṣdar seakar dengan fi‘il untuk penegasan.')]],
 ['Pelajar itu berdiri untuk menghormati.',[v('وَقَفَ'),n('الطَّالِبُ','Fā‘il'),n('اِحْتِرَامًا','Maf‘ūl li-ajlih','Manṣūb','Fatḥah',{},'Menjelaskan alasan berdiri.')]],
 ['Rombongan itu bepergian pada malam hari.',[v('سَافَرَ'),n('الْقَوْمُ','Fā‘il'),n('لَيْلًا','Ẓarf zamān','Manṣūb','Fatḥah')]],
 ['Guru itu duduk di depan papan.',[v('جَلَسَ'),n('الْمُعَلِّمُ','Fā‘il'),n('أَمَامَ','Ẓarf makān','Manṣūb','Fatḥah',{},'Ẓarf sekaligus muḍāf.'),n('السَّبُّورَةِ','Muḍāf ilaih','Majrūr','Kasrah')]],
 ['Anak itu melompat satu lompatan.',[v('قَفَزَ'),n('الطِّفْلُ','Fā‘il'),n('قَفْزَةً','Maf‘ūl muṭlaq','Manṣūb','Fatḥah',{},'Maṣdar marrah menyatakan jumlah lompatan.')]]
 ],
 [
 ['Seorang dokter yang terampil tiba.',[v('وَصَلَ'),n('طَبِيبٌ','Fā‘il'),n('مَاهِرٌ','Na‘t')]],
 ['Pelajar itu membaca sebuah cerita pendek.',[v('قَرَأَ'),n('الطَّالِبُ','Fā‘il'),n('قِصَّةً','Maf‘ūl bih','Manṣūb','Fatḥah'),n('قَصِيرَةً','Na‘t','Manṣūb','Fatḥah')]],
 ['Seorang tamu yang mulia hadir.',[v('حَضَرَ'),n('ضَيْفٌ','Fā‘il'),n('كَرِيمٌ','Na‘t')]],
 ['Pelukis itu menggambar sebuah pohon besar.',[v('رَسَمَ'),n('الرَّسَّامُ','Fā‘il'),n('شَجَرَةً','Maf‘ūl bih','Manṣūb','Fatḥah'),n('كَبِيرَةً','Na‘t','Manṣūb','Fatḥah')]],
 ['Para pengunjung memasuki sebuah rumah tua.',[v('دَخَلَ'),n('الزُّوَّارُ','Fā‘il'),n('بَيْتًا','Maf‘ūl bih','Manṣūb','Fatḥah'),n('قَدِيمًا','Na‘t','Manṣūb','Fatḥah')]]
 ],
 [
 ['Zaid dan Khalid datang.',[v('جَاءَ'),n('زَيْدٌ','Fā‘il'),h('وَ','Huruf ‘aṭaf'),n('خَالِدٌ','Ma‘ṭūf')]],
 ['Guru itu membeli sebuah buku dan sebuah pena.',[v('اِشْتَرَى','past','Mabnī','Fatḥah','Fatḥah diperkirakan pada alif maqṣūrah.'),n('الْمُعَلِّمُ','Fā‘il'),n('كِتَابًا','Maf‘ūl bih','Manṣūb','Fatḥah'),h('وَ','Huruf ‘aṭaf'),n('قَلَمًا','Ma‘ṭūf','Manṣūb','Fatḥah')]],
 ['Direktur itu masuk, lalu guru itu.',[v('دَخَلَ'),n('الْمُدِيرُ','Fā‘il'),h('ثُمَّ','Huruf ‘aṭaf'),n('الْمُعَلِّمُ','Ma‘ṭūf')]],
 ['Pelajar itu menghafal sebuah bait dan sebuah kaidah.',[v('حَفِظَ'),n('الطَّالِبُ','Fā‘il'),n('بَيْتًا','Maf‘ūl bih','Manṣūb','Fatḥah'),h('وَ','Huruf ‘aṭaf'),n('قَاعِدَةً','Ma‘ṭūf','Manṣūb','Fatḥah')]],
 ['Pelajar itu membaca cerita dan surat itu.',[v('قَرَأَ'),n('الطَّالِبُ','Fā‘il'),n('الْقِصَّةَ','Maf‘ūl bih','Manṣūb','Fatḥah'),h('وَ','Huruf ‘aṭaf'),n('الرِّسَالَةَ','Ma‘ṭūf','Manṣūb','Fatḥah')]]
 ]
];

// Pelengkap materi lanjutan ditambahkan di bawah agar setiap topik memiliki bank tersendiri.
const emphasis = (subject:string,token:string):LearningWord=>n(token,'Taukīd','Marfū‘','Ḍammah',{},`Menguatkan ${subject}; ḍamīr هُ adalah muḍāf ilaih.`);
rows.push(
 [
 ['Direktur itu sendiri hadir.',[v('حَضَرَ'),n('الْمُدِيرُ','Fā‘il'),emphasis('الْمُدِيرُ','نَفْسُهُ')]],
 ['Guru itu sendiri datang.',[v('جَاءَ'),n('الْمُعَلِّمُ','Fā‘il'),emphasis('الْمُعَلِّمُ','عَيْنُهُ')]],
 ['Semua pelajar hadir.',[v('حَضَرَ'),n('الطُّلَّابُ','Fā‘il'),n('كُلُّهُمْ','Taukīd','Marfū‘','Ḍammah',{},'كُلّ menguatkan keseluruhan; هُمْ adalah muḍāf ilaih.')]],
 ['Semua tamu tiba.',[v('وَصَلَ'),n('الضُّيُوفُ','Fā‘il'),n('جَمِيعُهُمْ','Taukīd','Marfū‘','Ḍammah',{},'Menguatkan seluruh tamu; هُمْ adalah muḍāf ilaih.')]],
 ['Dokter itu sendiri masuk.',[v('دَخَلَ'),n('الطَّبِيبُ','Fā‘il'),emphasis('الطَّبِيبُ','نَفْسُهُ')]]
 ],
 [
 ['Guru itu, Zaid, hadir.',[v('حَضَرَ'),n('الْمُعَلِّمُ','Fā‘il'),n('زَيْدٌ','Badal')]],
 ['Direktur itu, Khalid, tiba.',[v('وَصَلَ'),n('الْمُدِيرُ','Fā‘il'),n('خَالِدٌ','Badal')]],
 ['Aku melihat dokter itu, Sa‘id.',[v('رَأَيْتُ','past','Mabnī','Sukūn','Tā’ adalah fā‘il.'),n('الطَّبِيبَ','Maf‘ūl bih','Manṣūb','Fatḥah'),n('سَعِيدًا','Badal','Manṣūb','Fatḥah')]],
 ['Pedagang itu, Mahmud, datang.',[v('جَاءَ'),n('التَّاجِرُ','Fā‘il'),n('مَحْمُودٌ','Badal')]],
 ['Aku menemui pelajar itu, Ali.',[v('قَابَلْتُ','past','Mabnī','Sukūn','Tā’ adalah fā‘il.'),n('الطَّالِبَ','Maf‘ūl bih','Manṣūb','Fatḥah'),n('عَلِيًّا','Badal','Manṣūb','Fatḥah')]]
 ],
 [
 ['Pintu kelas itu tertutup.',[n('بَابُ','Mubtada’','Marfū‘','Ḍammah',{},'Mubtada’ sekaligus muḍāf.'),n('الْفَصْلِ','Muḍāf ilaih','Majrūr','Kasrah'),n('مُغْلَقٌ','Khabar')]],
 ['Buku pelajar itu baru.',[n('كِتَابُ','Mubtada’','Marfū‘','Ḍammah',{},'Muḍāf kepada isim ma‘rifah.'),n('الطَّالِبِ','Muḍāf ilaih','Majrūr','Kasrah'),n('جَدِيدٌ','Khabar')]],
 ['Tas guru itu ringan.',[n('حَقِيبَةُ','Mubtada’','Marfū‘','Ḍammah',{},'Sekaligus muḍāf.'),n('الْمُعَلِّمِ','Muḍāf ilaih','Majrūr','Kasrah'),n('خَفِيفَةٌ','Khabar')]],
 ['Atap rumah itu tinggi.',[n('سَقْفُ','Mubtada’','Marfū‘','Ḍammah',{},'Sekaligus muḍāf.'),n('الْبَيْتِ','Muḍāf ilaih','Majrūr','Kasrah'),n('عَالٍ','Khabar','Marfū‘','Ḍammah',{},'Ḍammah diperkirakan pada yā’ yang dihapus dari isim manqūṣ.')]],
 ['Warna bunga itu indah.',[n('لَوْنُ','Mubtada’','Marfū‘','Ḍammah',{},'Sekaligus muḍāf.'),n('الزَّهْرَةِ','Muḍāf ilaih','Majrūr','Kasrah'),n('جَمِيلٌ','Khabar')]]
 ],
 [
 ['Pekerja itu kembali dari pabrik.',[v('عَادَ'),n('الْعَامِلُ','Fā‘il'),h('مِنَ','Huruf jar'),n('الْمَصْنَعِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Pelajar itu menuju perpustakaan.',[v('ذَهَبَ'),n('الطَّالِبُ','Fā‘il'),h('إِلَى','Huruf jar'),n('الْمَكْتَبَةِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Kucing itu tidur di atas kursi.',[v('نَامَ'),n('الْقِطُّ','Fā‘il'),h('عَلَى','Huruf jar'),n('الْكُرْسِيِّ','Isim majrūr','Majrūr','Kasrah')]],
 ['Petani itu berjalan di kebun.',[v('مَشَى','past','Mabnī','Fatḥah','Fatḥah diperkirakan pada alif.'),n('الْفَلَّاحُ','Fā‘il'),h('فِي','Huruf jar'),n('الْبُسْتَانِ','Isim majrūr','Majrūr','Kasrah')]],
 ['Penjaga itu berdiri di pintu.',[v('وَقَفَ'),n('الْحَارِسُ','Fā‘il'),h('عِنْدَ','Ẓarf makān') ,n('الْبَابِ','Muḍāf ilaih','Majrūr','Kasrah')]]
 ],
 [
 ['Pelajar itu tidak akan bepergian.',[h('لَنْ','Huruf naṣb'),v('يُسَافِرَ','present','Manṣūb','Fatḥah'),n('الطَّالِبُ','Fā‘il')]],
 ['Anak itu tidak akan menulis.',[h('لَنْ','Huruf naṣb'),v('يَكْتُبَ','present','Manṣūb','Fatḥah'),n('الْوَلَدُ','Fā‘il')]],
 ['Guru itu tidak akan absen.',[h('لَنْ','Huruf naṣb'),v('يَغِيبَ','present','Manṣūb','Fatḥah'),n('الْمُعَلِّمُ','Fā‘il')]],
 ['Pekerja itu tidak akan terlambat.',[h('لَنْ','Huruf naṣb'),v('يَتَأَخَّرَ','present','Manṣūb','Fatḥah'),n('الْعَامِلُ','Fā‘il')]],
 ['Tamu itu tidak akan duduk.',[h('لَنْ','Huruf naṣb'),v('يَجْلِسَ','present','Manṣūb','Fatḥah'),n('الضَّيْفُ','Fā‘il')]]
 ],
 [
 ['Penjaga itu tidak tidur.',[h('لَمْ','Huruf jazm'),v('يَنَمْ','present','Majzūm','Sukūn'),n('الْحَارِسُ','Fā‘il')]],
 ['Musafir itu tidak kembali.',[h('لَمْ','Huruf jazm'),v('يَرْجِعْ','present','Majzūm','Sukūn'),n('الْمُسَافِرُ','Fā‘il')]],
 ['Pelajar itu tidak memahami pelajaran.',[h('لَمْ','Huruf jazm'),v('يَفْهَمْ','present','Majzūm','Sukūn'),n('الطَّالِبُ','Fā‘il'),n('الدَّرْسَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Guru itu tidak membuka buku.',[h('لَمْ','Huruf jazm'),v('يَفْتَحْ','present','Majzūm','Sukūn'),n('الْمُعَلِّمُ','Fā‘il'),n('الْكِتَابَ','Maf‘ūl bih','Manṣūb','Fatḥah')]],
 ['Anak itu tidak meminum susu.',[h('لَمْ','Huruf jazm'),v('يَشْرَبْ','present','Majzūm','Sukūn'),n('الْوَلَدُ','Fā‘il'),n('اللَّبَنَ','Maf‘ūl bih','Manṣūb','Fatḥah')]]
 ],
 [
 ['Pelajar itu datang sambil tersenyum.',[v('جَاءَ'),n('الطَّالِبُ','Fā‘il'),n('مُبْتَسِمًا','Ḥāl','Manṣūb','Fatḥah')]],
 ['Prajurit itu kembali dalam keadaan selamat.',[v('رَجَعَ'),n('الْجُنْدِيُّ','Fā‘il'),n('سَالِمًا','Ḥāl','Manṣūb','Fatḥah')]],
 ['Aku membeli dua puluh buku.',[v('اِشْتَرَيْتُ','past','Mabnī','Sukūn','Tā’ adalah fā‘il.'),n('عِشْرِينَ','Maf‘ūl bih','Manṣūb','Yā’',{},'Bilangan puluhan dii‘rab seperti jamak mudzakkar sālim.'),n('كِتَابًا','Tamyīz','Manṣūb','Fatḥah')]],
 ['Pelajar itu bertambah ilmunya.',[v('اِزْدَادَ'),n('الطَّالِبُ','Fā‘il'),n('عِلْمًا','Tamyīz','Manṣūb','Fatḥah',{},'Menjelaskan aspek pertambahan pada kalimat.')]],
 ['Anak itu keluar sambil menangis.',[v('خَرَجَ'),n('الطِّفْلُ','Fā‘il'),n('بَاكِيًا','Ḥāl','Manṣūb','Fatḥah')]]
 ],
 [
 ['Para pelajar hadir kecuali Zaid.',[v('حَضَرَ'),n('الطُّلَّابُ','Fā‘il'),h('إِلَّا','Huruf istitsnā’'),n('زَيْدًا','Mustatsnā','Manṣūb','Fatḥah',{},'Istitsnā’ tām mūjab: mustatsnā wajib manṣūb.')]],
 ['Para tamu tiba kecuali Khalid.',[v('وَصَلَ'),n('الضُّيُوفُ','Fā‘il'),h('إِلَّا','Huruf istitsnā’'),n('خَالِدًا','Mustatsnā','Manṣūb','Fatḥah')]],
 ['Wahai pelajar ilmu!',[h('يَا','Huruf nidā’'),n('طَالِبَ','Munādā','Manṣūb','Fatḥah',{},'Munādā muḍāf wajib manṣūb.'),n('الْعِلْمِ','Muḍāf ilaih','Majrūr','Kasrah')]],
 ['Wahai guru bahasa!',[h('يَا','Huruf nidā’'),n('مُعَلِّمَ','Munādā','Manṣūb','Fatḥah',{},'Munādā muḍāf.'),n('اللُّغَةِ','Muḍāf ilaih','Majrūr','Kasrah')]],
 ['Wahai penjaga pintu!',[h('يَا','Huruf nidā’'),n('حَارِسَ','Munādā','Manṣūb','Fatḥah',{},'Munādā muḍāf.'),n('الْبَابِ','Muḍāf ilaih','Majrūr','Kasrah')]]
 ]
);
// Contoh jar kelima memakai bā’ agar tetap tepat fokus materi.
rows[17][4]=['Pelajar itu menulis dengan pena.',[v('كَتَبَ'),n('الطَّالِبُ','Fā‘il'),h('بِ','Huruf jar'),n('الْقَلَمِ','Isim majrūr','Majrūr','Kasrah')]];
export const learningQuestions:LearningExercise[]=rows.flatMap((group,ti)=>group.map(([translation,words],qi)=>({
 id:`${CURRICULUM_VERSION}-${ti}-${qi}`,source:'Umum',title:`${topics[ti]} — Soal ${qi+1}`,sentence:words.map(w=>w.token).join(' '),translation,topic:topics[ti],words,
 context:`Fokus: ${topics[ti]}. Analisis setiap kata. Huruf yang menempel ditampilkan terpisah untuk latihan.`,reference:''
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
export function topicUnlocked(topic:string,completed:string[]){const ti=topics.indexOf(topic);return ti>=0&&topics.slice(0,ti).every(t=>learningQuestions.filter(q=>q.topic===t).filter(q=>q.words.every((_,i)=>completed.includes(`${q.id}:${i}`))).length>=4);}
