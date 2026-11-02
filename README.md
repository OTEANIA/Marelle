# Marelle Desktop — React + Electron (v3.2.1)

Application de bureau locale pour Windows et macOS. Aucun hébergement, compte mail, Supabase ni abonnement nécessaire. Les préparations sont enregistrées dans un fichier de l’ordinateur. Internet est nécessaire pour installer les dépendances et fabriquer les installateurs, pas pour l’utilisation quotidienne.

## Ce dossier contient du code source

L’archive n’est pas un installateur : suivre les commandes ci-dessous pour lancer le projet et fabriquer une application double-cliquable. Les dépendances et les exécutables volumineux ne sont pas inclus. Les icônes PNG, ICO et ICNS sont déjà fournies dans `build-resources` et configurées : il n’est pas nécessaire de les générer.

## 1. Premier lancement pour développer ou tester

Installer Node.js 22 ou supérieur depuis https://nodejs.org, puis extraire l’archive. Ouvrir un terminal dans le dossier `marelle-desktop` (celui contenant `package.json`).

```bash
npm ci
npm start
```

Si npm signale que les scripts d’esbuild ou electron-winstaller sont en attente, exécuter `npm install-scripts approve electron-winstaller esbuild`, puis `npm rebuild electron-winstaller esbuild`, avant `npm start`. Cette étape ne concerne que les versions de npm qui affichent cet avertissement.

`npm ci` télécharge notamment Electron : la première installation peut prendre plusieurs minutes. `npm start` compile React puis ouvre l’application Electron. Saisir le nom et la classe au premier démarrage ; ils restent modifiables dans Mon profil.

Ne pas ouvrir `index.html` en double-cliquant. Utiliser `npm start` ou, après fabrication, l’application installée.

Pour travailler seulement sur l’interface dans un navigateur :

```bash
npm run dev
```

Ce dernier mode est un aperçu web, avec stockage navigateur ; ce n’est pas la sauvegarde fichier de la version Electron. Les données de cet aperçu ne sont pas transférées automatiquement à l’application. Exporter puis importer un JSON pour les reprendre.

## 2. Fabriquer une application Windows

Sur un PC Windows, dans le même dossier :

```bash
npm ci
npm run dist:win
```

Le dossier `release` reçoit l’installateur `.exe`. Transmettre cet installateur au binôme ; Node.js ne sera pas nécessaire chez la personne qui installe l’application. Après installation, ouvrir Marelle depuis son raccourci.

## 3. Fabriquer une application macOS

Sur un Mac :

```bash
npm ci
npm run dist:mac
```

Le dossier `release` reçoit le `.dmg` et une archive de l’application. Ouvrir le `.dmg` puis copier Marelle dans Applications. L’architecture produite par défaut est celle du Mac de compilation ; tester sur les modèles de Mac auxquels vous destinez l’application. Ne pas supposer qu’une compilation couvre automatiquement Intel et Apple Silicon.

Fabriquer et vérifier la version Windows sur Windows et la version macOS sur Mac est la voie recommandée. La signature Windows et la signature/notarisation Apple ne sont pas configurées : un système peut avertir ou bloquer une application non signée. Une distribution publique soignée nécessite de mettre en place les identités de signature adaptées. Aucun contournement de ces protections n’est automatisé.

## 4. Données locales et récupération

Dans le menu, `Dossier de données` ouvre le répertoire contenant :

- `marelle.json` : profil, thème, horaires et séances.
- `marelle.json.bak` : version précédente avant la dernière écriture.

Ce dossier se trouve dans le répertoire `userData` Electron de Marelle : généralement `%APPDATA%/Marelle/data` sur Windows et `~/Library/Application Support/Marelle/data` sur macOS. Le bouton de l’application reste le moyen fiable de retrouver le chemin réel.

L’enregistrement est automatique après les modifications validées, avec écritures ordonnées et remplacement du fichier après préparation d’une copie temporaire. La fermeture normale de la fenêtre attend la sauvegarde. Une séance encore ouverte dans son formulaire doit être enregistrée avec son bouton : fermer la fenêtre ne valide pas automatiquement ce formulaire.

