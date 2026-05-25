INSERT INTO niveaux (code, libelle, ordre) VALUES
  ('licence1','Licence 1',1),('licence2','Licence 2',2),
  ('licence3','Licence 3',3),('master1','Master 1',4),
  ('master2','Master 2',5),('bts','BTS',6)
ON CONFLICT (code) DO NOTHING;

INSERT INTO matieres (code, libelle) VALUES
  ('mathematiques','Mathematiques'),('physique','Physique'),
  ('informatique','Informatique'),('economie','Economie'),
  ('droit','Droit'),('svt','SVT')
ON CONFLICT (code) DO NOTHING;

INSERT INTO matieres_niveaux (matiere_id, niveau_id)
SELECT m.id, n.id FROM matieres m, niveaux n
WHERE m.code = 'informatique' AND n.code IN ('licence1','licence2','licence3','master1')
ON CONFLICT DO NOTHING;

INSERT INTO matieres_niveaux (matiere_id, niveau_id)
SELECT m.id, n.id FROM matieres m, niveaux n
WHERE m.code = 'mathematiques' AND n.code IN ('licence1','licence2','licence3')
ON CONFLICT DO NOTHING;

INSERT INTO matieres_niveaux (matiere_id, niveau_id)
SELECT m.id, n.id FROM matieres m, niveaux n
WHERE m.code IN ('economie','droit') AND n.code IN ('licence1','licence2','bts')
ON CONFLICT DO NOTHING;

INSERT INTO cours (titre, matiere_id, niveau_id, version_sms) VALUES
(
  'Algorithmes et complexite',
  (SELECT id FROM matieres WHERE code='informatique'),
  (SELECT id FROM niveaux   WHERE code='licence2'),
  'INFO L2 - Algo: O(n)=temps proportionnel a n. Tri bulles O(n2), rapide O(n log n). Recursivite: f(n)=f(n-1)+f(n-2). Pile=LIFO, File=FIFO. Karambig Roogo *305#'
),
(
  'Bases de donnees relationnelles',
  (SELECT id FROM matieres WHERE code='informatique'),
  (SELECT id FROM niveaux   WHERE code='licence3'),
  'INFO L3 - BDD: Table=entite, Cle primaire=ID unique, Cle etrangere=lien entre tables. SQL: SELECT col FROM table WHERE cond. JOIN=jointure. INDEX=acceleration. Karambig Roogo *305#'
),
(
  'Suites numeriques L1',
  (SELECT id FROM matieres WHERE code='mathematiques'),
  (SELECT id FROM niveaux   WHERE code='licence1'),
  'MATH L1 - Suites: arithmetique Un=U0+nr, geometrique Un=U0*q^n. Somme arith: n(U0+Un)/2. Somme geo: U0(1-q^n)/(1-q). Si |q|<1 alors q^n->0. Karambig Roogo *305#'
);

INSERT INTO sujets (titre, matiere_id, niveau_id, type, annee, statut, version_sms) VALUES
(
  'Examen final Informatique L2 2024',
  (SELECT id FROM matieres WHERE code='informatique'),
  (SELECT id FROM niveaux   WHERE code='licence2'),
  'examen_final', 2024, 'valide',
  'INFO L2 EF2024 - Q1:Complexite tri fusion=O(n log n). Q2:Pile vide si sommet=-1. Q3:File circulaire:rear=(rear+1)%n. Q4:Fibo recursif=2^n-1 appels. Karambig Roogo *305#'
),
(
  'Partiel Mathematiques L1 S1',
  (SELECT id FROM matieres WHERE code='mathematiques'),
  (SELECT id FROM niveaux   WHERE code='licence1'),
  'partiel_td', 2024, 'valide',
  'MATH L1 TD - Ex1:Suite arith U0=2 r=3, U10=32. Ex2:Suite geo U0=1 q=2, S5=31. Ex3:Limite (3n+1)/(n+2)=3. Ex4:Derivee x^3-2x=3x^2-2. Karambig Roogo *305#'
);
