-- ========================================
-- 100 Pytań Quizowych - Seed Data
-- QuizRush Database
-- Kategorie: Historia, Geografia, Nauka, Sport, Rozrywka, Technologia
-- ========================================

-- HISTORIA (20 pytan)
INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, points_value, is_approved, is_active) VALUES
(1, 'W którym roku rozpoczęła się II wojna światowa?', '1939', '1914', '1941', '1945', 'easy', 10, true, true),
(1, 'Kto był pierwszym prezydentem USA?', 'George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'John Adams', 'easy', 10, true, true),
(1, 'W którym roku upadł mur berliński?', '1989', '1991', '1985', '1987', 'medium', 15, true, true),
(1, 'Która bitwa zakończyła się klęską Napoleona w 1815 roku?', 'Waterloo', 'Austerlitz', 'Jena', 'Lipsk', 'medium', 15, true, true),
(1, 'Kto odkrył Amerykę w 1492 roku?', 'Krzysztof Kolumb', 'Amerigo Vespucci', 'Ferdynand Magellan', 'Vasco da Gama', 'easy', 10, true, true),
(1, 'W którym roku podpisano traktat wersalski?', '1919', '1918', '1920', '1921', 'medium', 15, true, true),
(1, 'Kto był królem Polski podczas bitwy pod Grunwaldem?', 'Władysław Jagiełło', 'Kazimierz Wielki', 'Bolesław Chrobry', 'Zygmunt Stary', 'medium', 15, true, true),
(1, 'W którym roku nastąpił rozbiór Polski?', '1795', '1772', '1793', '1815', 'medium', 15, true, true),
(1, 'Kto był przywódcą ZSRR podczas II wojny światowej?', 'Józef Stalin', 'Władimir Lenin', 'Nikita Chruszczow', 'Leonid Breżniew', 'easy', 10, true, true),
(1, 'Która dynastia rządziła Francją przed rewolucją?', 'Burbonowie', 'Habsburgowie', 'Wettynowie', 'Medyceusze', 'hard', 20, true, true),
(1, 'W którym roku Polska odzyskała niepodległość?', '1918', '1919', '1920', '1921', 'easy', 10, true, true),
(1, 'Kto napisał "Quo vadis"?', 'Henryk Sienkiewicz', 'Bolesław Prus', 'Adam Mickiewicz', 'Juliusz Słowacki', 'medium', 15, true, true),
(1, 'W którym roku wybuchła rewolucja francuska?', '1789', '1799', '1776', '1815', 'medium', 15, true, true),
(1, 'Kto był pierwszym cesarzem Rzymu?', 'Oktawian August', 'Juliusz Cezar', 'Nero', 'Kaligula', 'medium', 15, true, true),
(1, 'W którym roku zakończyła się I wojna światowa?', '1918', '1919', '1917', '1920', 'easy', 10, true, true),
(1, 'Która bitwa była zwrotnym punktem II wojny światowej na froncie wschodnim?', 'Stalingrad', 'Kursk', 'Moskwa', 'Berlin', 'hard', 20, true, true),
(1, 'Kto był królem Polski w czasie potopu szwedzkiego?', 'Jan Kazimierz', 'Władysław IV', 'Jan III Sobieski', 'Zygmunt III Waza', 'hard', 20, true, true),
(1, 'W którym roku Polska wstąpiła do Unii Europejskiej?', '2004', '2003', '2005', '2007', 'easy', 10, true, true),
(1, 'Kto był przywódcą III Rzeszy?', 'Adolf Hitler', 'Hermann Göring', 'Joseph Goebbels', 'Heinrich Himmler', 'easy', 10, true, true),
(1, 'W którym roku nastąpił upadek Konstantynopola?', '1453', '1492', '1520', '1389', 'hard', 20, true, true);

-- GEOGRAFIA (20 pytan)
INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, points_value, is_approved, is_active) VALUES
(2, 'Jaka jest stolica Francji?', 'Paryż', 'Londyn', 'Berlin', 'Rzym', 'easy', 10, true, true),
(2, 'Która rzeka jest najdłuższa na świecie?', 'Nil', 'Amazonka', 'Jangcy', 'Mississippi', 'medium', 15, true, true),
(2, 'Na którym kontynencie leży Australia?', 'Oceania', 'Azja', 'Afryka', 'Ameryka Południowa', 'easy', 10, true, true),
(2, 'Jaka jest najwyższa góra świata?', 'Mount Everest', 'K2', 'Kilimandżaro', 'Mont Blanc', 'easy', 10, true, true),
(2, 'Która pustynia jest największa na świecie?', 'Sahara', 'Gobi', 'Atacama', 'Kalahari', 'medium', 15, true, true),
(2, 'Jaka jest stolica Japonii?', 'Tokio', 'Kioto', 'Osaka', 'Hiroszima', 'easy', 10, true, true),
(2, 'Który ocean jest największy?', 'Spokojny', 'Atlantycki', 'Indyjski', 'Arktyczny', 'easy', 10, true, true),
(2, 'W którym kraju znajduje się Taj Mahal?', 'Indie', 'Pakistan', 'Bangladesz', 'Nepal', 'medium', 15, true, true),
(2, 'Jaka jest stolica Polski?', 'Warszawa', 'Kraków', 'Gdańsk', 'Wrocław', 'easy', 10, true, true),
(2, 'Która wyspa jest największa na świecie?', 'Grenlandia', 'Nowa Gwinea', 'Borneo', 'Madagaskar', 'medium', 15, true, true),
(2, 'W którym kraju znajduje się Wielki Kanion?', 'USA', 'Meksyk', 'Kanada', 'Australia', 'easy', 10, true, true),
(2, 'Jaka jest stolica Hiszpanii?', 'Madryt', 'Barcelona', 'Sewilla', 'Walencja', 'easy', 10, true, true),
(2, 'Który kraj ma największą powierzchnię?', 'Rosja', 'Kanada', 'Chiny', 'USA', 'easy', 10, true, true),
(2, 'Jaka jest stolica Australii?', 'Canberra', 'Sydney', 'Melbourne', 'Brisbane', 'hard', 20, true, true),
(2, 'W którym kraju znajduje się Mount Kilimanjaro?', 'Tanzania', 'Kenia', 'Uganda', 'Etiopia', 'medium', 15, true, true),
(2, 'Która rzeka przepływa przez Paryż?', 'Sekwana', 'Tamiza', 'Ren', 'Dunaj', 'medium', 15, true, true),
(2, 'Jaka jest stolica Kanady?', 'Ottawa', 'Toronto', 'Montreal', 'Vancouver', 'medium', 15, true, true),
(2, 'Który kraj ma najwięcej wysp?', 'Szwecja', 'Norwegia', 'Kanada', 'Indonezja', 'hard', 20, true, true),
(2, 'W którym kraju znajduje się Machu Picchu?', 'Peru', 'Boliwia', 'Ekwador', 'Chile', 'medium', 15, true, true),
(2, 'Jaka jest stolica Egiptu?', 'Kair', 'Aleksandria', 'Luksor', 'Asuan', 'easy', 10, true, true);