En cas d’erreur d’écriture, l’application signale l’erreur et empêche la fermeture normale tant que la sauvegarde n’a pas réussi. Un arrêt forcé du système peut toujours perdre les dernières modifications non écrites.

Conserver régulièrement un export JSON sur un support distinct : clé USB, disque externe ou dossier synchronisé. Le fichier `.bak` sur le même disque protège contre certaines erreurs de manipulation, pas contre une panne du disque.

Si `marelle.json` est illisible : fermer Marelle, conserver une copie du fichier défectueux, puis remettre une copie saine (éventuellement `marelle.json.bak`, renommée en `marelle.json`) dans ce dossier et relancer. L’application n’écrase pas automatiquement un fichier qu’elle n’arrive pas à lire.

Les données ne sont pas chiffrées par l’application. Chaque session système possède son dossier ; deux personnes utilisant la même session Windows/macOS partagent ce dossier.

## 5. Partager avec son binôme ou migrer

Chaque installation possède ses données indépendantes. Pour transmettre une préparation, utiliser `Sauvegarder mes données`, envoyer le JSON et utiliser `Restaurer une sauvegarde` sur l’autre ordinateur. La restauration remplace le planning courant : elle ne fusionne pas les plannings.

La même procédure reprend un export JSON de l’ancienne version web de Marelle. Aucun accès automatique aux données Supabase ou à celles d’un autre navigateur n’est effectué. Les exports de planning ne transportent pas le profil : chaque personne conserve son propre nom et son thème.

## 6. Responsive et impression

L’interface comprend des adaptations aux petites fenêtres (seuils de 1100 et 700 px). Les formulaires sont défilants ; sur une petite fenêtre le semainier conserve un défilement horizontal plutôt que cinq colonnes illisibles. La fenêtre native a une largeur minimale de 420 px. La version de bureau cible les ordinateurs ; cette archive ne produit pas d’application Android/iOS.

Les fiches de séance sont configurées en **A4 portrait, 210 × 297 mm**, avec marges d’impression nulles. Les fonds sont à **20 % d’opacité**, désactivables pour chaque séance. Le texte reste à pleine opacité. L’impression Electron demande aussi explicitement le papier A4 et l’orientation portrait.

Les boutons `Aperçu / PDF` et `Cahier du jour` ouvrent le dialogue d’impression du système. Sur macOS, utiliser le menu PDF ; sur Windows, sélectionner une imprimante PDF si disponible, par exemple Microsoft Print to PDF. Vérifier le format A4, le mode portrait et une échelle de 100 % dans le dialogue.

Une fiche trop longue peut occuper plusieurs pages : A4 portrait ne signifie pas automatiquement une seule page. La condensation automatique n’est pas implémentée. Vérifier la pagination de vos premières fiches sur votre machine avant une impression en série.

## 7. Structure

- `src.jsx` : semainier, formulaires, journal et impression.
- `WeekSettings.jsx` : configuration distincte du lundi au vendredi.
- `schedule.js` : validation, migration et calcul des créneaux actifs.
- `build-resources` : icône fleur originale, avec SVG, PNG 1024 px, ICO multi-résolution et ICNS.
- `account.jsx` : profil local et coordination de sauvegarde.
- `appearance.js`, `style.css` : palettes, responsive, fonds et styles d’impression.
- `electron/main.cjs` : fenêtre native et accès autorisés aux fichiers/impression.
- `electron/preload.cjs` : pont restreint entre React et Electron.
- `electron/store.cjs` : validation, lecture, écriture et sauvegarde précédente.
- `public/assets` : fonds et polices fournis.
- `tests` : tests des préférences et de la sauvegarde fichier.
- `release` : installateurs générés (non inclus).

La fenêtre désactive l’accès direct de React à Node.js et utilise l’isolation de contexte. Aucun service de synchronisation, ressource distante ou serveur local n’est requis pour l’application installée.

