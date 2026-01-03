# 🔧 Guide de Connexion de l'App Mobile au Backend

## ⚠️ PROBLÈME IDENTIFIÉ

L'application mobile **N'EST PAS CONNECTÉE** au backend du dashboard.

**Preuve :**
- Réservations dans la base de données : **0**
- Réservation créée sur mobile : **Non visible dans le dashboard**
- Utilisateurs dans la base : **2** (seulement ceux du dashboard)

## 📱 SOLUTION : Connecter l'App Mobile

### Étape 1 : Configuration de l'URL Backend

L'app mobile doit utiliser cette URL backend :
```
https://mobile-dashboard-15.preview.emergentagent.com
```

### Étape 2 : Modification du Code Mobile

**Fichier à modifier : `/tmp/teebook/frontend/services/api.ts`**

**AVANT (configuration actuelle) :**
```typescript
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
```

**APRÈS (à modifier) :**
```typescript
// Utiliser le backend unifié
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 
                   'https://mobile-dashboard-15.preview.emergentagent.com';
```

### Étape 3 : Fichier .env de l'App Mobile

**Créer ou modifier le fichier `.env` à la racine du projet frontend :**

```bash
EXPO_PUBLIC_BACKEND_URL=https://mobile-dashboard-15.preview.emergentagent.com
```

### Étape 4 : Configuration app.json

**Alternative : Ajouter dans `app.json` :**

```json
{
  "expo": {
    "name": "TeeBook",
    "extra": {
      "backendUrl": "https://mobile-dashboard-15.preview.emergentagent.com"
    }
  }
}
```

**Puis dans le code :**
```typescript
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || 
                   'https://mobile-dashboard-15.preview.emergentagent.com';
```

### Étape 5 : Vérification de la Configuration

**Dans votre code api.ts, assurez-vous que :**

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL du backend unifié
const BACKEND_URL = 'https://mobile-dashboard-15.preview.emergentagent.com';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,  // ← Important : préfixe /api
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### Étape 6 : Tester la Connexion

**Dans l'app mobile, ajouter un test de connexion :**

```typescript
// Test de connexion au backend
const testConnection = async () => {
  try {
    const response = await api.get('/courses');
    console.log('✅ Connexion réussie - Parcours trouvés:', response.data.length);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
};

// Appeler au démarrage de l'app
testConnection();
```

## 🔍 Vérification Post-Configuration

### 1. Vérifier l'URL dans les logs

Dans votre console React Native, vous devriez voir :
```
API Request: https://mobile-dashboard-15.preview.emergentagent.com/api/courses
```

### 2. Créer un utilisateur de test depuis le mobile

Après connexion du mobile au backend, créez un compte :
- Email : `mobile@teebook.com`
- Password : `mobile123`
- Rôle : `user`

### 3. Créer une réservation depuis le mobile

Après configuration, créez une réservation et vérifiez qu'elle apparaît dans le dashboard.

### 4. Vérifier dans le Dashboard

Allez sur : `https://mobile-dashboard-15.preview.emergentagent.com/bookings`

Vous devriez voir la nouvelle réservation.

## 🚨 Points d'Attention

### URLs à Utiliser

**✅ CORRECT :**
```
https://mobile-dashboard-15.preview.emergentagent.com/api
```

**❌ INCORRECT :**
```
http://localhost:8001/api
http://127.0.0.1:8001/api
https://autre-url.com/api
```

### Préfixe /api Obligatoire

Toutes les requêtes doivent inclure `/api` :
- `/api/auth/login`
- `/api/courses`
- `/api/tee-times`
- `/api/bookings`

### CORS

Le backend accepte déjà les requêtes de l'app mobile via :
```
CORS_ORIGINS=https://mobile-dashboard-15.preview.emergentagent.com
```

## 📊 Test de Synchronisation

### Scénario de Test Complet

1. **Depuis le Dashboard :**
   - Créer un parcours : "Test Sync Course"
   - Créer un horaire de départ

2. **Depuis l'App Mobile :**
   - Se connecter avec un compte
   - Voir le parcours "Test Sync Course"
   - Créer une réservation

3. **Vérification Dashboard :**
   - Aller sur `/bookings`
   - La réservation mobile doit apparaître

## 🔧 Commandes de Diagnostic

### Vérifier la Base de Données

```bash
# Dans le terminal du serveur
cd /app/backend
python -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['teebook_db']
    bookings = await db.bookings.count_documents({})
    print(f'Réservations : {bookings}')
    client.close()

asyncio.run(check())
"
```

### Tester l'API depuis le Mobile

```bash
# Remplacez <TOKEN> par votre token JWT
curl -H "Authorization: Bearer <TOKEN>" \
     https://mobile-dashboard-15.preview.emergentagent.com/api/bookings
```

## 📝 Checklist de Configuration

- [ ] Variable d'environnement `EXPO_PUBLIC_BACKEND_URL` configurée
- [ ] URL backend dans le code : `https://mobile-dashboard-15.preview.emergentagent.com`
- [ ] Préfixe `/api` présent dans baseURL
- [ ] Token JWT envoyé dans les headers
- [ ] Test de connexion effectué
- [ ] Réservation créée depuis mobile
- [ ] Réservation visible dans dashboard

## ❓ FAQ

**Q : Pourquoi mes réservations n'apparaissent pas ?**
R : L'app mobile n'utilise pas le bon backend. Suivez les étapes ci-dessus.

**Q : J'ai une erreur CORS**
R : Vérifiez que vous utilisez HTTPS et l'URL exacte du backend.

**Q : Les données sont différentes entre mobile et dashboard**
R : Vous utilisez deux backends différents. L'app mobile doit pointer vers `https://mobile-dashboard-15.preview.emergentagent.com`.

**Q : Comment savoir si je suis connecté au bon backend ?**
R : Ajoutez un `console.log(BACKEND_URL)` dans votre code mobile et vérifiez l'URL affichée.

## 🎯 Résultat Attendu

Après configuration correcte :
- ✅ Utilisateurs créés sur mobile visibles dans dashboard
- ✅ Parcours créés dans dashboard visibles sur mobile
- ✅ Réservations créées sur mobile visibles dans dashboard
- ✅ Données synchronisées en temps réel