-- NAUKA (20 pytan)
INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, points_value, is_approved, is_active) VALUES
(3, 'Jaki jest symbol chemiczny wody?', 'H2O', 'CO2', 'O2', 'H2SO4', 'easy', 10, true, true),
(3, 'Ile planet jest w Układzie Słonecznym?', '8', '7', '9', '10', 'easy', 10, true, true),
(3, 'Która planeta jest najbliżej Słońca?', 'Merkury', 'Wenus', 'Ziemia', 'Mars', 'easy', 10, true, true),
(3, 'Jaki jest symbol chemiczny złota?', 'Au', 'Ag', 'Fe', 'Cu', 'medium', 15, true, true),
(3, 'Kto sformułował teorię względności?', 'Albert Einstein', 'Isaac Newton', 'Nikola Tesla', 'Stephen Hawking', 'easy', 10, true, true),
(3, 'Ile chromosomów ma człowiek?', '46', '44', '48', '50', 'medium', 15, true, true),
(3, 'Która planeta jest największa w Układzie Słonecznym?', 'Jowisz', 'Saturn', 'Uran', 'Neptun', 'easy', 10, true, true),
(3, 'Jaki gaz stanowi największą część atmosfery Ziemi?', 'Azot', 'Tlen', 'Dwutlenek węgla', 'Argon', 'medium', 15, true, true),
(3, 'Kto odkrył penicylinę?', 'Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Marie Curie', 'medium', 15, true, true),
(3, 'Ile wynosi prędkość światła?', '300 000 km/s', '150 000 km/s', '450 000 km/s', '600 000 km/s', 'medium', 15, true, true),
(3, 'Jaki jest symbol chemiczny żelaza?', 'Fe', 'Zn', 'Pb', 'Cu', 'easy', 10, true, true),
(3, 'Który naukowiec sformułował prawa ruchu?', 'Isaac Newton', 'Galileusz', 'Kepler', 'Kopernik', 'medium', 15, true, true),
(3, 'Ile stopni Celsjusza to 0 stopni Fahrenheita?', '-17,8°C', '0°C', '-32°C', '-40°C', 'hard', 20, true, true),
(3, 'Która planeta jest znana jako "Czerwona Planeta"?', 'Mars', 'Wenus', 'Jowisz', 'Saturn', 'easy', 10, true, true),
(3, 'Jaki jest symbol chemiczny srebra?', 'Ag', 'Au', 'Al', 'Ar', 'medium', 15, true, true),
(3, 'Kto odkrył grawitację?', 'Isaac Newton', 'Albert Einstein', 'Galileusz', 'Kopernik', 'easy', 10, true, true),
(3, 'Ile kości ma dorosły człowiek?', '206', '210', '200', '195', 'hard', 20, true, true),
(3, 'Która planeta ma największą liczbę księżyców?', 'Saturn', 'Jowisz', 'Uran', 'Neptun', 'hard', 20, true, true),
(3, 'Jaki jest symbol chemiczny węgla?', 'C', 'Ca', 'Co', 'Cr', 'easy', 10, true, true),
(3, 'Kto wynalazł żarówkę?', 'Thomas Edison', 'Nikola Tesla', 'Alexander Bell', 'Benjamin Franklin', 'medium', 15, true, true);