## 8. Vérifications effectuées et à effectuer

```bash
npm test
npm run build
```

Effectué ici : compilation React, contrôle de syntaxe des fichiers Electron, résolution des polices/médias après compilation, présence des règles A4/responsive et 25 tests (palettes, préférences, disciplines, sous-thèmes, ressource PDF, semaine type, migration, rendu du journal et sauvegarde fichier).

Non effectué ici : exécution de la fenêtre Electron, fabrication et installation des paquets Windows/macOS, contrôle visuel des différentes tailles de fenêtre et impression physique/PDF. Ce dossier est prêt pour la phase de test sur vos ordinateurs ; il ne faut pas le présenter comme un binaire déjà validé sur ces deux systèmes.

Recette sur chaque système : lancer, créer une séance, attendre l’indication d’enregistrement, fermer et rouvrir ; vérifier le profil et les données. Changer le thème, masquer un fond, exporter un PDF et vérifier le format de page ; réduire la fenêtre, ouvrir un formulaire et faire défiler le semainier. Exporter/restaurer un JSON avant de diffuser l’installateur.

Références techniques :
- https://www.electronjs.org/docs/latest/tutorial/context-isolation
- https://www.electronjs.org/docs/latest/tutorial/ipc
- https://www.electron.build/configuration/

## 9. Nouveautés de la version 3.1.0

- Huit thèmes : Mauve (palette originale), Jaune or, Rose, Gris, Turquoise, Rouge, Vert et Marrons-beiges.
- Icône fleur intégrée à l’application et aux installateurs Windows et macOS. Une ancienne icône de raccourci peut rester temporairement en cache après mise à jour ; vérifier l’icône sur le nouveau fichier d’installation.
- Ma semaine type dispose d’un onglet par jour, avec liste de créneaux indépendante, horaires et activités propres au jour, fin des classes et interrupteur pour déclarer toute une journée sans classe.
- Les créneaux commençant à l’heure de fin ou plus tard ne sont affichés ni dans le semainier ni dans le journal. Un créneau traversant la fin des classes est limité à cette heure à l’affichage. Les créneaux masqués restent dans la configuration pour pouvoir les réactiver.
- Possibilité de copier les horaires d’un jour vers un autre. Cette action ne copie pas les séances ; des créneaux remplacés peuvent laisser des préparations hors planning, conservées dans les données.
- Les colonnes du semainier ont chacune leurs propres horaires. Leur hauteur ne représente pas une échelle de temps commune : lire les horaires indiqués dans chaque colonne.

### Régler les jours sans après-midi

1. Ouvrir Ma semaine type.
2. Choisir Mercredi.
3. Renseigner votre véritable heure de fin dans « Fin des classes le mercredi » (par exemple 11:30 ; aucune heure propre à votre commune n’a été supposée).
4. Adapter les créneaux du matin si besoin ; ceux après cette heure deviennent grisés dans les réglages.
5. Répéter pour Jeudi et Vendredi, puis enregistrer la semaine.

La fin de journée est explicite dans le semainier et le cahier journal. Si la fin des classes est avancée, les anciennes séances après cette heure restent dans les données et les exports de sauvegarde, mais pas dans l’impression du journal. Pour les retrouver dans le planning, rétablir leurs horaires ou réactiver le jour. Un message indique le nombre de séances hors planning dans la semaine consultée. Dupliquer une semaine copie seulement les séances des créneaux actuellement actifs.

### Mettre à jour depuis Marelle 3.0.0 sous Windows

1. Avant la mise à jour, ouvrir l’ancienne version et exporter une sauvegarde JSON ; conserver aussi une copie du dossier de données si possible.
2. Fermer Marelle.
3. Extraire cette archive de sources dans un nouveau dossier, sans effacer le dossier de données de l’application.
4. Dans le nouveau dossier de développement :

```powershell
npm ci
npm run dist:win
explorer .\release
```

