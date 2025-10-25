-- ========================================
-- 🚀 SZYBKI SETUP - SAFE VERSION
-- Nie usuwa istniejących gier, tylko dodaje dane
-- ========================================

-- KROK 1: Dodaj game_modes (jeśli nie istnieją)
INSERT INTO game_modes (code, name, description, min_players, max_players, time_limit_seconds, lives_count, requires_category, is_active) 
VALUES
  ('duel', 'Duel', '1v1 - Kto jest lepszy?', 2, 2, 15, 3, false, true),
  ('squad', 'Squad', '2v2 drużynowa dominacja', 4, 4, 15, 3, false, true),
  ('blitz', 'Blitz', '3 życia i walka na czas', 1, 1, 30, 3, false, true),
  ('master', 'Master', 'Sprawdź się w pojedynku z jednej kategorii', 2, 2, 20, 3, true, true)
ON CONFLICT (code) DO NOTHING;

SELECT '✅ Game modes' as status, COUNT(*) as count FROM game_modes;

-- KROK 2: Dodaj kategorie (jeśli nie istnieją)
INSERT INTO categories (name, icon_emoji, description, is_active) 
VALUES
  ('Historia', 'history_edu', 'Pytania o historię świata', true),
  ('Geografia', 'public', 'Pytania o geografię i miejsca na świecie', true),
  ('Nauka', 'science', 'Pytania z zakresu nauki i technologii', true),
  ('Sport', 'sports_soccer', 'Pytania o sport i sportowców', true),
  ('Kultura', 'theater_comedy', 'Pytania o kulturę, sztukę i rozrywkę', true),
  ('Przyroda', 'nature', 'Pytania o przyrodę i zwierzęta', true),
  ('Technologia', 'computer', 'Pytania o technologie i innowacje', true),
  ('Matematyka', 'calculate', 'Pytania matematyczne i logiczne', true)
ON CONFLICT (name) DO NOTHING;

SELECT '✅ Categories' as status, COUNT(*) as count FROM categories;

