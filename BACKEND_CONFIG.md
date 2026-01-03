# Configuration Backend pour TeeBook

## URL Backend Unifiée

Le backend unique est accessible à l'adresse suivante:
```
https://mobile-dashboard-15.preview.emergentagent.com
```

## Configuration pour l'Application Mobile

Dans votre application mobile (React Native/Expo), configurez la variable d'environnement:

```bash
EXPO_PUBLIC_BACKEND_URL=https://mobile-dashboard-15.preview.emergentagent.com
```

## Configuration pour le Dashboard Admin

Le dashboard utilise déjà cette URL via:
```bash
REACT_APP_BACKEND_URL=https://mobile-dashboard-15.preview.emergentagent.com
```

## Endpoints API Disponibles

Tous les endpoints sont préfixés par `/api`:

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile-image` - Mise à jour photo de profil

### Parcours de Golf
- `GET /api/courses` - Liste des parcours
- `POST /api/courses` - Créer un parcours (admin)
- `GET /api/courses/{id}` - Détails d'un parcours
- `PUT /api/courses/{id}` - Modifier un parcours (admin)
- `DELETE /api/courses/{id}` - Supprimer un parcours (admin)

### Horaires de Départ
- `GET /api/tee-times` - Liste des horaires (filtrable par date/parcours)
- `POST /api/tee-times` - Créer un horaire (admin)
- `GET /api/tee-times/{id}` - Détails d'un horaire
- `PUT /api/tee-times/{id}` - Modifier un horaire (admin)
- `DELETE /api/tee-times/{id}` - Supprimer un horaire (admin)

### Réservations
- `POST /api/bookings` - Créer une réservation
- `GET /api/bookings` - Mes réservations
- `DELETE /api/bookings/{id}` - Annuler une réservation

### Compétitions
- `GET /api/competitions` - Liste des compétitions
- `POST /api/competitions` - Créer une compétition (admin)
- `GET /api/competitions/{id}` - Détails d'une compétition
- `PUT /api/competitions/{id}` - Modifier une compétition (admin)
- `DELETE /api/competitions/{id}` - Supprimer une compétition (admin)
- `POST /api/competitions/{id}/register` - S'inscrire à une compétition
- `DELETE /api/competitions/{id}/unregister` - Se désinscrire

### Abonnements
- `POST /api/subscriptions` - Créer un abonnement (admin)
- `GET /api/subscriptions/my` - Mes abonnements

### Administration
- `GET /api/admin/users` - Liste des utilisateurs (admin)
- `PUT /api/admin/users/{id}` - Modifier un utilisateur (admin)
- `GET /api/admin/bookings` - Toutes les réservations (admin)
- `GET /api/admin/subscriptions` - Tous les abonnements (admin)
- `GET /api/admin/dashboard` - Statistiques du dashboard (admin)

## Authentification JWT

Toutes les requêtes protégées nécessitent un header:
```
Authorization: Bearer <token>
```

Le token est obtenu via `/api/auth/login` ou `/api/auth/register`.

## CORS

Le backend accepte les requêtes depuis:
- `https://mobile-dashboard-15.preview.emergentagent.com`
- Application mobile (à configurer)

## Base de Données

- MongoDB: `localhost:27017`
- Database: `teebook_db`

## Port

- Backend interne: `8001`
- Accessible publiquement via: `https://mobile-dashboard-15.preview.emergentagent.com/api`

## Test de Connexion

Pour tester si le backend est accessible:

```bash
# Sans authentification
curl https://mobile-dashboard-15.preview.emergentagent.com/api/courses

# Avec authentification (après login)
curl -H "Authorization: Bearer <token>" \
     https://mobile-dashboard-15.preview.emergentagent.com/api/auth/me
```

## Notes Importantes

1. **Backend Unique**: Le dashboard admin et l'application mobile partagent le même backend
2. **Données Partagées**: Les modifications faites sur le dashboard apparaissent immédiatement dans l'app mobile et vice-versa
3. **Authentification Partagée**: Les comptes utilisateurs sont les mêmes sur les deux interfaces
4. **Rôles**: Les utilisateurs avec `role: "admin"` ont accès aux endpoints admin et au dashboard

## Configuration Mobile App

Dans votre fichier `.env` ou `app.json` de l'application mobile:

```json
{
  "expo": {
    "extra": {
      "backendUrl": "https://mobile-dashboard-15.preview.emergentagent.com"
    }
  }
}
```

Ou créez un fichier `.env`:
```bash
EXPO_PUBLIC_BACKEND_URL=https://mobile-dashboard-15.preview.emergentagent.com
```

Puis dans votre code:
```typescript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.backendUrl || 
                process.env.EXPO_PUBLIC_BACKEND_URL;
```