5. Installer `Marelle Setup 3.1.0.exe`, généré dans `release`, pour mettre à jour l’application. Le nom et l’identifiant de l’application sont conservés afin de réutiliser le même dossier de données.
6. Au lancement, l’ancienne journée commune est convertie en cinq journées indépendantes en conservant les identifiants des créneaux et les préparations. Les horaires initiaux sont conservés : régler ensuite vos fins de classe réelles.
7. Vérifier les données et le profil, puis choisir la couleur souhaitée dans Mon profil.

Après cette migration, conserver la version 3.1.0 : l’ancienne version 3.0.0 ne comprend pas les nouveaux réglages hebdomadaires. Pour revenir en arrière, utiliser uniquement une copie de sauvegarde faite avant migration.

Cette archive est un dossier de développement, pas un installateur. La compilation et les tests ont réussi ici, ainsi que la validation du schéma de configuration electron-builder et des fichiers d’icône. La fabrication/installation des nouveaux paquets et leur affichage dans Windows/macOS restent à vérifier sur les machines concernées.

## 10. Fabriquer le Mac sans posséder de Mac

La procédure `.github/workflows/build-mac.yml` permet une fabrication manuelle sur GitHub Actions, pour Mac Apple Silicon et/ou Intel. Lire `FABRIQUER_MAC_DEPUIS_WINDOWS.md` pour les étapes sans terminal sur votre PC. La procédure est préparée mais pas exécutée ; aucun DMG n’est fourni dans cette archive.

## 11. Nouveautés 3.2.0 — disciplines, sous-thèmes et ressources

- Ajout d’Éducation musicale dans le formulaire de séance (couleur propre dans le semainier ; fond des arts visuels réutilisé pour la fiche en l’absence de fond musical spécifique).
- Un champ Sous-thème apparaît pour le français, les mathématiques et les sciences. Il reste facultatif, pour conserver la possibilité de préparer une séance partielle.
- Français : Littérature, Vocabulaire, Étude de la langue, Phonologie, Lecture.
- Mathématiques : Nombres, Mesures, Géométrie, Problèmes, Calcul.
- Sciences, Cycle 2 : Le vivant, la matière et les objets ; L’espace ; Le temps.
- Sciences, Cycle 3 : Physique-Chimie ; Sciences et Vie de la Terre ; Technologie.
- Pour les sciences, un sélecteur de cycle adapte les choix. Le cycle est proposé d’après le niveau quand il est identifiable, mais reste modifiable. Changer de discipline ou de cycle remet à vide le sous-thème s’il ne convient plus.
- Le sous-thème est sauvegardé avec la séance, repris dans la carte du semainier, la fiche détaillée et le cahier journal. Les anciennes préparations restent valides sans sous-thème ; rien n’est inventé pour les compléter.
- Nouvel onglet Ressources pédagogiques, avec le document « Ressources institutionnelles — Cycle 2 » fourni par l’utilisatrice. Bouton Consulter en ligne : PDF publié sur le portail académique de Grenoble. Bouton Ouvrir la copie hors ligne : copie exacte du document fourni, sans modification, ouverte dans le lecteur PDF du système. Les liens externes du PDF nécessitent toujours Internet.
- Les liens en ligne s’ouvrent dans le navigateur par défaut du système. Aucune saisie de chemin ou d’adresse arbitraire n’est autorisée par ce nouveau pont Electron.

Les libellés des sous-thèmes sont ceux demandés pour l’organisation des préparations. Le document intégré est une ressource existante, pas une vérification des programmes à jour.

### Installation de la mise à jour 3.2.0 sur Windows

Exporter une sauvegarde JSON dans l’ancienne version, fermer Marelle et extraire cette nouvelle archive dans un dossier distinct. Ouvrir PowerShell dans le dossier contenant `package.json`, puis :

```powershell
npm ci
npm run dist:win
explorer .\release
```

Installer `Marelle Setup 3.2.0.exe`. Le même identifiant d’application et le même répertoire de données sont conservés. Si npm affiche des scripts en attente, suivre la procédure d’autorisation ciblée du chapitre 1.

