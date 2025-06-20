# DynProtMobile

[![React Native](https://img.shields.io/badge/React_Native-0.72.17-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Platforms](https://img.shields.io/badge/Platforms-iOS%20%7C%20Android-4BC51D?style=for-the-badge)](https://reactnative.dev/)

DynProtMobile est une application mobile de suivi nutritionnel axée sur l'apport en protéines, offrant une expérience utilisateur personnalisée avec thème clair/sombre et support multilingue.

## ✨ Fonctionnalités

- **Suivi nutritionnel** : Enregistrement et suivi de l'apport en protéines
- **Tableau de bord** : Visualisation des progrès avec graphiques interactifs
- **Chat intelligent** : Assistant vocal intégré avec synthèse vocale
- **Profil personnalisable** : Objectifs nutritionnels et préférences utilisateur
- **Thème clair/sombre** : Interface adaptative selon les préférences utilisateur
- **Multilingue** : Support du français et de l'anglais
- **Sécurisé** : Authentification utilisateur et protection des données

## 📱 Captures d'écran

*À ajouter : captures d'écran de l'application*

## 🚀 Installation

### Prérequis

- Node.js (v16 ou supérieur)
- npm ou Yarn
- React Native CLI
- Xcode (pour iOS) ou Android Studio (pour Android)
- CocoaPods (pour iOS)

### Configuration initiale

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-utilisateur/DynProtMobile.git
   cd DynProtMobile
   ```

2. **Installer les dépendances**
   ```bash
   # Installer les dépendances principales
   npm install
   
   # Installer les pods iOS (uniquement pour macOS)
   cd ios && pod install && cd ..
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine du projet avec les variables nécessaires :
   ```env
   API_URL=votre_url_d_api
   # Autres variables d'environnement
   ```

## 🏃‍♂️ Lancement

### Développement

```bash
# Démarrer le serveur Metro
npm start

# Lancer sur iOS (macOS uniquement)
npm run ios

# Lancer sur Android
npm run android
```

### Production

```bash
# Construire pour iOS
cd ios && xcodebuild -workspace DynProtMobile.xcworkspace -scheme DynProtMobile -sdk iphoneos -configuration Release

# Construire pour Android
cd android && ./gradlew assembleRelease
```

## 🛠 Architecture

L'application est construite avec une architecture moderne utilisant :

- **React Native** pour le développement cross-platform
- **TypeScript** pour un code plus sûr et plus maintenable
- **React Navigation** pour la navigation entre les écrans
- **React Native Reanimated** pour des animations fluides
- **React Native Voice** pour la reconnaissance vocale
- **React Native Sound** pour la lecture audio
- **React Native Chart Kit** pour les visualisations de données

## 🌐 Internationalisation

L'application prend en charge plusieurs langues via le système d'internationalisation intégré. Les fichiers de traduction se trouvent dans le dossier `src/translations/`.

## 🎨 Thèmes

L'application propose deux thèmes : clair et sombre. La sélection du thème est gérée via le `SettingsContext`.

## 🤖 Fonctionnalités avancées

### Reconnaissance vocale

L'application utilise `react-native-voice` pour permettre la saisie vocale des repas et des notes.

### Synthèse vocale

La synthèse vocale est fournie par l'API OpenAI pour une expérience utilisateur plus naturelle.

### Sécurité

- Authentification utilisateur sécurisée
- Stockage sécurisé des données sensibles
- Protection contre les attaques CSRF et XSS

## 📊 Base de données

L'application utilise une base de données PostgreSQL pour le stockage des données. Un fichier Docker Compose est fourni pour faciliter le déploiement local.

```bash
# Démarrer la base de données PostgreSQL
docker-compose up -d
```

## 🔍 Dépannage

### Problèmes courants

#### Problèmes de reconnaissance vocale

Assurez-vous d'avoir accordé les autorisations nécessaires dans les paramètres de l'appareil.

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment procéder :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Ajouter une fonctionnalité incroyable'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Tous les contributeurs qui ont participé au projet
- La communauté React Native pour son soutien continu
- Les mainteneurs des bibliothèques open source utilisées

## 📚 Documentation complémentaire

- [Documentation React Native](https://reactnative.dev/docs/getting-started)
- [Documentation React Navigation](https://reactnavigation.org/)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une [issue](https://github.com/votre-utilisateur/DynProtMobile/issues).

## 📅 Historique des versions

Consultez les [releases](https://github.com/votre-utilisateur/DynProtMobile/releases) pour un historique des modifications.

## 📝 Notes de version

### Version 1.0.0 (2024-06-20)
- Version initiale de DynProtMobile
- Suivi nutritionnel et tableau de bord
- Chat intelligent avec reconnaissance vocale
- Support multilingue (français/anglais)
- Thèmes clair/sombre

## 🔍 Dépannage avancé

Si vous rencontrez des problèmes, consultez les ressources suivantes :

- [Guide de dépannage React Native](https://reactnative.dev/docs/troubleshooting)
- [Documentation React Native](https://reactnative.dev/docs/getting-started)
- [Forum d'aide React Native](https://github.com/facebook/react-native/discussions)