-- KROK 3: Dodaj pytania (tylko jeśli tabela jest pusta)
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM questions) = 0 THEN
    -- Historia (20 pytań)
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku rozpoczęła się II wojna światowa?', '1939', '1914', '1945', '1941', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Kto był pierwszym prezydentem USA?', 'George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'Benjamin Franklin', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku upadł Mur Berliński?', '1989', '1991', '1987', '1985', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Kto odkrył Amerykę w 1492 roku?', 'Krzysztof Kolumb', 'Amerigo Vespucci', 'Ferdynand Magellan', 'Vasco da Gama', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Która bitwa zakończyła wojny napoleońskie?', 'Waterloo', 'Austerlitz', 'Jena', 'Leipzig', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku podpisano Traktat Wersalski?', '1919', '1918', '1920', '1921', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Kto był liderem ZSRR podczas II wojny światowej?', 'Józef Stalin', 'Lenin', 'Chruszczow', 'Breżniew', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku Polska odzyskała niepodległość?', '1918', '1919', '1920', '1921', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Kto napisał "Manifest Komunistyczny"?', 'Karol Marks', 'Lenin', 'Engels', 'Trocki', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku miała miejsce rewolucja francuska?', '1789', '1799', '1815', '1848', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Która dynastia rządziła Polską najdłużej?', 'Piastowie', 'Jagiellonowie', 'Wazowie', 'Wettynowie', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku podpisano Konstytucję 3 Maja?', '1791', '1792', '1793', '1794', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Kto był pierwszym cesarzem Rzymu?', 'Oktawian August', 'Juliusz Cezar', 'Neron', 'Kaligula', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku miał miejsce chrzest Polski?', '966', '1000', '1025', '1138', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Kto dowodził Powstaniem Warszawskim?', 'Antoni Chruściel', 'Tadeusz Komorowski', 'Stefan Rowecki', 'Leopold Okulicki', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku zakończyła się I wojna światowa?', '1918', '1919', '1917', '1920', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Który król polski został nazwany Wielkim?', 'Kazimierz III', 'Władysław Łokietek', 'Bolesław Chrobry', 'Stefan Batory', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku dokonano zamachu na WTC?', '2001', '2002', '2000', '1999', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'Kto był pierwszym człowiekiem w kosmosie?', 'Jurij Gagarin', 'Neil Armstrong', 'Buzz Aldrin', 'John Glenn', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Historia'), 'W którym roku rozpadł się ZSRR?', '1991', '1989', '1990', '1992', 'medium', true, true);

    -- Geografia (20 pytań)
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Która rzeka jest najdłuższa na świecie?', 'Nil', 'Amazonka', 'Jangcy', 'Missisipi', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Jaka jest stolica Australii?', 'Canberra', 'Sydney', 'Melbourne', 'Brisbane', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Który ocean jest największy?', 'Spokojny', 'Atlantycki', 'Indyjski', 'Arktyczny', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Na którym kontynencie leży Egipt?', 'Afryka', 'Azja', 'Europa', 'Australia', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Jaka jest najwyższa góra świata?', 'Mount Everest', 'K2', 'Kilimandżaro', 'Mont Blanc', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Która pustynia jest największa na świecie?', 'Sahara', 'Gobi', 'Kalahari', 'Atakama', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Ile kontynentów jest na Ziemi?', '7', '5', '6', '8', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Jaka jest stolica Japonii?', 'Tokio', 'Osaka', 'Kioto', 'Hiroszima', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Który kraj ma największą populację?', 'Indie', 'Chiny', 'USA', 'Indonezja', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Jak nazywa się największe jezioro świata?', 'Morze Kaspijskie', 'Jezioro Bajkał', 'Wielkie Jeziora', 'Jezioro Wiktorii', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Jaka jest stolica Kanady?', 'Ottawa', 'Toronto', 'Montreal', 'Vancouver', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Który kraj ma kształt buta?', 'Włochy', 'Grecja', 'Hiszpania', 'Portugalia', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Na którym kontynencie leży Brazylia?', 'Ameryka Południowa', 'Ameryka Północna', 'Afryka', 'Europa', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Jaka jest stolica Norwegii?', 'Oslo', 'Bergen', 'Sztokholm', 'Kopenhaga', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Który kraj nie ma dostępu do morza?', 'Szwajcaria', 'Belgia', 'Dania', 'Holandia', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Jak nazywa się największa wyspa świata?', 'Grenlandia', 'Nowa Gwinea', 'Borneo', 'Madagaskar', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Jaka jest stolica Egiptu?', 'Kair', 'Aleksandria', 'Luksor', 'Giza', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Który wulkan zniszczył Pompeje?', 'Wezuwiusz', 'Etna', 'Stromboli', 'Wulcano', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'Jaka jest najdłuższa rzeka w Europie?', 'Wołga', 'Dunaj', 'Ren', 'Wisła', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Geografia'), 'W którym kraju znajduje się Wielki Kanion?', 'USA', 'Meksyk', 'Kanada', 'Australia', 'easy', true, true);

    -- Nauka (20 pytań)
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Jaki jest symbol chemiczny złota?', 'Au', 'Ag', 'Fe', 'Cu', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Ile planet jest w Układzie Słonecznym?', '8', '7', '9', '10', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Co jest jednostką mocy?', 'Wat', 'Wolt', 'Amper', 'Om', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Jaka jest prędkość światła?', '300 000 km/s', '150 000 km/s', '450 000 km/s', '250 000 km/s', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Kto sformułował teorię względności?', 'Albert Einstein', 'Isaac Newton', 'Nikola Tesla', 'Stephen Hawking', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Jaki gaz oddychamy?', 'Tlen', 'Azot', 'Dwutlenek węgla', 'Wodór', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Ile kości ma dorosły człowiek?', '206', '198', '215', '187', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Jaka planeta jest największa w Układzie Słonecznym?', 'Jowisz', 'Saturn', 'Neptun', 'Uran', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Co odkrył Alexander Fleming?', 'Penicylinę', 'Insulin', 'Aspirynę', 'Szczepionkę', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Jaki jest wzór chemiczny wody?', 'H2O', 'CO2', 'O2', 'H2SO4', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Ile chromosomów ma człowiek?', '46', '48', '44', '42', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Kto wynalazł żarówkę?', 'Thomas Edison', 'Nikola Tesla', 'Benjamin Franklin', 'Alexander Bell', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Jaka jest temperatura wrząca wody?', '100°C', '90°C', '110°C', '95°C', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Która planeta jest najbliżej Słońca?', 'Merkury', 'Wenus', 'Mars', 'Ziemia', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Co bada genetyka?', 'Dziedziczność', 'Chemię', 'Fizykę', 'Astronomię', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Ile wynosi liczba Pi (w przybliżeniu)?', '3.14', '3.41', '2.71', '4.13', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Jaki narząd pompuje krew?', 'Serce', 'Płuca', 'Wątroba', 'Nerki', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Co to jest fotosynteza?', 'Proces produkcji tlenu przez rośliny', 'Proces oddychania', 'Proces trawienia', 'Proces rozmnażania', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Kto stworzył układ okresowy pierwiastków?', 'Mendelejew', 'Einstein', 'Newton', 'Bohr', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Nauka'), 'Jaki jest symbol chemiczny sodu?', 'Na', 'So', 'S', 'Sd', 'medium', true, true);

    -- Sport (15 pytań)
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Ile graczy ma drużyna piłkarska?', '11', '10', '12', '9', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Kto zdobył najwięcej Złotych Piłek?', 'Lionel Messi', 'Cristiano Ronaldo', 'Pelé', 'Maradona', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Gdzie odbyły się pierwsze nowożytne Igrzyska Olimpijskie?', 'Ateny', 'Paryż', 'Londyn', 'Rzym', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Ile setów trzeba wygrać w meczu tenisowym?', '3 z 5 lub 2 z 3', '2 z 3', '3 z 5', '4 z 7', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Kto jest najszybszym człowiekiem świata?', 'Usain Bolt', 'Carl Lewis', 'Jesse Owens', 'Michael Johnson', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Ile punktów daje touchdown w futbolu amerykańskim?', '6', '7', '5', '8', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Jaki kraj wygrał najwięcej mistrzostw świata w piłce nożnej?', 'Brazylia', 'Niemcy', 'Argentyna', 'Włochy', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Ile wynosi długość maratonu?', '42.195 km', '40 km', '45 km', '50 km', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Jak nazywa się najważniejszy wyścig kolarski?', 'Tour de France', 'Giro d''Italia', 'Vuelta a España', 'Tour de Pologne', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Kto ma najwięcej tytułów Wielkiego Szlema w tenisie?', 'Novak Djokovic', 'Roger Federer', 'Rafael Nadal', 'Pete Sampras', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Ile sekund trwa runda boksu zawodowego?', '3 minuty', '2 minuty', '5 minut', '4 minuty', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Kto jest najlepszym strzelcem w historii piłki nożnej?', 'Cristiano Ronaldo', 'Pelé', 'Romário', 'Gerd Müller', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Ile wynosi wysokość siatki w siatkówce?', '2.43 m (mężczyźni)', '2.24 m', '2.50 m', '2.35 m', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Który kraj organizował MŚ 2018 w piłce nożnej?', 'Rosja', 'Brazylia', 'Niemcy', 'Francja', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Sport'), 'Kto zdobył najwięcej medali olimpijskich?', 'Michael Phelps', 'Usain Bolt', 'Carl Lewis', 'Mark Spitz', 'medium', true, true);

    -- Rozrywka (15 pytań)
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Kto wyreżyserował "Pulp Fiction"?', 'Quentin Tarantino', 'Martin Scorsese', 'Steven Spielberg', 'Christopher Nolan', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Który zespół nagrał "Bohemian Rhapsody"?', 'Queen', 'The Beatles', 'Led Zeppelin', 'Pink Floyd', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Kto napisał "Harry''ego Pottera"?', 'J.K. Rowling', 'J.R.R. Tolkien', 'C.S. Lewis', 'George R.R. Martin', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Który film zdobył najwięcej Oscarów?', 'Titanic', 'Władca Pierścieni', 'Ben-Hur', 'Avatar', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Kto zagrał Tony''ego Starka w MCU?', 'Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Który artysta namalował "Gwiaździstą Noc"?', 'Vincent van Gogh', 'Pablo Picasso', 'Claude Monet', 'Salvador Dalí', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Jaka jest najdłuższa seria książkowa fantasy?', 'Wheel of Time', 'Pieśń Lodu i Ognia', 'Wiedźmin', 'Kroniki Narni', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Kto wyreżyserował trylogię "Władca Pierścieni"?', 'Peter Jackson', 'Ridley Scott', 'James Cameron', 'George Lucas', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Który serial HBO opowiada o rodzinie Stark?', 'Gra o Tron', 'Westworld', 'Spadkobiercy', 'The Wire', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Kto jest autorem "1984"?', 'George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'Philip K. Dick', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Która gra wideo ma największą sprzedaż?', 'Minecraft', 'GTA V', 'Tetris', 'Wii Sports', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Kto namalował "Mona Lisę"?', 'Leonardo da Vinci', 'Michał Anioł', 'Rafael', 'Donatello', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Który instrument gra główną rolę w "Czasie Apokalipsy"?', 'Helikopter', 'Gitara', 'Fortepian', 'Saksofon', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Kto napisał "Mistrza i Małgorzatę"?', 'Michaił Bułhakow', 'Fiodor Dostojewski', 'Lew Tołstoj', 'Anton Czechow', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Kultura'), 'Który film Disneya opowiada o dwóch siostrach?', 'Kraina Lodu', 'Moana', 'Vaiana', 'Tangled', 'easy', true, true);

    -- Przyroda (10 pytań)
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Które zwierzę jest największe na świecie?', 'Płetwale błękitne', 'Słoń afrykański', 'Wieloryb grenlandzki', 'Żyrafa', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Ile nóg ma pająk?', '8', '6', '10', '12', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Jak nazywa się największy las deszczowy?', 'Amazonia', 'Kongo', 'Borneo', 'Sumatra', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Który ptak nie potrafi latać?', 'Struś', 'Orzeł', 'Albatros', 'Pelikan', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Jak długo ciąża słonia trwa?', '22 miesiące', '12 miesięcy', '18 miesięcy', '9 miesięcy', 'hard', true, true),
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Które zwierzę może żyć bez wody najdłużej?', 'Wielbłąd', 'Kangur', 'Słoń', 'Żyrafa', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Jak nazywa się największy gatunek pingwina?', 'Pingwin cesarski', 'Pingwin królewsk', 'Pingwin Adeli', 'Pingwin maskowy', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Który owad produkuje miód?', 'Pszczoła', 'Osa', 'Trzmiel', 'Szerszeń', 'easy', true, true),
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Jak nazywa się proces, w którym gąsienica staje się motylem?', 'Metamorfoza', 'Ewolucja', 'Transformacja', 'Mutacja', 'medium', true, true),
    ((SELECT id FROM categories WHERE name = 'Przyroda'), 'Które zwierzę ma najdłuższą szyję?', 'Żyrafa', 'Wielbłąd', 'Struś', 'Lama', 'easy', true, true);

    RAISE NOTICE '✅ Dodano 100 pytań do bazy';
  ELSE
    RAISE NOTICE '⚠️ Pytania już istnieją w bazie (%), pomijam' , (SELECT COUNT(*) FROM questions);
  END IF;
END $$;

-- KROK 4: Weryfikacja
SELECT 
  'game_modes' as tabela,
  COUNT(*) as ilosc,
  CASE WHEN COUNT(*) >= 4 THEN '✅' ELSE '❌' END as status
FROM game_modes
UNION ALL
SELECT 
  'categories' as tabela,
  COUNT(*) as ilosc,
  CASE WHEN COUNT(*) >= 8 THEN '✅' ELSE '❌' END as status
FROM categories
UNION ALL
SELECT 
  'questions' as tabela,
  COUNT(*) as ilosc,
  CASE WHEN COUNT(*) >= 100 THEN '✅' ELSE '❌' END as status
FROM questions;

-- KROK 5: Sprawdź RLS policies
SELECT 
  tablename,
  COUNT(*) as policies_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'user_stats', 'games', 'game_participants', 'questions', 'categories')
GROUP BY tablename
ORDER BY tablename;