Le workflow Mac reste inclus et utilise automatiquement la nouvelle version du projet. Aucun installateur Windows ou Mac n’est fourni dans cette archive de sources. Les vérifications réalisées ici sont la compilation, les 25 tests automatisés, la syntaxe Electron, le schéma de configuration des installateurs et l’intégrité du PDF intégré. L’ouverture native du PDF et du navigateur reste à confirmer sur vos appareils.

## 12. Version 3.2.1

- Ajout du sous-thème Français → Production d’écrits.
- Ajout de la discipline Vie de classe. Elle réutilise le fond EMC pour les fiches de séance et possède une couleur propre dans le semainier.
- Bouton Imprimer le semainier dans la barre d’actions. Il imprime la semaine actuellement affichée (lundi à vendredi), le profil et la classe, les dates, les horaires propres à chaque jour, les titres/discipline/sous-thème des séances, les groupes CE1/CE2, les pauses et les fins de classe. Si une séance n’est pas renseignée, le libellé de la semaine type est repris.
- Les informations détaillées des étapes n’alourdissent pas cet export. Les créneaux hors des horaires de classe ne sont pas imprimés.
- Le semainier est configuré en A4 paysage. Les fiches de séance et le cahier journal restent en A4 portrait. Le dialogue système permet de choisir une imprimante ou une sortie PDF selon les fonctions installées sur l’ordinateur.
- L’export ne force pas une seule page au détriment du contenu : une semaine particulièrement chargée peut se répartir sur plusieurs pages, avec répétition des en-têtes.

Pour mettre à jour : exporter une sauvegarde dans l’ancienne application, la fermer, extraire le nouveau dossier de développement, puis exécuter :

```powershell
npm ci
npm run dist:win
explorer .\release
```

Installer ensuite `Marelle Setup 3.2.1.exe`. Les données et le profil existants sont conservés dans le même répertoire. La procédure Mac via GitHub Actions reste disponible.

Vérifications 3.2.1 : compilation, syntaxe Electron, 28 tests automatisés, dont le contenu du semainier imprimable et la séparation des orientations paysage/portrait. Le dialogue d’impression natif, le rendu visuel et les installateurs restent à tester sur vos appareils.

## 13. Version 3.4.0 — prolongements, objectifs et observations

### Observations manuscrites dans le cahier journal imprimé

Chaque préparation (ou activité non renseignée avant la première préparation) possède une zone « Observations : » avec deux lignes pointillées. Ces lignes sont uniquement ajoutées au journal imprimé : il s’agit d’un espace pour écrire après impression, sans modifier les observables ou le bilan enregistrés dans la fiche. Les récréations et pauses ne reçoivent pas de lignes d’observations. Deux préparations CE1 et CE2 dans un même créneau reçoivent chacune leur zone.

### Prolongement automatique

Une séance enregistrée se prolonge sur les créneaux suivants entièrement dépourvus de préparation, jusqu’à la prochaine séance enregistrée de la même journée ou au dernier créneau actif de la journée. Le libellé prévu par la semaine type (Français, Maths, etc.) ne bloque pas le prolongement si aucune séance n’y est enregistrée.

Les récréations et pauses déjeuner ne sont pas remplacées : le prolongement reprend ensuite sur les créneaux libres. Dans le cahier journal, la séance est regroupée en une seule entrée avec sa plage globale et le rappel des pauses. Sa durée de travail exclut les pauses et les intervalles sans créneau défini. La fin des classes reste respectée et rien ne se prolonge sur un autre jour.

Dans le semainier, les créneaux concernés indiquent « Suite : … ». Le bouton « Modifier la séance » ouvre la préparation d’origine ; un double-clic sur le texte de continuation le permet aussi. « Nouvelle séance ici » ouvre une nouvelle préparation à cet endroit : une fois enregistrée, elle arrête le prolongement précédent. Le début de journée reste libre si aucune préparation antérieure n’existe.

