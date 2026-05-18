# Analyse du projet

## Ameliorations deja apportees

- Update du `tsconfig` : suppression de `baseUrl` deprecie et alias `@/*` corrige vers `src/*`.
- Lien reel entre frontend et API Supabase/backend : dashboard, fiches centres et publication d'avis passent maintenant par l'API.

## Ameliorations a apporter

- Revoir le systeme de rating global des centres.
- Revoir le rating utilisateur pour qu'il soit coherent entre le frontend et la structure Supabase.
- Gerer l'accessibilite complete du site : navigation clavier, affichage adapte aux personnes malvoyantes, informations lisibles par lecteurs d'ecran, et parcours utilisable pour chaque type de handicap vise.

## Bonnes pratiques d'accessibilite a mettre en place

### Handicap visuel

- Garantir des contrastes suffisants entre texte et arriere-plan.
- Permettre le redimensionnement du texte sans casser la mise en page.
- Utiliser une structure HTML semantique avec titres hierarchises.
- Ajouter des labels accessibles aux champs, boutons et controles.
- Fournir des alternatives textuelles aux images et icones utiles.
- Ne jamais transmettre une information uniquement par la couleur.
- Rendre le focus clavier clairement visible.
- Assurer un mode clair/sombre lisible et stable.

### Handicap auditif

- Ajouter des sous-titres pour toutes les videos.
- Fournir une transcription pour les contenus audio ou video.
- Ne jamais dependre uniquement d'un son pour signaler une erreur ou une action.
- Prevoir des notifications visuelles equivalentes aux alertes sonores.

### Handicap moteur

- Garantir une navigation complete au clavier.
- Respecter un ordre de tabulation logique.
- Prevoir des boutons et liens assez grands et suffisamment espaces.
- Eviter les actions uniquement basees sur le drag and drop.
- Eviter les timeouts courts sans possibilite de prolongation.
- Supporter les technologies d'assistance comme le switch control.
- Eviter les interactions demandant trop de precision ou de rapidite.

### Handicap cognitif

- Proposer des parcours simples, coherents et previsibles.
- Utiliser des textes clairs et des phrases courtes.
- Afficher les erreurs de formulaire pres du champ concerne.
- Ajouter une aide contextuelle quand une action peut etre ambigue.
- Garder des labels, boutons et comportements coherents dans toute l'application.
- Eviter la surcharge visuelle.
- Permettre de revenir en arriere sans perdre les donnees saisies.

### Handicap neurologique et sensoriel

- Eviter les flashs, clignotements rapides et animations agressives.
- Respecter la preference systeme `prefers-reduced-motion`.
- Limiter ou permettre de desactiver les animations.
- Eviter l'autoplay agressif.
- Eviter les effets visuels intenses comme parallaxe, zooms brusques ou scintillements.
- Garder une interface calme, sans changements visuels inattendus.

### Handicap psychique

- Proposer une interface previsible et rassurante.
- Eviter les messages culpabilisants, alarmistes ou ambigus.
- Demander confirmation avant les actions importantes.
- Permettre d'annuler ou de corriger une action.
- Eviter les dark patterns.
- Eviter la pression temporelle.
- Rediger des messages d'erreur factuels, utiles et non stressants.