-- SPORT (15 pytan)
INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, points_value, is_approved, is_active) VALUES
(4, 'Ile graczy ma drużyna piłkarska na boisku?', '11', '10', '12', '9', 'easy', 10, true, true),
(4, 'W którym kraju odbędą się najbliższe Igrzyska Olimpijskie?', 'Francja', 'Japonia', 'USA', 'Australia', 'medium', 15, true, true),
(4, 'Kto jest rekordzistą świata w sprincie na 100m?', 'Usain Bolt', 'Carl Lewis', 'Jesse Owens', 'Justin Gatlin', 'easy', 10, true, true),
(4, 'Ile setów trzeba wygrać w tenisie żeby wygrać mecz (mężczyźni, Grand Slam)?', '3', '2', '4', '5', 'medium', 15, true, true),
(4, 'Która reprezentacja wygrała Mistrzostwa Świata 2018?', 'Francja', 'Chorwacja', 'Niemcy', 'Brazylia', 'easy', 10, true, true),
(4, 'W którym sporcie gra się o Puchar Stanleya?', 'Hokej', 'Baseball', 'Koszykówka', 'Futbol amerykański', 'medium', 15, true, true),
(4, 'Ile punktów jest za rzut wolny w koszykówce?', '1', '2', '3', '0', 'easy', 10, true, true),
(4, 'Kto jest najlepszym strzelcem w historii piłki nożnej?', 'Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Diego Maradona', 'medium', 15, true, true),
(4, 'W którym roku Robert Lewandowski został Piłkarzem Roku FIFA?', '2020', '2019', '2021', '2018', 'medium', 15, true, true),
(4, 'Ile rund ma mecz bokserski zawodowego?', '12', '10', '15', '8', 'medium', 15, true, true),
(4, 'Która reprezentacja ma najwięcej tytułów mistrzowskich w piłce nożnej?', 'Brazylia', 'Niemcy', 'Włochy', 'Argentyna', 'easy', 10, true, true),
(4, 'W którym roku Polska wygrała siatkówkę na Mistrzostwach Świata?', '2018', '2014', '2016', '2019', 'medium', 15, true, true),
(4, 'Ile medalów olimpijskich zdobył Michael Phelps?', '28', '25', '30', '23', 'hard', 20, true, true),
(4, 'W którym mieście odbyły się pierwsze nowożytne Igrzyska Olimpijskie?', 'Ateny', 'Paryż', 'Londyn', 'Los Angeles', 'medium', 15, true, true),
(4, 'Kto wygrał najwięcej turniejów tenisowych Wielkiego Szlema?', 'Novak Djokovic', 'Roger Federer', 'Rafael Nadal', 'Pete Sampras', 'medium', 15, true, true);

