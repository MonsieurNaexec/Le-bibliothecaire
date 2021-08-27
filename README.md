# Le Bibliothécaire
Le bibliothécaire est un bot discord développé par [M. Naexec](http://m-naexec.duckdns.org) et dont la fonction est de relayer des demandes d'impression et annoncer la sortie de livrets pour des étudiants.

# Utilisation
## 1. Ajout du bot
Pour que le bot fonctionne, il faut d'abord [l'ajouter à votre serveur discord](https://discord.com/oauth2/authorize?client_id=874209950853922856&permissions=67584&scope=bot%20applications.commands). Assurez-vous d'avoir la permission "gérer le serveur".

## 2. Mise en place
Le bot ne sera pas fonctionnel tant qu'il n'aura pas été initialisé  
1. Tout d'abord, le bibliothécaire a besoin d'une feuille de données "Google Spreadsheets"  
   Créez-en une, puis récupérez son identifiant présant dans l'url (souvent sous la forme `docs.google.com/spreadsheets/d/IDENTIFIANT/edit`)
   Attention, ne copiez ***que*** la partie `IDENTIFIANT`.  
2. Il faut maintenant donner accès au document au bibliothécaire. Pour cela, cliquez sur le bouton "Partager" en haut à droite et ajoutez l'addresse suivante en mode "éditeur": `le-bibliothecaire@le-bibliothecaire.iam.gserviceaccount.com` (décocher l'option "envoyer une notification")  
3. Utilisez la commande `/setup {url} {channel}` où {url} est l'identifiant copié plus tôt, et {channel} est le salon dans lequel seront notifiées les demandes de livrets (en général un salon privé). Utilisez la touche `TAB` pour naviguer dans les différents champs de la commande. Les différentes feuilles du tableau Google Sheets se rempliront automatiquement, et vous pourrez supprimer la feuille par défaut.

## 3. Les données
Le bibliothécaire utilise 3 feuilles:
 - **Livrets**: C'est cette feuille que vous êtes censé remplir
   - **Catégorie**: La catégorie du livret. Elle sera utilisée pour segmenter les livrets dans les différents formulaires et les annonces.
   - **Livre**: Le titre du livret ou sa référence brève.
   - **Titre (optionnel)**: Le titre complet du livret. Il sera affiché en tant que description dans les menus déroulants.
   - **Publié (bot)**: Cette colonne est réservée au bibliothécaire. Elle lui sert à savoir s'il a déjà annoncé la parution de ce livret.
 - **Formulaires**: Vous ne devriez pas avoir à modifier cette feuille. Elle sert au bibliothécaire à garder la trace des différents formulaires créés.
 - **Annonces**: Vous ne devriez pas avoir à modifier cette feuille. Elle sert au bibliothécaire à garder la trace des différents salons d'annonce créés.

## 4. Créer des formulaires de demande
Le bibliothécaire peut générer des formulaires de demande de livrets, et consigner ces demandes dans le salon paramétré à l'étape 2.3 .  
Pour générer un formulaire, utilisez la commande `/formulaire {catégorie} [{texte}]` dans le salon en question. La {catégorie} désigne la catégorie des livrets (voir section *3. Les données*) qui seront listés dans ce formulaire. Le {texte}, facultatif, sera celui affiché dans le formulaire. Si non renseigné, la catégorie sera utilisée.

## 5. Créer des salons d'annonce
Le bibliothécaire peut annoncer la publication de nouveaux livrets.  
Pour paramétrer un salon d'annonce, utilisez la commande `/notification {catégorie} [{role}]` dans le salon en question. La {catégorie} désigne la catégorie des livrets (voir section *3. Les données*) qui seront annoncés dans ce salon. Le {role}, facultatif, sera mentionné si renseigné.

## 6. Mettre à jour les données
Lorsque vous aurez ajouté un ou plusieurs livret(s) dans la feuille "Livrets", il vous suffira de lancer la commande `/update`. Le bibliothécaire mettra à jour tous les formulaires, et annoncera les nouvelles sorties dans les salons d'annonce correspondants.
