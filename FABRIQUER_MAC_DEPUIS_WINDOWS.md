# Obtenir le fichier Mac depuis un PC Windows

Ce dossier contient une procédure GitHub Actions déjà préparée. Elle n’a pas été exécutée : aucun fichier DMG n’est encore fourni. GitHub effectuera la compilation sur une machine macOS distante. Vous n’avez pas besoin d’un Mac, de Xcode ni de ligne de commande sur votre PC.

## 1. Préparer le dépôt GitHub

1. Se connecter à https://github.com (ou y créer son compte).
2. Créer un nouveau dépôt, nommé par exemple `marelle-desktop`. Choisir **Private** pour garder les sources et les médias privés.
3. Extraire l’archive Marelle, puis ouvrir le dossier `marelle-desktop` qui contient `package.json`.
4. Dans le dépôt GitHub, utiliser **Add file → Upload files**, puis déposer les fichiers et sous-dossiers CONTENUS dans `marelle-desktop`, et valider avec **Commit changes**. Ne pas déposer le ZIP ni le dossier parent lui-même : `package.json` et `.github` doivent se trouver à la racine du dépôt.
5. Vérifier en ligne la présence du fichier `.github/workflows/build-mac.yml`. Si le dossier `.github` n’a pas été transféré, utiliser **Add file → Create new file**, saisir ce chemin exact, coller le contenu du fichier local correspondant, puis enregistrer.

Le dossier fourni exclut déjà `node_modules`, `dist` et `release`. Ne pas ajouter de fichier de données personnel, d’export JSON ou de certificat. Les préparations stockées par l’application ne sont pas nécessaires à la compilation.

## 2. Lancer la fabrication

1. Ouvrir l’onglet **Actions** du dépôt.
2. Choisir **Fabriquer Marelle pour Mac**.
3. Cliquer sur **Run workflow**.
4. Choisir l’architecture :
   - `arm64` pour les Mac à puce Apple (M1, M2, M3, M4, etc.).
   - `x64` pour les Mac Intel.
   - `both` pour obtenir les deux fichiers séparément si vous ne connaissez pas le modèle.
5. Valider et attendre la fin du travail. Ne pas relancer plusieurs fois si la première exécution est encore en cours.

Votre collègue peut identifier la puce dans le menu Pomme → À propos de ce Mac. Le choix proposé ici porte sur la puce ; il ne garantit pas la compatibilité avec toutes les anciennes versions de macOS.

## 3. Récupérer le résultat

1. Ouvrir l’exécution terminée avec une coche verte dans Actions.
2. Descendre jusqu’à **Artifacts**.
3. Télécharger `Marelle-Mac-arm64` et/ou `Marelle-Mac-x64`.
4. Extraire le téléchargement : il contient le fichier `.dmg` à transmettre à la personne équipée du Mac correspondant.

Les résultats sont conservés **un jour** pour limiter l’espace utilisé : les télécharger rapidement. Ils restent ensuite dans vos propres téléchargements. Aucun installateur n’est automatiquement publié sur une page publique ou dans une Release.

Si l’exécution échoue, ouvrir l’étape en rouge et conserver son message d’erreur. Une coche verte vérifie la compilation, les tests et la signature technique locale ; elle ne remplace pas un test de lancement sur un Mac réel.

## 4. Ce qui est signé, et ce qui ne l’est pas

La procédure demande une **signature locale ad hoc**, sans certificat ni compte développeur Apple. Cette signature assure la cohérence technique de l’application, notamment sur les Mac Apple Silicon. Elle ne certifie pas l’identité de l’éditeur et n’est pas une notarisation Apple. macOS peut donc refuser ou signaler l’ouverture d’un fichier téléchargé.

Le workflow ne désactive aucune protection macOS et ne supprime pas les attributs de quarantaine. Pour une distribution reconnue automatiquement par Apple, il faut ajouter ultérieurement une signature Developer ID et la notarisation avec les identifiants appropriés.

## 5. Gratuité et accès

Les machines standard GitHub Actions sont gratuites sur les dépôts publics. Sur les dépôts privés, leur exécution et le stockage utilisent les quotas inclus dans votre offre, avec des limites et des coûts possibles au-delà. Vérifier le tableau Usage/Billing de votre compte et rester dans les quotas disponibles. La procédure se lance uniquement sur demande ; aucune compilation automatique n’est déclenchée à chaque modification.

Un compte GitHub suffit pour mettre en place cette procédure ; la création éventuelle de compte et l’activation d’Actions restent à faire par vous. L’archive seule ne peut pas lancer une machine distante.

Références officielles :
- https://docs.github.com/en/actions/reference/runners/github-hosted-runners
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://www.electron.build/v26/docs/mac/