-- ROZRYWKA (15 pytan)
INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, points_value, is_approved, is_active) VALUES
(5, 'Kto wyreżyserował film "Titanic"?', 'James Cameron', 'Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese', 'easy', 10, true, true),
(5, 'Która postać z "Gwiezdnych Wojen" mówi: "Niech Moc będzie z tobą"?', 'Obi-Wan Kenobi', 'Luke Skywalker', 'Han Solo', 'Darth Vader', 'easy', 10, true, true),
(5, 'Kto napisał "Harryego Pottera"?', 'J.K. Rowling', 'J.R.R. Tolkien', 'George R.R. Martin', 'Stephen King', 'easy', 10, true, true),
(5, 'W którym roku powstał serial "Przyjaciele"?', '1994', '1990', '1996', '1998', 'medium', 15, true, true),
(5, 'Który film wygrał najwięcej Oscarów?', 'Titanic', 'Władca Pierścieni', 'Ben Hur', 'Parasite', 'hard', 20, true, true),
(5, 'Kto zagrał Iron Mana w MCU?', 'Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo', 'easy', 10, true, true),
(5, 'Która piosenka jest najczęściej streamowana na Spotify?', 'Blinding Lights', 'Shape of You', 'Despacito', 'Someone Like You', 'medium', 15, true, true),
(5, 'Kto wyreżyserował "Pulp Fiction"?', 'Quentin Tarantino', 'Martin Scorsese', 'Coen Brothers', 'David Fincher', 'easy', 10, true, true),
(5, 'W którym roku powstał Netflix?', '1997', '2000', '2003', '1995', 'medium', 15, true, true),
(5, 'Kto zagrał Jokera w "Mrocznym Rycerzu"?', 'Heath Ledger', 'Jack Nicholson', 'Joaquin Phoenix', 'Jared Leto', 'easy', 10, true, true),
(5, 'Która gra wideo sprzedała się w największej liczbie egzemplarzy?', 'Minecraft', 'GTA V', 'Tetris', 'Fortnite', 'medium', 15, true, true),
(5, 'Kto wykonał utwór "Bohemian Rhapsody"?', 'Queen', 'The Beatles', 'Led Zeppelin', 'Pink Floyd', 'easy', 10, true, true),
(5, 'W którym roku powstał YouTube?', '2005', '2003', '2007', '2000', 'medium', 15, true, true),
(5, 'Kto wyreżyserował "Incepcję"?', 'Christopher Nolan', 'Denis Villeneuve', 'Ridley Scott', 'James Cameron', 'easy', 10, true, true),
(5, 'Która postać Disney jest najstarsza?', 'Myszka Miki', 'Donald Duck', 'Goofy', 'Pluto', 'medium', 15, true, true),

-- TECHNOLOGIA (10 pytan)
INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, points_value, is_approved, is_active) VALUES
(6, 'Kto założył firmę Apple?', 'Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Elon Musk', 'easy', 10, true, true),
(6, 'W którym roku powstał internet?', '1983', '1990', '1975', '1969', 'medium', 15, true, true),
(6, 'Która firma stworzyła system operacyjny Android?', 'Google', 'Apple', 'Microsoft', 'Samsung', 'easy', 10, true, true),
(6, 'Ile bitów ma bajt?', '8', '4', '16', '32', 'easy', 10, true, true),
(6, 'Kto wynalazł World Wide Web?', 'Tim Berners-Lee', 'Bill Gates', 'Steve Jobs', 'Mark Zuckerberg', 'medium', 15, true, true),
(6, 'W którym języku programowania napisano Minecraft?', 'Java', 'C++', 'Python', 'JavaScript', 'medium', 15, true, true),
(6, 'Która firma jest właścicielem WhatsApp?', 'Meta', 'Google', 'Microsoft', 'Amazon', 'easy', 10, true, true),
(6, 'W którym roku powstał Facebook?', '2004', '2003', '2005', '2006', 'easy', 10, true, true),
(6, 'Co oznacza skrót AI?', 'Artificial Intelligence', 'Advanced Internet', 'Automated Integration', 'Applied Innovation', 'easy', 10, true, true),
(6, 'Która firma stworzyła ChatGPT?', 'OpenAI', 'Google', 'Microsoft', 'Meta', 'easy', 10, true, true);

-- Sprawdź dodane pytania
SELECT 
    c.name as kategoria,
    COUNT(*) as liczba_pytan,
    COUNT(CASE WHEN difficulty_level = 'easy' THEN 1 END) as easy,
    COUNT(CASE WHEN difficulty_level = 'medium' THEN 1 END) as medium,
    COUNT(CASE WHEN difficulty_level = 'hard' THEN 1 END) as hard
FROM questions q
JOIN categories c ON q.category_id = c.id
GROUP BY c.name
ORDER BY c.id;

-- Podsumowanie
SELECT 
    COUNT(*) as total_questions,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as approved,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active
FROM questions;
