 require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "secrete";
const MONGO_URL = process.env.MONGO_URL;

// Connexion à MongoDB
mongoose.connect(MONGO_URL)
  .then(() => console.log("Connecté à MongoDB avec succès"))
  .catch((err) => console.log("Erreur de connexion MongoDB :", err));

// Schéma
const mongooseSchema = new mongoose.Schema({
    nom: String, 
    prenom: String
});

// Modèle
const User = mongoose.model("User", mongooseSchema);

// ==========================================
// MIDDLEWARE DE VÉRIFICATION DU JWT
// ==========================================
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Accès non autorisé, token manquant" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // On stocke les infos décodées de l'utilisateur dans la requête
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide ou expiré", err });
    }
};

// ==========================================
// ROUTES
// ==========================================

// Route Login / Inscription (Génère le JWT)
app.post("/api/login", async (req, res) => {
    try {
        const { nom, prenom } = req.body;
        
        if (!nom || !prenom) {
            return res.status(400).json({ message: "Le nom et le prénom sont requis" });
        }

        let user = await User.findOne({ nom, prenom });
        
        // Si l'utilisateur n'existe pas, on le crée
        if (!user) {
            user = await User.create({ nom, prenom });
        }

        // Génération du token JWT valable 24h
        const token = jwt.sign(
            { id: user._id, nom: user.nom, prenom: user.prenom }, 
            JWT_SECRET, 
            { expiresIn: "24h" }
        );

        // On renvoie un objet JSON contenant le token
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

// Obtenir tous les utilisateurs (PROTÉGÉ par JWT)
// Si vous voulez renvoyer du texte simple :
app.get('/', (req, res) => {
    res.send('Mon API fonctionne avec succès !');
});

// OU si vous préférez renvoyer du JSON (recommandé pour une API) :
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur mon API NewMongo !', status: 'en ligne' });
});
app.get("/api/utilisateurs", verifyToken, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur", err });
    }
});

// Supprimer un utilisateur par son ID (PROTÉGÉ par JWT)
app.delete("/api/utilisateurs/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", err });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Le serveur est lancé sur http://localhost:${PORT}`);
});