Pour un double niveau : si les deux préparations CE1/CE2 sont enregistrées sur un créneau, elles se prolongent ensemble sur les créneaux entièrement libres. Dès qu’un créneau suivant contient une préparation pour l’un des groupes, il arrête ce prolongement pour l’ensemble du créneau. Le calcul ne suppose pas automatiquement une activité pour le groupe laissé vide.

Les prolongements ne sont pas des copies enregistrées : toutes les données restent associées au créneau de départ. Le calcul est appliqué aussi aux anciennes semaines consultées. Une préparation partielle déjà enregistrée compte comme un créneau renseigné et interrompt la précédente. Pour maintenir une autre activité, même sans fiche détaillée, enregistrer au moins une préparation avec son intitulé.

### Objectifs visibles

L’objectif complet de la séance apparaît dans sa carte de départ du semainier et dans le semainier imprimé. Il n’est pas inventé si le champ est vide. Une longue semaine ou des objectifs volumineux peuvent produire plusieurs pages à l’impression ; le contenu n’est pas tronqué.

### Installation Windows

Avant de changer de version, exporter une sauvegarde depuis l’ancienne application et fermer Marelle. Extraire le nouveau dossier et lancer :

```powershell
npm ci
npm run dist:win
explorer .\release
```

Installer `Marelle Setup 3.4.0.exe`. Le dossier de données conserve le même nom et le même identifiant d’application. Aucun compte ou serveur n’est ajouté. La procédure GitHub Actions pour Mac reste incluse et suit la version du projet.

Vérifications 3.4.0 : compilation, 36 tests automatisés (dont cross sur la journée entière, arrêt à la prochaine préparation, pauses, double niveau, fin des classes, absence de duplication, objectifs et deux lignes d’observations dans le journal rendu). L’impression native et le rendu visuel sur Windows/macOS restent à vérifier sur vos appareils. Cette archive contient les sources et non un installateur déjà fabriqué.

## 14. Version 3.5.0 : fiches compactes et aperçu

- Nouveau sous-thème Français : **Langage oral**.
- Fiches A4 portrait : marges de 12 mm en haut/bas et 10 mm à gauche/droite, titre compact, rubriques jointives, bandeau par étape. Consignes, précisions et observables sont conservés. Fond optionnel à 20 %.
- Le bouton d’impression d’une séance ouvre un aperçu A4. **Retour à la séance** permet de poursuivre l’édition ; **Imprimer / Enregistrer en PDF** ouvre le dialogue système. L’aperçu inclut les modifications non encore enregistrées. Imprimer ne les enregistre pas : enregistrer ensuite la séance si souhaité.
- Après chargement des fontes et du fond : ajustement automatique par paliers de 100 %, 95 %, 90 %, 85 % selon la hauteur réelle. Le même facteur est transmis à l’impression. Si la fiche dépasse encore, un message prévient et l’impression conserve toutes les informations sur plusieurs pages. Aucun texte coupé pour forcer une page. L’aperçu montre alors le contenu en continu ; la pagination définitive dépend du dialogue système.
- Durée de séance : somme des minutes positives renseignées dans les étapes. Durées manquantes/invalides signalées comme total partiel. Créneau affiché séparément, ainsi que l’écart. Exemple : 10 + 15 + 15 + 5 = **45 min**, créneau de 20 min, écart **+25 min**. Horaires du semainier inchangés.
- Pour un résultat fidèle : A4, portrait, échelle 100 %, sans en-têtes/pieds de page ajoutés par le pilote. Autres impressions inchangées.

### Mise à jour Windows
Exporter d’abord une sauvegarde JSON depuis Marelle. Extraire ce dossier dans un emplacement distinct, y ouvrir PowerShell, puis :

```powershell
npm ci
npm run dist:win
explorer .\release
```

Installer `Marelle Setup 3.5.0.exe`. Nom et identifiant de l’application conservés pour retrouver les données existantes. Ce ZIP contient les sources, pas un installateur déjà compilé.

## 15. Version 3.5.1 : palettes et titre Marelle

