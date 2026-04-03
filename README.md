# SiteWatch Pro — Supervision Hydraulique SENEAU

Application web PWA de supervision de sites hydrauliques.

## Connexion démo
- **Utilisateur** : `admin`  
- **Mot de passe** : `seneau2025`

## Stack technique
- React 18 + Vite
- Recharts (graphiques)
- xlsx (export Excel)
- localStorage (offline-ready)

## Déploiement Vercel — méthode GitHub (recommandée)

```bash
# 1. Initialiser Git
git init
git add .
git commit -m "SiteWatch Pro v1"

# 2. Créer un repo sur github.com, puis :
git remote add origin https://github.com/TON_USER/sitewatch-pro.git
git push -u origin main
```

Ensuite sur [vercel.com](https://vercel.com) :
1. New Project → Importer le repo
2. Framework : **Vite** (détecté automatiquement)
3. Cliquer **Deploy** → URL live en ~90 secondes

## Déploiement Vercel CLI (sans GitHub)

```bash
npm install -g vercel
vercel --prod
```

## Développement local

```bash
npm install
npm run build    # build de prod
npm start        # serveur dev (port 5173)
```

## Structure
```
sitewatch-pro/
├── index.html
├── vite.config.js
├── vercel.json
├── package.json
├── public/
│   └── manifest.json
└── src/
    ├── index.jsx
    ├── App.jsx
    ├── index.css
    ├── pages/
    │   ├── Login.jsx
    │   ├── Dashboard.jsx
    │   ├── Saisie.jsx
    │   ├── Graphiques.jsx
    │   ├── Rapports.jsx
    │   └── Sites.jsx
    ├── components/
    │   └── UI.jsx
    └── utils/
        ├── store.js
        └── exportExcel.js
```

## Roadmap
- [ ] Supabase (base de données centralisée)
- [ ] Google Drive sync (OAuth2)
- [ ] Photos par tâche (caméra mobile)
- [ ] Notifications push
- [ ] Multi-utilisateurs avec rôles
