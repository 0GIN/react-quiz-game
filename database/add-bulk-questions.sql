-- Dodaj nową kategorię "Gry Komputerowe"
INSERT INTO categories (name, icon_emoji, description, is_active)
VALUES ('Gry Komputerowe', '🎮', 'Pytania o gry wideo, esport i gaming', true)
ON CONFLICT (name) DO NOTHING;

-- Pobierz ID kategorii
DO $$
DECLARE
    gaming_cat_id INTEGER;
BEGIN
    -- Pobierz lub utwórz ID kategorii Gry Komputerowe
    SELECT id INTO gaming_cat_id FROM categories WHERE name = 'Gry Komputerowe';
    
    -- Użyj istniejących ID kategorii: 1=Historia, 2=Geografia, 3=Nauka

    -- ============================================
    -- PYTANIA Z KATEGORII: GRY KOMPUTEROWE (50 pytań)
    -- ============================================
    
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    (gaming_cat_id, 'W którym roku ukazała się pierwsza część gry "The Witcher"?', '2007', '2005', '2009', '2011', 'medium', true, true),
    (gaming_cat_id, 'Jaki jest najpopularniejszy tryb gry w Counter-Strike?', 'Defuse', 'Deathmatch', 'Arms Race', 'Casual', 'easy', true, true),
    (gaming_cat_id, 'Która firma stworzyła grę "Minecraft"?', 'Mojang', 'Microsoft', 'EA Games', 'Ubisoft', 'medium', true, true),
    (gaming_cat_id, 'Jak nazywa się główny bohater serii "Assassin''s Creed II"?', 'Ezio Auditore', 'Altair Ibn-La''Ahad', 'Connor Kenway', 'Edward Kenway', 'medium', true, true),
    (gaming_cat_id, 'W której grze występuje postać "Master Chief"?', 'Halo', 'Destiny', 'Titanfall', 'Call of Duty', 'easy', true, true),
    (gaming_cat_id, 'Który silnik graficzny został użyty w "Cyberpunk 2077"?', 'REDengine', 'Unreal Engine', 'Unity', 'CryEngine', 'hard', true, true),
    (gaming_cat_id, 'W której grze musimy przetrwać 5 nocy?', 'Five Nights at Freddy''s', 'Outlast', 'Amnesia', 'Resident Evil', 'easy', true, true),
    (gaming_cat_id, 'Jaki jest maksymalny poziom w Pokemon GO (stan na 2024)?', '50', '40', '60', '100', 'hard', true, true),
    (gaming_cat_id, 'Która gra z serii "Dark Souls" ukazała się jako pierwsza?', 'Dark Souls', 'Dark Souls II', 'Demon''s Souls', 'Bloodborne', 'medium', true, true),
    (gaming_cat_id, 'W której grze gramy jako Joel i Ellie?', 'The Last of Us', 'Uncharted', 'Tomb Raider', 'Horizon Zero Dawn', 'easy', true, true),
    
    (gaming_cat_id, 'Kto jest twórcą gry "Metal Gear Solid"?', 'Hideo Kojima', 'Shigeru Miyamoto', 'Hidetaka Miyazaki', 'Koji Igarashi', 'medium', true, true),
    (gaming_cat_id, 'W którym roku ukazała się gra "Half-Life 2"?', '2004', '2003', '2005', '2006', 'hard', true, true),
    (gaming_cat_id, 'Jaka waluta jest używana w grze "Fortnite"?', 'V-Bucks', 'Gold', 'Credits', 'Coins', 'easy', true, true),
    (gaming_cat_id, 'Który champion w League of Legends jest znany z hasła "Demacia!"?', 'Garen', 'Darius', 'Jarvan IV', 'Xin Zhao', 'medium', true, true),
    (gaming_cat_id, 'W której grze występuje broń "Portal Gun"?', 'Portal', 'Half-Life', 'Bioshock', 'Prey', 'easy', true, true),
    (gaming_cat_id, 'Jaki jest maksymalny rozmiar mapy w standardowym Minecrafcie?', '60 000 000 bloków', '30 000 000 bloków', '10 000 000 bloków', 'Nieskończony', 'hard', true, true),
    (gaming_cat_id, 'W której grze możemy grać jako "Geralt z Rivii"?', 'Wiedźmin 3', 'Skyrim', 'Dragon Age', 'Dark Souls', 'easy', true, true),
    (gaming_cat_id, 'Która firma wydała grę "Overwatch"?', 'Blizzard', 'Riot Games', 'Valve', 'Epic Games', 'easy', true, true),
    (gaming_cat_id, 'W której grze znajduje się lokacja "Raccoon City"?', 'Resident Evil', 'Silent Hill', 'Dead Space', 'The Evil Within', 'medium', true, true),
    (gaming_cat_id, 'Jaki jest nickname najlepszego gracza CS:GO (2023)?', 's1mple', 'NiKo', 'ZywOo', 'device', 'hard', true, true),
    
    (gaming_cat_id, 'W której grze możemy jeździć Batmobilem?', 'Batman: Arkham Knight', 'Batman: Arkham City', 'Batman: Arkham Origins', 'Batman: Arkham Asylum', 'medium', true, true),
    (gaming_cat_id, 'Która gra z serii "Grand Theft Auto" jest najlepiej sprzedającą się?', 'GTA V', 'GTA San Andreas', 'GTA IV', 'GTA Vice City', 'medium', true, true),
    (gaming_cat_id, 'W którym roku powstała gra "Pac-Man"?', '1980', '1978', '1982', '1985', 'hard', true, true),
    (gaming_cat_id, 'Jaki jest najpopularniejszy skin w CS:GO?', 'AWP Dragon Lore', 'AK-47 Fire Serpent', 'M4A4 Howl', 'Karambit Fade', 'hard', true, true),
    (gaming_cat_id, 'W której grze występuje postać "Kratos"?', 'God of War', 'Devil May Cry', 'Darksiders', 'Dante''s Inferno', 'easy', true, true),
    (gaming_cat_id, 'Która firma stworzyła serię "The Elder Scrolls"?', 'Bethesda', 'BioWare', 'CD Projekt Red', 'Obsidian', 'medium', true, true),
    (gaming_cat_id, 'W której grze możemy "gotta catch ''em all"?', 'Pokemon', 'Digimon', 'Monster Hunter', 'Temtem', 'easy', true, true),
    (gaming_cat_id, 'Jaki jest maksymalny poziom postaci w World of Warcraft: Dragonflight?', '70', '60', '80', '100', 'hard', true, true),
    (gaming_cat_id, 'W której grze występuje "Triforce"?', 'The Legend of Zelda', 'Final Fantasy', 'Dragon Quest', 'Kingdom Hearts', 'easy', true, true),
    (gaming_cat_id, 'Który boss w Dark Souls 3 jest ostatecznym przeciwnikiem?', 'Soul of Cinder', 'Nameless King', 'Pontiff Sulyvahn', 'Abyss Watchers', 'medium', true, true),
    
    (gaming_cat_id, 'W której grze możemy budować w trybie kreatywnym?', 'Minecraft', 'Terraria', 'Roblox', 'Wszystkie powyższe', 'easy', true, true),
    (gaming_cat_id, 'Jaki jest główny cel w grze "Among Us"?', 'Znaleźć impostera', 'Przetrwać', 'Zebrać monety', 'Uciec ze statku', 'easy', true, true),
    (gaming_cat_id, 'W której grze walczymy z "Colosami"?', 'Shadow of the Colossus', 'Dark Souls', 'Monster Hunter', 'Dragon''s Dogma', 'medium', true, true),
    (gaming_cat_id, 'Która gra battle royale jest najstarsza?', 'PUBG', 'Fortnite', 'Apex Legends', 'Call of Duty: Warzone', 'medium', true, true),
    (gaming_cat_id, 'W której grze możemy grać jako "Sonic"?', 'Sonic the Hedgehog', 'Crash Bandicoot', 'Spyro', 'Ratchet & Clank', 'easy', true, true),
    (gaming_cat_id, 'Jaki jest podstawowy cel w grze "Stardew Valley"?', 'Prowadzić farmę', 'Walczyć z potworami', 'Eksplorować podziemia', 'Budować dom', 'easy', true, true),
    (gaming_cat_id, 'W której grze występuje "Big Daddy"?', 'Bioshock', 'Fallout', 'Metro', 'Dishonored', 'medium', true, true),
    (gaming_cat_id, 'Która konsola sprzedała się najlepiej w historii?', 'PlayStation 2', 'Nintendo DS', 'PlayStation 4', 'Nintendo Switch', 'hard', true, true),
    (gaming_cat_id, 'W której grze możemy grać jako "Lara Croft"?', 'Tomb Raider', 'Uncharted', 'Horizon Zero Dawn', 'The Last of Us', 'easy', true, true),
    (gaming_cat_id, 'Jaki jest najpopularniejszy serwer w Minecraft?', 'Hypixel', '2b2t', 'Mineplex', 'CubeCraft', 'medium', true, true),
    
    (gaming_cat_id, 'W której grze możemy używać "Force"?', 'Star Wars Jedi: Fallen Order', 'Mass Effect', 'Destiny', 'Halo', 'easy', true, true),
    (gaming_cat_id, 'Która gra wprowadzła mechanikę "Bullet Time"?', 'Max Payne', 'The Matrix', 'F.E.A.R.', 'Superhot', 'hard', true, true),
    (gaming_cat_id, 'W której grze możemy grać jako "Nathan Drake"?', 'Uncharted', 'Tomb Raider', 'The Last of Us', 'Assassin''s Creed', 'easy', true, true),
    (gaming_cat_id, 'Jaki jest najpopularniejszy agent w Valorant?', 'Jett', 'Reyna', 'Sage', 'Phoenix', 'medium', true, true),
    (gaming_cat_id, 'W której grze występuje "Big Boss"?', 'Metal Gear Solid', 'Splinter Cell', 'Hitman', 'Deus Ex', 'medium', true, true),
    (gaming_cat_id, 'Która gra jest remake''iem "Resident Evil 2"?', 'Resident Evil 2 (2019)', 'Resident Evil 3 (2020)', 'Resident Evil 4 (2023)', 'Resident Evil 7', 'medium', true, true),
    (gaming_cat_id, 'W której grze możemy grać jako "CJ"?', 'GTA San Andreas', 'GTA Vice City', 'GTA IV', 'GTA V', 'easy', true, true),
    (gaming_cat_id, 'Jaki jest najdroższy skin w CS:GO?', 'Karambit Case Hardened Blue Gem', 'AWP Dragon Lore', 'M4A4 Howl', 'AK-47 Fire Serpent', 'hard', true, true),
    (gaming_cat_id, 'W której grze możemy grać jako "Arthur Morgan"?', 'Red Dead Redemption 2', 'Red Dead Redemption', 'GTA V', 'L.A. Noire', 'easy', true, true),
    (gaming_cat_id, 'Która gra jest najdłuższa w historii?', 'The Elder Scrolls V: Skyrim', 'The Witcher 3', 'Red Dead Redemption 2', 'Cyberpunk 2077', 'hard', true, true);

    -- ============================================
    -- PYTANIA Z KATEGORII: HISTORIA (30 pytań)
    -- ============================================
    
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    (historia_cat_id, 'W którym roku rozpoczęła się II Wojna Światowa?', '1939', '1938', '1940', '1941', 'easy', true, true),
    (historia_cat_id, 'Kto był pierwszym cesarzem Rzymu?', 'Oktawian August', 'Juliusz Cezar', 'Neron', 'Trajan', 'medium', true, true),
    (historia_cat_id, 'W którym roku upadł Mur Berliński?', '1989', '1987', '1991', '1985', 'easy', true, true),
    (historia_cat_id, 'Która bitwa zakończyła panowanie Napoleona?', 'Waterloo', 'Lipsk', 'Austerlitz', 'Jena', 'medium', true, true),
    (historia_cat_id, 'W którym roku Kolumb odkrył Amerykę?', '1492', '1488', '1498', '1502', 'easy', true, true),
    (historia_cat_id, 'Kto był ostatnim carem Rosji?', 'Mikołaj II', 'Aleksander III', 'Aleksander II', 'Piotr III', 'medium', true, true),
    (historia_cat_id, 'W którym roku podpisano Traktat Wersalski?', '1919', '1918', '1920', '1921', 'hard', true, true),
    (historia_cat_id, 'Która dynastia rządziła Polską najdłużej?', 'Piastowie', 'Jagiellonowie', 'Wazowie', 'Wettynowie', 'medium', true, true),
    (historia_cat_id, 'W którym roku nastąpił upadek Konstantynopola?', '1453', '1450', '1456', '1461', 'hard', true, true),
    (historia_cat_id, 'Kto był przywódcą III Rzeszy?', 'Adolf Hitler', 'Hermann Göring', 'Heinrich Himmler', 'Joseph Goebbels', 'easy', true, true),
    
    (historia_cat_id, 'W którym roku nastąpiło Powstanie Warszawskie?', '1944', '1943', '1945', '1942', 'medium', true, true),
    (historia_cat_id, 'Która bitwa była zwrotnym punktem II wojny światowej?', 'Stalingrad', 'Moskwa', 'Berlin', 'Kursk', 'hard', true, true),
    (historia_cat_id, 'W którym roku odbyła się Rewolucja Francuska?', '1789', '1792', '1785', '1795', 'easy', true, true),
    (historia_cat_id, 'Kto napisał "Manifest Komunistyczny"?', 'Karol Marks', 'Fryderyk Engels', 'Włodzimierz Lenin', 'Lew Trocki', 'medium', true, true),
    (historia_cat_id, 'W którym roku Polska odzyskała niepodległość?', '1918', '1919', '1917', '1920', 'easy', true, true),
    (historia_cat_id, 'Która dynastia panowała w Chinach najdłużej?', 'Zhou', 'Han', 'Tang', 'Ming', 'hard', true, true),
    (historia_cat_id, 'W którym roku nastąpił chrzest Polski?', '966', '965', '967', '968', 'easy', true, true),
    (historia_cat_id, 'Kto był pierwszym prezydentem USA?', 'George Washington', 'Thomas Jefferson', 'John Adams', 'Benjamin Franklin', 'easy', true, true),
    (historia_cat_id, 'W którym roku nastąpiła bitwa pod Grunwaldem?', '1410', '1409', '1411', '1412', 'medium', true, true),
    (historia_cat_id, 'Która cywilizacja zbudowała Machu Picchu?', 'Inkowie', 'Aztekowie', 'Majowie', 'Olmekowie', 'medium', true, true),
    
    (historia_cat_id, 'W którym roku nastąpił rozbiór Polski?', '1795', '1793', '1772', '1918', 'medium', true, true),
    (historia_cat_id, 'Kto był królem Polski podczas potopu szwedzkiego?', 'Jan Kazimierz', 'Jan III Sobieski', 'Zygmunt III Waza', 'Władysław IV', 'hard', true, true),
    (historia_cat_id, 'W którym roku nastąpiła bitwa pod Wiedniem?', '1683', '1680', '1686', '1690', 'medium', true, true),
    (historia_cat_id, 'Która wojna trwała najdłużej?', 'Wojna stuletnia', 'Wojna trzydziestoletnia', 'I wojna światowa', 'Wojna w Wietnamie', 'hard', true, true),
    (historia_cat_id, 'W którym roku nastąpił zamach na WTC?', '2001', '2000', '2002', '1999', 'easy', true, true),
    (historia_cat_id, 'Kto był królem podczas rozbicia dzielnicowego?', 'Bolesław Krzywousty', 'Bolesław Chrobry', 'Mieszko I', 'Kazimierz Wielki', 'medium', true, true),
    (historia_cat_id, 'W którym roku nastąpiło Powstanie Kościuszkowskie?', '1794', '1792', '1796', '1790', 'hard', true, true),
    (historia_cat_id, 'Która bitwa zakończyła I wojnę światową?', 'Compiègne', 'Verdun', 'Somma', 'Marna', 'hard', true, true),
    (historia_cat_id, 'W którym roku nastąpiła bitwa pod Kircholmem?', '1605', '1600', '1610', '1615', 'hard', true, true),
    (historia_cat_id, 'Kto był pierwszym królem Polski?', 'Bolesław Chrobry', 'Mieszko I', 'Bolesław Krzywousty', 'Kazimierz Wielki', 'easy', true, true);

    -- ============================================
    -- PYTANIA Z KATEGORII: GEOGRAFIA (30 pytań)
    -- ============================================
    
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    (geografia_cat_id, 'Jaka jest stolica Australii?', 'Canberra', 'Sydney', 'Melbourne', 'Brisbane', 'hard', true, true),
    (geografia_cat_id, 'Który ocean jest największy?', 'Pacyfik', 'Atlantyk', 'Indyjski', 'Arktyczny', 'easy', true, true),
    (geografia_cat_id, 'Jaka jest najwyższa góra świata?', 'Mount Everest', 'K2', 'Kanczendzonga', 'Lhotse', 'easy', true, true),
    (geografia_cat_id, 'W którym kraju znajduje się Machu Picchu?', 'Peru', 'Meksyk', 'Boliwia', 'Gwatemala', 'medium', true, true),
    (geografia_cat_id, 'Jaka jest stolica Islandii?', 'Reykjavik', 'Oslo', 'Helsinki', 'Kopenhaga', 'medium', true, true),
    (geografia_cat_id, 'Który kontynent jest najmniejszy?', 'Australia', 'Europa', 'Antarktyda', 'Ameryka Południowa', 'easy', true, true),
    (geografia_cat_id, 'Jaka jest najdłuższa rzeka świata?', 'Amazonka', 'Nil', 'Jangcy', 'Missisipi', 'hard', true, true),
    (geografia_cat_id, 'W którym kraju znajduje się pustynia Sahara?', 'Afryka Północna', 'Bliski Wschód', 'Australia', 'Azja', 'easy', true, true),
    (geografia_cat_id, 'Jaka jest stolica Kanady?', 'Ottawa', 'Toronto', 'Vancouver', 'Montreal', 'medium', true, true),
    (geografia_cat_id, 'Który kraj ma najwięcej wysp?', 'Szwecja', 'Norwegia', 'Finlandia', 'Kanada', 'hard', true, true),
    
    (geografia_cat_id, 'Jaka jest stolica Brazylii?', 'Brasilia', 'Rio de Janeiro', 'São Paulo', 'Salvador', 'medium', true, true),
    (geografia_cat_id, 'W którym kraju znajduje się Taj Mahal?', 'Indie', 'Pakistan', 'Nepal', 'Bangladesz', 'easy', true, true),
    (geografia_cat_id, 'Jaka jest najgłębsza depresja na Ziemi?', 'Rów Mariański', 'Dolina Śmierci', 'Morze Martwe', 'Depresja Kattara', 'medium', true, true),
    (geografia_cat_id, 'Który kraj ma najwięcej stref czasowych?', 'Francja', 'Rosja', 'USA', 'Wielka Brytania', 'hard', true, true),
    (geografia_cat_id, 'Jaka jest stolica Turcji?', 'Ankara', 'Stambuł', 'Izmir', 'Antalya', 'medium', true, true),
    (geografia_cat_id, 'W którym kraju znajduje się Wielki Kanion?', 'USA', 'Meksyk', 'Kanada', 'Australia', 'easy', true, true),
    (geografia_cat_id, 'Jaka jest najsuchsza pustynia świata?', 'Atakama', 'Sahara', 'Gobi', 'Kalahari', 'hard', true, true),
    (geografia_cat_id, 'Który kraj ma największą populację?', 'Indie', 'Chiny', 'USA', 'Indonezja', 'medium', true, true),
    (geografia_cat_id, 'Jaka jest stolica Norwegii?', 'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'easy', true, true),
    (geografia_cat_id, 'W którym kraju znajduje się Angkor Wat?', 'Kambodża', 'Tajlandia', 'Wietnam', 'Laos', 'medium', true, true),
    
    (geografia_cat_id, 'Jaka jest najwyższa góra Afryki?', 'Kilimandżaro', 'Mount Kenya', 'Atlas', 'Drakensbergi', 'medium', true, true),
    (geografia_cat_id, 'Który kraj ma najwięcej jezior?', 'Kanada', 'Finlandia', 'Szwecja', 'Rosja', 'hard', true, true),
    (geografia_cat_id, 'Jaka jest stolica Egiptu?', 'Kair', 'Aleksandria', 'Giza', 'Luksor', 'easy', true, true),
    (geografia_cat_id, 'W którym kraju znajduje się Petra?', 'Jordania', 'Izrael', 'Syria', 'Liban', 'medium', true, true),
    (geografia_cat_id, 'Jaka jest najniższa depresja w Polsce?', 'Raczki Elbląskie', 'Żuławy', 'Dolina Baryczy', 'Kotlina Sandomierska', 'hard', true, true),
    (geografia_cat_id, 'Który kraj ma najdłuższą linię brzegową?', 'Kanada', 'Norwegia', 'Indonezja', 'Rosja', 'hard', true, true),
    (geografia_cat_id, 'Jaka jest stolica Argentyny?', 'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'easy', true, true),
    (geografia_cat_id, 'W którym kraju znajduje się Wielki Mur?', 'Chiny', 'Mongolia', 'Korea Północna', 'Japonia', 'easy', true, true),
    (geografia_cat_id, 'Jaka jest najwyższa góra Europy?', 'Elbrus', 'Mont Blanc', 'Matterhorn', 'Monte Rosa', 'hard', true, true),
    (geografia_cat_id, 'Który kraj ma największą powierzchnię?', 'Rosja', 'Kanada', 'USA', 'Chiny', 'easy', true, true);

    -- ============================================
    -- PYTANIA Z KATEGORII: NAUKA (40 pytań)
    -- ============================================
    
    INSERT INTO questions (category_id, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, difficulty_level, is_approved, is_active) VALUES
    (nauka_cat_id, 'Jaki jest symbol chemiczny złota?', 'Au', 'Ag', 'Fe', 'Cu', 'medium', true, true),
    (nauka_cat_id, 'Ile planet jest w Układzie Słonecznym?', '8', '9', '7', '10', 'easy', true, true),
    (nauka_cat_id, 'Kto odkrył penicylinę?', 'Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Joseph Lister', 'medium', true, true),
    (nauka_cat_id, 'Jaka jest prędkość światła?', '300 000 km/s', '150 000 km/s', '500 000 km/s', '200 000 km/s', 'medium', true, true),
    (nauka_cat_id, 'Który pierwiastek ma symbol H?', 'Wodór', 'Hel', 'Hafn', 'Hasż', 'easy', true, true),
    (nauka_cat_id, 'Ile chromosomów ma człowiek?', '46', '44', '48', '42', 'medium', true, true),
    (nauka_cat_id, 'Kto sformułował teorię względności?', 'Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Max Planck', 'easy', true, true),
    (nauka_cat_id, 'Jaka jest jednostka siły w układzie SI?', 'Niuton', 'Dżul', 'Wat', 'Pascal', 'medium', true, true),
    (nauka_cat_id, 'Który organ produkuje insulinę?', 'Trzustka', 'Wątroba', 'Nerki', 'Śledziona', 'medium', true, true),
    (nauka_cat_id, 'Jaka jest temperatura wrzenia wody?', '100°C', '90°C', '110°C', '120°C', 'easy', true, true),
    
    (nauka_cat_id, 'Ile kości ma dorosły człowiek?', '206', '208', '204', '210', 'hard', true, true),
    (nauka_cat_id, 'Kto odkrył promieniotwórczość?', 'Maria Skłodowska-Curie', 'Albert Einstein', 'Ernest Rutherford', 'Niels Bohr', 'medium', true, true),
    (nauka_cat_id, 'Jaki jest symbol chemiczny rtęci?', 'Hg', 'Rh', 'Ra', 'Ru', 'hard', true, true),
    (nauka_cat_id, 'Ile wynosi przyspieszenie grawitacyjne na Ziemi?', '9.81 m/s²', '10 m/s²', '9.5 m/s²', '10.5 m/s²', 'medium', true, true),
    (nauka_cat_id, 'Która planeta jest największa w Układzie Słonecznym?', 'Jowisz', 'Saturn', 'Uran', 'Neptun', 'easy', true, true),
    (nauka_cat_id, 'Jaki jest najlżejszy pierwiastek?', 'Wodór', 'Hel', 'Lit', 'Beryl', 'easy', true, true),
    (nauka_cat_id, 'Ile warstw ma atmosfera Ziemi?', '5', '3', '7', '4', 'hard', true, true),
    (nauka_cat_id, 'Kto wynalazł żarówkę?', 'Thomas Edison', 'Nikola Tesla', 'Benjamin Franklin', 'Alexander Graham Bell', 'easy', true, true),
    (nauka_cat_id, 'Jaka jest jednostka mocy w układzie SI?', 'Wat', 'Dżul', 'Niuton', 'Amper', 'medium', true, true),
    (nauka_cat_id, 'Który gaz jest najobfitszy w atmosferze Ziemi?', 'Azot', 'Tlen', 'Dwutlenek węgla', 'Argon', 'medium', true, true),
    
    (nauka_cat_id, 'Ile warstw ma DNA?', '2', '3', '4', '1', 'medium', true, true),
    (nauka_cat_id, 'Kto odkrył prawa ruchu planet?', 'Johannes Kepler', 'Galileusz', 'Kopernik', 'Newton', 'hard', true, true),
    (nauka_cat_id, 'Jaki jest symbol chemiczny potasu?', 'K', 'P', 'Po', 'Pt', 'hard', true, true),
    (nauka_cat_id, 'Ile wynosi pH neutralne?', '7', '6', '8', '5', 'easy', true, true),
    (nauka_cat_id, 'Która planeta jest najbliżej Słońca?', 'Merkury', 'Wenus', 'Ziemia', 'Mars', 'easy', true, true),
    (nauka_cat_id, 'Jaki jest najcięższy pierwiastek naturalny?', 'Uran', 'Pluton', 'Tor', 'Radon', 'hard', true, true),
    (nauka_cat_id, 'Ile wynosi stała Avogadro?', '6.022×10²³', '6.022×10²²', '6.022×10²⁴', '6.022×10²¹', 'hard', true, true),
    (nauka_cat_id, 'Kto sformułował prawa termodynamiki?', 'Rudolf Clausius', 'James Joule', 'Lord Kelvin', 'Sadi Carnot', 'hard', true, true),
    (nauka_cat_id, 'Jaka jest jednostka napięcia elektrycznego?', 'Wolt', 'Amper', 'Om', 'Wat', 'medium', true, true),
    (nauka_cat_id, 'Który metal jest w stanie ciekłym w temperaturze pokojowej?', 'Rtęć', 'Gal', 'Cez', 'Rubid', 'medium', true, true),
    
    (nauka_cat_id, 'Ile wynosi liczba π (w przybliżeniu)?', '3.14', '3.15', '3.13', '3.16', 'easy', true, true),
    (nauka_cat_id, 'Kto wynalazł dynamit?', 'Alfred Nobel', 'Thomas Edison', 'Marie Curie', 'Louis Pasteur', 'medium', true, true),
    (nauka_cat_id, 'Jaki jest symbol chemiczny sodu?', 'Na', 'S', 'So', 'Sd', 'medium', true, true),
    (nauka_cat_id, 'Ile wynosi prędkość dźwięku w powietrzu?', '343 m/s', '300 m/s', '400 m/s', '500 m/s', 'hard', true, true),
    (nauka_cat_id, 'Która planeta ma najwięcej księżyców?', 'Saturn', 'Jowisz', 'Uran', 'Neptun', 'hard', true, true),
    (nauka_cat_id, 'Jaki jest najrzadszy pierwiastek na Ziemi?', 'Astat', 'Francium', 'Technecium', 'Promethium', 'hard', true, true),
    (nauka_cat_id, 'Ile wynosi zero bezwzględne?', '-273.15°C', '-273°C', '-274°C', '-272°C', 'hard', true, true),
    (nauka_cat_id, 'Kto odkrył elektron?', 'J.J. Thomson', 'Ernest Rutherford', 'Niels Bohr', 'James Chadwick', 'hard', true, true),
    (nauka_cat_id, 'Jaka jest jednostka częstotliwości?', 'Herc', 'Om', 'Wat', 'Dżul', 'medium', true, true),
    (nauka_cat_id, 'Który kwas znajduje się w żołądku?', 'Kwas solny', 'Kwas siarkowy', 'Kwas octowy', 'Kwas azotowy', 'easy', true, true);

    -- Aktualizuj licznik pytań w kategoriach
    UPDATE categories SET question_count = (
        SELECT COUNT(*) FROM questions WHERE questions.category_id = categories.id
    );
    
END $$;

-- Pokaż podsumowanie
SELECT 
    c.name as kategoria,
    c.icon_emoji,
    COUNT(q.id) as liczba_pytan
FROM categories c
LEFT JOIN questions q ON c.id = q.category_id
GROUP BY c.id, c.name, c.icon_emoji
ORDER BY c.name;