Le titre des fiches utilise à nouveau la fonte Marelle. Les titres, textes, bordures, bandeaux d’étapes et en-têtes de tableau reprennent une palette assortie au fond de discipline, indépendante du thème du profil. Sans fond, la fiche passe intégralement en niveaux de gris. Les cases du semainier à l’écran et imprimées suivent aussi ces couleurs, avec des teintes pastel et du texte foncé.

Arts : saumon/rose poudré ; EMC : gris ; Anglais : turquoise ; EPS : rouge ; Français : jaune or/marron ; Géographie : vert émeraude ; Histoire : marron ; Mathématiques : bleu roi ; Reo Tahiti : orange ; Sciences : mauve. Éducation musicale reprend le fond Arts ; Vie de classe reprend le fond EMC.

Aperçu, ajustement A4 et calcul des durées de la version 3.5 conservés. Même procédure de compilation Windows ; l’installateur produit porte désormais le nom `Marelle Setup 3.5.1.exe`.

## 16. Version 3.6.0 : mes préparations et mes projets

Trois entrées supplémentaires apparaissent dans le menu latéral. Les documents enregistrés sont stockés sur l’appareil avec le planning, conservés lors de la mise à jour et inclus dans le même export/import JSON. Exporter une sauvegarde avant la mise à jour ; la restauration remplace l’ensemble des données, y compris ces nouvelles collections.

### Séances hors semainier
Créer des fiches de séance indépendantes d’une date et d’un créneau de stage. Même formulaire complet : discipline et sous-thème, niveau, séquence, objectifs, compétences, matériel, étapes minutées, consignes, précisions, modalités et observables, critères, différenciation et bilan. Enregistrer pour retrouver la fiche dans cette rubrique ; modifier, rechercher, dupliquer, supprimer et imprimer depuis le formulaire. La durée est la somme des étapes, sans comparaison avec un créneau inexistant. Les fiches restent en A4 portrait, avec aperçu, palette de discipline et fond facultatif à 20 %.

### Mes séquences
Créer une progression pour toute discipline, inspirée du modèle « Le Monde des végétaux » : titre, discipline/sous-thème, niveau, domaine, compétences et objectifs ; ajouter, supprimer et réordonner les séances avec titre, durée, objectif et activités/démarche ; terminer par évaluations, observables et prolongements. Nombre de séances et total des minutes renseignées calculés automatiquement. Fond facultatif et palette selon la discipline. Aperçu et impression en A4 paysage. Les lignes de progression sont des résumés éditables ; elles ne créent pas automatiquement de fiches séances complètes.

### Projets interdisciplinaires
Formulaire : titre, cycle, nombre total de séances prévues, problématique, parcours pédagogique (Avenir, Citoyen, PEAC, PES), sous-thème libre, production finale. Avec « Ajouter une matière », choisir la discipline, le nombre de séances et les objectifs. Les matières apparaissent dans des nuages autour de la question centrale, reliés par des traits et colorés selon leur discipline. Le parcours et la production finale figurent aussi sur le schéma. Aperçu dynamique dans le formulaire et consultation depuis la liste des projets ; aperçu d’impression et export via le dialogue PDF en A4 paysage.

Le total du projet est indépendant de la somme par matière : une même séance peut être interdisciplinaire. Le placement des nuages est automatique, sans déplacement manuel. Tous les objectifs sont conservés ; les schémas très longs peuvent nécessiter plusieurs pages, avec avertissement dans l’aperçu. Les PDF fournis servent de modèles de structure, sans import automatique de leur contenu.

Pour les nouveaux formulaires, utiliser **Enregistrer** avant de quitter la rubrique. L’aperçu peut montrer des modifications non enregistrées ; imprimer ne les enregistre pas.

### Installer la mise à jour Windows
Après sauvegarde JSON, extraire le nouveau dossier séparément. Dans son sous-dossier `marelle-desktop` :

```powershell
npm ci
npm run dist:win
explorer .\release
```

Installer **Marelle Setup 3.6.0.exe**. Identifiant et dossier de données conservés. Ce ZIP contient le projet développeur, pas un installateur compilé. Le workflow macOS existant reste inclus.
# Marelle
