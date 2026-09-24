export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  region: 'Global / Popular' | 'Asia' | 'Europe' | 'Americas' | 'Middle East' | 'Africa' | 'Oceania';
  flag: string;
  artists: string[];
  genres: string[];
}

export const TOP_100_LANGUAGES: LanguageInfo[] = [
  // 1-10 (Most Popular Global)
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global / Popular', flag: '🇺🇸', artists: ['Billie Eilish', 'The Weeknd', 'Taylor Swift', 'Harry Styles', 'Coldplay', 'Lauv', 'SZA', 'Post Malone'], genres: ['Indie Pop', 'R&B', 'Synthpop', 'Acoustic Pop', 'Alt-Rock'] },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'Global / Popular', flag: '🇮🇳', artists: ['Arijit Singh', 'Pritam', 'The Local Train', 'Mohit Chauhan', 'Lucky Ali', 'Prateek Kuhad', 'Shreya Ghoshal', 'A.R. Rahman'], genres: ['Bollywood', 'Indie Hindi', 'Sufi', 'Acoustic Bollywood', 'Pop'] },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Global / Popular', flag: '🇪🇸', artists: ['Bad Bunny', 'Rosalía', 'Kali Uchis', 'C. Tangana', 'Mon Laferte', 'Natalia Lafourcade', 'Enrique Iglesias', 'Luis Fonsi'], genres: ['Reggaeton', 'Latin Pop', 'Flamenco Nuevo', 'Indie Latino', 'Bachata'] },
  { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'Global / Popular', flag: '🇰🇷', artists: ['IU', 'NewJeans', 'BTS', 'AKMU', 'Taeyeon', 'Bol4', 'Heize', 'Crush', '10CM'], genres: ['K-Pop', 'K-Indie', 'K-R&B', 'Ballad', 'Acoustic'] },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Global / Popular', flag: '🇯🇵', artists: ['Fujii Kaze', 'Yoasobi', 'Kenshi Yonezu', 'Aimer', 'Vaundy', 'Miki Matsubara', 'Tatsuro Yamashita', 'Hikaru Utada'], genres: ['J-Pop', 'City Pop', 'J-Rock', 'Neo-Shibuya', 'Anime OST'] },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Global / Popular', flag: '🇮🇳', artists: ['Diljit Dosanjh', 'AP Dhillon', 'Sidhu Moose Wala', 'Karan Aujla', 'Amrinder Gill', 'Gurdas Maan', 'B Praak'], genres: ['Punjabi Pop', 'Desi Hip-Hop', 'Folk Pop', 'Bhangra', 'Romantic Punjabi'] },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Global / Popular', flag: '🇮🇳', artists: ['Sid Sriram', 'Anirudh Ravichander', 'Armaan Malik', 'Shreya Ghoshal', 'SP Balasubrahmanyam', 'DSP', 'Thaman S'], genres: ['Tollywood Melodies', 'Telugu Pop', 'Folk Fusion', 'Acoustic Romance'] },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Global / Popular', flag: '🇮🇳', artists: ['Anirudh Ravichander', 'A.R. Rahman', 'Sid Sriram', 'Yuvan Shankar Raja', 'Ilayaraja', 'Harris Jayaraj', 'Pradeep Kumar'], genres: ['Kollywood', 'Tamil Indie', 'Carnatic Fusion', 'Tamil Pop'] },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'Global / Popular', flag: '🇫🇷', artists: ['Stromae', 'Angèle', 'Indila', 'Videoclub', 'Clara Luciani', 'Petit Biscuit', 'Daft Punk', 'Lomepal'], genres: ['Chanson', 'French Electro', 'Pop Urbaine', 'Indie Pop', 'French Touch'] },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'Global / Popular', flag: '🇧🇷', artists: ['Anitta', 'Caetano Veloso', 'Luísa Sonza', 'Gilberto Gil', 'Marisa Monte', 'Seu Jorge', 'Liniker'], genres: ['Bossa Nova', 'MPB', 'Samba Pop', 'Funk Carioca', 'Sertanejo'] },

  // 11-20
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文 (普通话)', region: 'Asia', flag: '🇨🇳', artists: ['Jay Chou', 'JJ Lin', 'G.E.M.', 'Eric Chou', 'Faye Wong', 'Teresa Teng'], genres: ['Mandopop', 'C-Pop', 'Chinese Indie', 'Ballad'] },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'Middle East', flag: '🇸🇦', artists: ['Amr Diab', 'Fairuz', 'Nancy Ajram', 'Sherine', 'Elissa', 'Hamza Namira'], genres: ['Arabic Pop', 'Tarab', 'Khaleeji', 'Indie Arabic'] },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Asia', flag: '🇧🇩', artists: ['Arijit Singh', 'Anupam Roy', 'Rupam Islam', 'Shreya Ghoshal', 'Fossils'], genres: ['Adhunik Gaan', 'Rabindra Sangeet Fusion', 'Bangla Rock', 'Folk'] },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Europe', flag: '🇷🇺', artists: ['Zivert', 'Miyagi & Andy Panda', 'Molchat Doma', 'Jony', 'Zemfira'], genres: ['Russian Pop', 'Post-Punk', 'Indie Pop', 'Lo-fi Hip Hop'] },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Asia', flag: '🇵🇰', artists: ['Ali Sethi', 'Atif Aslam', 'Nusrat Fateh Ali Khan', 'Rahat Fateh Ali Khan', 'Kaavish'], genres: ['Ghazal', 'Sufi Rock', 'Qawwali', 'Coke Studio Indie'] },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Asia', flag: '🇮🇩', artists: ['Tulus', 'NIKI', 'Pamungkas', 'Hindia', 'Raisa', 'Feast'], genres: ['Indonesian Pop', 'Indie Pop', 'Dangdut Koplo', 'R&B'] },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Europe', flag: '🇩🇪', artists: ['Cro', 'AnnenMayKantereit', 'Mark Forster', 'Peter Fox', 'Namika', 'Zoe Wees'], genres: ['Deutschpop', 'Indie Rock', 'German Hip Hop', 'Electro'] },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Asia', flag: '🇮🇳', artists: ['Ajay-Atul', 'Swapnil Bandodkar', 'Bela Shende', 'Avadhoot Gupte'], genres: ['Natya Sangeet', 'Lavani Fusion', 'Marathi Melodies', 'Folk'] },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'Middle East', flag: '🇹🇷', artists: ['Tarkan', 'Sezen Aksu', 'Mabel Matiz', 'Zeynep Bastık', 'Ezhel', 'Mor ve Ötesi'], genres: ['Turkish Pop', 'Anatolian Rock', 'Arabesque', 'Indie'] },
  { code: 'yue', name: 'Cantonese', nativeName: '廣東話', region: 'Asia', flag: '🇭🇰', artists: ['Eason Chan', 'Joey Yung', 'Miriam Yeung', 'Beyond', 'Leslie Cheung'], genres: ['Cantopop', 'Hong Kong Ballads', 'Retro Wave'] },

  // 21-30
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Asia', flag: '🇻🇳', artists: ['Sơn Tùng M-TP', 'Vũ.', 'Amee', 'Hoàng Thùy Linh', 'Min'], genres: ['V-Pop', 'Indie Pop', 'Lofi Chill', 'Ballad'] },
  { code: 'tl', name: 'Tagalog', nativeName: 'Filipino', region: 'Asia', flag: '🇵🇭', artists: ['Ben&Ben', 'Zack Tabudlo', 'Moira Dela Torre', 'SB19', 'IV of Spades'], genres: ['OPM', 'Indie Folk', 'Acoustic', 'Pinoy Pop'] },
  { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی', region: 'Middle East', flag: '🇮🇷', artists: ['Googoosh', 'Mohsen Yeganeh', 'Shervin Hajipour', 'Sirvan Khosravi'], genres: ['Persian Pop', 'Traditional Fusion', 'Indie Rock'] },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', region: 'Africa', flag: '🇳🇬', artists: ['Hamisu Breaker', 'Umar M Shareef', 'Ali Jita', 'Nura M Inuwa'], genres: ['Hausa Pop', 'Kalangu Beats', 'Afro-Fusion'] },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', region: 'Africa', flag: '🇰🇪', artists: ['Diamond Platnumz', 'Sauti Sol', 'Zuchu', 'Harmonize', 'Alikiba'], genres: ['Bongo Flava', 'Afro-Pop', 'Taraab', 'Gengetone'] },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', region: 'Asia', flag: '🇮🇩', artists: ['Denny Caknan', 'Didi Kempot', 'Happy Asmara', 'Ndarboy Genk'], genres: ['Campursari', 'Koplo Jawa', 'Pop Jawa'] },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'Europe', flag: '🇮🇹', artists: ['Måneskin', 'Mahmood', 'Blanco', 'Laura Pausini', 'Fedez', 'Madame'], genres: ['Italian Pop', 'Canzone d\'Autore', 'Sanremo Ballad', 'Trap'] },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Asia', flag: '🇮🇳', artists: ['Kinjal Dave', 'Geeta Rabari', 'Jigardan Gadhavi', 'Aditya Gadhvi'], genres: ['Garba Fusion', 'Sugam Sangeet', 'Gujarati Folk Pop'] },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', region: 'Asia', flag: '🇹🇭', artists: ['Bowkylion', 'Tilly Birds', 'Three Man Down', 'Phum Viphurit', 'NONT TANONT'], genres: ['T-Pop', 'Thai Indie', 'City Pop', 'Neo-Soul'] },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Asia', flag: '🇮🇳', artists: ['Vijay Prakash', 'Raghu Dixit', 'Sanjith Hegde', 'Sonu Nigam', 'Arjun Janya'], genres: ['Sandalwood Melodies', 'Kannada Folk Fusion', 'Bhavageethe'] },

  // 31-40
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Asia', flag: '🇮🇳', artists: ['K.S. Harisankar', 'Job Kurian', 'Sushin Shyam', 'Vineeth Sreenivasan', 'Shaan Rahman'], genres: ['Mollywood Indie', 'Malayalam Melodies', 'Sufi Folk'] },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'Europe', flag: '🇵🇱', artists: ['Dawid Podsiadło', 'Sanah', 'Kortez', 'Daria Zawiałow', 'Quebonafide'], genres: ['Polish Pop', 'Indie Rock', 'Poezja Śpiewana', 'Trap'] },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', region: 'Europe', flag: '🇺🇦', artists: ['Okean Elzy', 'Kalush Orchestra', 'Jamala', 'Go_A', 'KAZKA', 'The Hardkiss'], genres: ['Ethno Pop', 'Ukrainian Rock', 'Electronic Folk'] },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'Europe', flag: '🇳🇱', artists: ['Maan', 'Snelle', 'Davina Michelle', 'Suzan & Freek', 'Froukje', 'Eefje de Visser'], genres: ['Nederpop', 'Acoustic Dutch', 'Indie Pop'] },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî', region: 'Middle East', flag: '🇮🇶', artists: ['Zakaria Abdulla', 'Kamkars', 'Hani Mojtahedy', 'Chopy Fatah'], genres: ['Kurdish Folk', 'Halparke Beats', 'Modern Kurdish'] },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', region: 'Asia', flag: '🇦🇫', artists: ['Haroon Bacha', 'Sardar Ali Takkar', 'Bakht Zada', 'Ghazala Javed'], genres: ['Attan Beats', 'Pashto Ghazal', 'Folk Melodies'] },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', region: 'Europe', flag: '🇷🇴', artists: ['Inna', 'Minelli', 'The Motans', 'Irina Rimes', 'Carla\'s Dreams'], genres: ['Dance Pop', 'Romanian House', 'Acoustic Pop'] },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', region: 'Europe', flag: '🇬🇷', artists: ['Helena Paparizou', 'Konstantinos Argiros', 'Marina Satti', 'Natassa Bofiliou'], genres: ['Laïko', 'Entechno', 'Greek Pop', 'Mediterranean'] },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'Europe', flag: '🇸🇪', artists: ['Veronica Maggio', 'Laleh', 'Håkan Hellström', 'Lars Winnerbäck', 'Victor Leksell'], genres: ['Svensk Pop', 'Vispop', 'Nordic Indie'] },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', region: 'Europe', flag: '🇭🇺', artists: ['Halott Pénz', 'Margaret Island', 'Follow The Flow', 'Azahriah', 'Rúzsa Magdi'], genres: ['Hungarian Pop', 'Alternatív Rock', 'Folk Pop'] },

  // 41-50
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', region: 'Europe', flag: '🇨🇿', artists: ['Mirai', 'Kryštof', 'Ewa Farna', 'Lucie', 'Ben Cristovao', 'Marek Ztracený'], genres: ['Czech Pop', 'Pop Rock', 'Acoustic Folk'] },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', region: 'Europe', flag: '🇷🇸', artists: ['Željko Joksimović', 'Konstrakta', 'Sara Jo', 'Buč Kesidi', 'Senidah'], genres: ['Balkan Ballad', 'Indie Pop', 'Turbofolk Fusion'] },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', region: 'Europe', flag: '🇭🇷', artists: ['Oliver Dragojević', 'Gibonni', 'Petar Grašo', 'Severina', 'Mia Dimšić'], genres: ['Dalmatian Chanson', 'Klapa Pop', 'Modern Rock'] },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', region: 'Europe', flag: '🇧🇬', artists: ['Victoria', 'Mihaela Marinova', 'Grafa', 'DARA', 'Lubo Kirov'], genres: ['BG Pop', 'Ethno Fusion', 'Acoustic Soul'] },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', region: 'Middle East', flag: '🇮🇱', artists: ['Idan Raichel', 'Omer Adam', 'Noa Kirel', 'Eden Ben Zaken', 'Ishay Ribo'], genres: ['Mizrahi', 'Israeli Pop', 'Acoustic Hebrew', 'World Fusion'] },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', region: 'Europe', flag: '🇩🇰', artists: ['Medina', 'Andreas Odbjerg', 'Lukas Graham', 'Christopher', 'Jada'], genres: ['Nordic Pop', 'Danish Electronic', 'Soul Pop'] },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', region: 'Europe', flag: '🇫🇮', artists: ['BEHM', 'JVG', 'SANNI', 'Kaija Koo', 'Haloo Helsinki!'], genres: ['Iskelmä Pop', 'Finnish Melancholy', 'Nordic Electro'] },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', region: 'Europe', flag: '🇳🇴', artists: ['Sigrid', 'Karpe', 'Girl in Red', 'Sondre Justad', 'Emma Steinbakken'], genres: ['Nordic Indie', 'Norwegian Rap', 'Electropop'] },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', region: 'Europe', flag: '🇸🇰', artists: ['Kristína', 'Richard Müller', 'Emma Drobná', 'Sima Martausová'], genres: ['Slovak Pop', 'Acoustic Chanson', 'Folk Fusion'] },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', region: 'Europe', flag: '🇱🇹', artists: ['Monika Liu', 'Jessica Shy', 'Daddy Was A Milkman', 'The Roop'], genres: ['Baltic Pop', 'Retro Disco', 'Acoustic Indie'] },

  // 51-60
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', region: 'Europe', flag: '🇸🇮', artists: ['Joker Out', 'Senidah', 'Nika Zorjan', 'Siddharta'], genres: ['Shagadelic Rock', 'Slovene Pop', 'Indie'] },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', region: 'Europe', flag: '🇱🇻', artists: ['Brainstorm', 'Dons', 'Aminata', 'Citi Zēni'], genres: ['Baltic Rock', 'Latvian Pop', 'Folk Fusion'] },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', region: 'Europe', flag: '🇪🇪', artists: ['Trad.Attack!', 'Nublu', 'Liis Lemsalu', 'Kerli'], genres: ['Nordic Folk Pop', 'Estonian Electro', 'Indie'] },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', region: 'Europe', flag: '🇮🇪', artists: ['The Gloaming', 'Kíla', 'Muireann Nic Amhlaoibh', 'Altan'], genres: ['Traditional Celtic', 'Sean-nós Fusion', 'Folk'] },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', region: 'Europe', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', artists: ['Super Furry Animals', 'Cate Le Bon', 'Gwenno', 'Yws Gwynedd'], genres: ['Welsh Indie', 'Psychedelic Pop', 'Celtic Folk'] },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', region: 'Europe', flag: '🇮🇸', artists: ['Ásgeir', 'Of Monsters and Men', 'Sigur Rós', 'Júníus Meyvant'], genres: ['Nordic Ambient', 'Indie Folk', 'Dream Pop'] },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', region: 'Europe', flag: '🇪🇸', artists: ['Gatibu', 'Huntza', 'Izaro', 'Berri Txarrak'], genres: ['Trikitixa Folk', 'Basque Rock', 'Acoustic Pop'] },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', region: 'Europe', flag: '🇪🇸', artists: ['Txarango', 'Manel', 'Oques Grasses', 'Rosalía', 'Els Amics de les Arts'], genres: ['Rumba Catalana', 'Indie Pop', 'Mediterranean'] },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', region: 'Europe', flag: '🇪🇸', artists: ['Tanxugueiras', 'Luar na Lubre', 'Guadi Galego', 'Baiuca'], genres: ['Galician Folk', 'Electro-Folk', 'Celtic Pop'] },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', region: 'Europe', flag: '🇲🇹', artists: ['The Travellers', 'Ira Losco', 'Destiny', 'Olimpia'], genres: ['Mediterranean Pop', 'Bilingual Indie', 'Folk'] },

  // 61-70
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', region: 'Middle East', flag: '🇦🇲', artists: ['Rosa Linn', 'Sirusho', 'Iveta Mukuchyan', 'Ladaniva'], genres: ['Balkan-Armenian Folk', 'Armenian Pop', 'Rabiz Fusion'] },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', region: 'Europe', flag: '🇬🇪', artists: ['Mgzavrebi', 'Niaz Diasamidze', 'Salio', 'Iriao'], genres: ['Polyphonic Indie', 'Georgian Folk Rock', 'Acoustic'] },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', region: 'Middle East', flag: '🇦🇿', artists: ['Alim Qasimov', 'Samir Javadzadeh', 'Aygün Kazımova', 'Chingiz'], genres: ['Mugham Fusion', 'Caspian Pop', 'Indie'] },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', region: 'Asia', flag: '🇰🇿', artists: ['Dimash Qudaibergen', 'Ninety One', 'De Lacure', 'Irina Kairatovna'], genres: ['Q-Pop', 'Steppe Folk', 'Dombra Fusion'] },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha', region: 'Asia', flag: '🇺🇿', artists: ['Yulduz Usmanova', 'Rayhon', 'Shahzoda', 'Sevara Nazarkhan'], genres: ['Silk Road Pop', 'Uzbek Folk', 'Tarab Beats'] },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmençe', region: 'Asia', flag: '🇹🇲', artists: ['Mekan Atayew', 'Myahri', 'Söhbet Jumaýew'], genres: ['Central Asian Pop', 'Folk Melodies'] },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', region: 'Asia', flag: '🇰🇬', artists: ['Mirbek Atabekov', 'Non Stop', 'Gulzhigit Satybekov'], genres: ['Komuz Beats', 'Kyrgyz Pop', 'Folk Ballads'] },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', region: 'Asia', flag: '🇹🇯', artists: ['Shabnam Surayo', 'Jonibek Murodov', 'Madina Aknazarova'], genres: ['Tajik Pop', 'Pamiri Beats', 'Shashmaqam'] },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', region: 'Asia', flag: '🇲🇳', artists: ['The HU', 'Magnolian', 'Uka', 'Kiwi'], genres: ['Hunnu Rock', 'Mongolian Indie', 'Throat Singing Fusion'] },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད', region: 'Asia', flag: '🇨🇳', artists: ['Yungchen Lhamo', 'Techung', 'Sonam Tashi', 'Tenzin Choegyal'], genres: ['Himalayan Meditative', 'Tibetan Folk', 'Sacred World'] },

  // 71-80
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာစာ', region: 'Asia', flag: '🇲🇲', artists: ['Sai Sai Kham Leng', 'R Zarni', 'Phyu Phyu Kyaw Thein', 'Chan Chan'], genres: ['Burmese Pop', 'Acoustic Indie', 'Maha Gita Fusion'] },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', region: 'Asia', flag: '🇰🇭', artists: ['VannDa', 'Preap Sovath', 'Laura Mam', 'Sinn Sisamouth tribute'], genres: ['Khmer Hip Hop', 'Cambodian Pop', 'Golden Age Rock'] },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', region: 'Asia', flag: '🇱🇦', artists: ['Aluna Thavonsouk', 'Alexandra Bounxouei', 'Cells', 'Ketsana'], genres: ['Mor Lam Fusion', 'Lao Pop', 'Mekong Acoustic'] },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', region: 'Asia', flag: '🇱🇰', artists: ['Yohani', 'Bathiya & Santhush', 'Kasun Kalhara', 'Sanuka Wickramasinghe'], genres: ['Baila Pop', 'Sinhala Acoustic', 'Indie Fusion'] },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'Asia', flag: '🇳🇵', artists: ['Sajjan Raj Vaidya', 'Bipul Chettri', 'Sushant KC', 'Albatross', 'Tribal Rain'], genres: ['Nepali Indie', 'Himalayan Folk Pop', 'Acoustic'] },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Asia', flag: '🇮🇳', artists: ['Zubeen Garg', 'Papon', 'Bhupen Hazarika', 'Kalpana Patowary'], genres: ['Bihu Fusion', 'Assamese Modern', 'Brahmaputra Folk'] },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Asia', flag: '🇮🇳', artists: ['Humane Sagar', 'Diptirekha Padhi', 'Babushan', 'Asima Panda'], genres: ['Odia Melodies', 'Sambalpuri Pop', 'Modern Odia'] },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'Asia', flag: '🇮🇳', artists: ['Maithili Thakur', 'Kunj Bihari Mishra', 'Poonam Mishra'], genres: ['Mithila Folk', 'Maithili Geets', 'Acoustic Bhakti'] },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', region: 'Asia', flag: '🇮🇳', artists: ['Pawan Singh', 'Khesari Lal Yadav', 'Sharda Sinha', 'Manoj Tiwari'], genres: ['Bhojpuri Chhath', 'Folk Beats', 'Modern Bhojpuri'] },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', region: 'Asia', flag: '🇵🇰', artists: ['Abida Parveen', 'Allan Fakir', 'Saif Samejo', 'The Sketches'], genres: ['Sufi Kalams', 'Indus Valley Folk', 'Sindhi Rock'] },

  // 81-90
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', region: 'Africa', flag: '🇸🇴', artists: ['K\'naan', 'Aar Maanta', 'Maryam Mursal', 'Suldaan Seeraar'], genres: ['Somali Funk', 'Qaraami', 'East African Pop'] },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', region: 'Africa', flag: '🇪🇹', artists: ['Teddy Afro', 'Aster Aweke', 'Rophnan', 'Mahmoud Ahmed'], genres: ['Ethio-Jazz', 'Tizita Ballads', 'Modern Amharic'] },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', region: 'Africa', flag: '🇪🇹', artists: ['Ali Birra', 'Hachalu Hundessa', 'Jafar Yussuf'], genres: ['Oromo Folk', 'East African Beats'] },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', region: 'Africa', flag: '🇳🇬', artists: ['Burna Boy', 'Asake', 'Wizkid', 'King Sunny Ade', 'Tiwa Savage'], genres: ['Afrobeats', 'Fuji Fusion', 'Juju Music'] },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', region: 'Africa', flag: '🇳🇬', artists: ['Flavour', 'Phyno', 'Chike', 'Umu Obiligbo'], genres: ['Highlife', 'Afro-Indigenous', 'Ogene Pop'] },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', region: 'Africa', flag: '🇿🇦', artists: ['Kabza De Small', 'DJ Maphorisa', 'Ladysmith Black Mambazo', 'Ami Faku'], genres: ['Amapiano', 'Maskandi', 'Isicathamiya'] },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', region: 'Africa', flag: '🇿🇦', artists: ['Zahara', 'Simphiwe Dana', 'Miriam Makeba', 'Msaki'], genres: ['Afro-Soul', 'Xhosa Folk', 'Amapiano Soul'] },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', region: 'Africa', flag: '🇿🇦', artists: ['Spoegwolf', 'Die Heuwels Fantasties', 'Bok van Blerk', 'Karen Zoid'], genres: ['Afrikaans Rock', 'Boerepop', 'Acoustic Indie'] },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', region: 'Africa', flag: '🇲🇬', artists: ['Rossy', 'Tarika', 'Rajery', 'Erick Manana'], genres: ['Salegy Beats', 'Valiha Acoustic', 'Island Pop'] },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', region: 'Africa', flag: '🇿🇼', artists: ['Oliver Mtukudzi', 'Thomas Mapfumo', 'Winky D', 'Jah Prayzah'], genres: ['Chimurenga', 'Tuku Music', 'Zimdancehall'] },

  // 91-100
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', region: 'Americas', flag: '🇭🇹', artists: ['Tabou Combo', 'Boukman Eksperyans', 'Emeline Michel', 'J. Perry'], genres: ['Kompa', 'Rasin Rock', 'Caribbean Afro'] },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', region: 'Europe', flag: '🇧🇦', artists: ['Dino Merlin', 'Bijelo Dugme', 'Dubioza Kolektiv', 'Hari Mata Hari'], genres: ['Sevdalinka Pop', 'Balkan Rock', 'Acoustic'] },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', region: 'Europe', flag: '🇦🇱', artists: ['Dua Lipa', 'Era Istrefi', 'Elvana Gjata', 'Dafina Zeqiri', 'Capital T'], genres: ['Albanian Pop', 'Tallava Fusion', 'Balkan Dance'] },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', region: 'Europe', flag: '🇲🇰', artists: ['Toše Proeski', 'Vlatko Stefanovski', 'Karolina Gočeva'], genres: ['Macedonian Chanson', 'Balkan Pop', 'Choro Fusion'] },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', region: 'Europe', flag: '🇧🇾', artists: ['Naviband', 'N.R.M.', 'Molchat Doma', 'Krambambula'], genres: ['Belarusian Folk Rock', 'Post-Punk', 'Indie'] },
  { code: 'tt', name: 'Tatar', nativeName: 'Татарча', region: 'Europe', flag: '🇷🇺', artists: ['Salavat Fatkhetdinov', 'Aigel', 'Guzel Urazova', 'Tatarka'], genres: ['Tatar Electronic', 'Volga Folk Pop', 'Modern Ethno'] },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', region: 'Oceania', flag: '🇺🇸', artists: ['Israel Kamakawiwoʻole', 'Kealiʻi Reichel', 'Kalani Peʻa', 'Jake Shimabukuro'], genres: ['Slack-Key Guitar', 'Hawaiian Acoustic', 'Island Reggae'] },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Sāmoa', region: 'Oceania', flag: '🇼🇸', artists: ['J Boog', 'Common Kings', 'Tenelle', 'Spawnbreezie'], genres: ['Pacific Island Reggae', 'Polynesian Acoustic', 'Island Soul'] },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori', region: 'Oceania', flag: '🇳🇿', artists: ['Stan Walker', 'SIX60', 'Marlon Williams', 'Rob Ruha', 'Maisey Rika'], genres: ['Waiata Pop', 'Māori Soul', 'Acoustic Whānau'] },
  { code: 'fj', name: 'Fijian', nativeName: 'Na Vosa Vakaviti', region: 'Oceania', flag: '🇫🇯', artists: ['Laisa Vulakoro', 'Elena Baravilala', 'Kiti Niumataiwalu'], genres: ['Vude Beats', 'Pacific Choral', 'Island Acoustic'] },
];

export const LANGUAGE_REGIONS = [
  'All (100)',
  'Global / Popular',
  'Asia',
  'Europe',
  'Middle East',
  'Africa',
  'Americas',
  'Oceania',
] as const;
