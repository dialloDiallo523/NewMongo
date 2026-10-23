 import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api";

function App() {
  const [liste, setListe] = useState([]);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");

  // Charger automatiquement les utilisateurs au démarrage
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/utilisateurs`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Erreur de récupération");
      const data = await response.json();
      setListe(data);
    } catch (err) {
      console.log("Error", err);
    }
  };

  // Connexion / Ajout automatique (Génère et stocke le JWT)
  const addListe = async (e) => {
    e.preventDefault();
    if (!nom || !prenom) {
      alert("Veuillez remplir les champs");
      return;
    }

    const newUser = { nom, prenom };

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(newUser)
      });

      if (!response.ok) throw new Error("Erreur de connexion");
      
      const data = await response.json();
      
      // Stockage du token JWT
      localStorage.setItem("token", data.token);

      // Rechargement de la liste des utilisateurs depuis le serveur
      await fetchUsers();
      
      setNom("");
      setPrenom("");
    } catch (err) {
      console.log("Error", err);
    }
  };

  // Supprimer un utilisateur (Sécurisé par le JWT)
  const deleteListe = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/utilisateurs/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");
      
      // Mise à jour de l'état local avec l'ID MongoDB (_id)
      setListe(liste.filter((i) => i._id !== id));
    } catch (err) {
      console.log("Error", err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Gestion des Utilisateurs (JWT)</h2>
      
      <form onSubmit={addListe} style={{ marginBottom: "20px" }}>
        <input 
          type="text" 
          placeholder="Nom" 
          value={nom} 
          onChange={(e) => setNom(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input 
          type="text" 
          placeholder="Prenom" 
          value={prenom} 
          onChange={(e) => setPrenom(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input type="submit" value="Ajouter / Se connecter" style={{ padding: "5px 10px" }} />
      </form>
      
      <ul>
        {liste.map((i) => (
          <li key={i._id} style={{ margin: "8px 0" }}>
            {i.nom} {i.prenom}{" "}
            <button 
              onClick={() => deleteListe(i._id)} 
              style={{ marginLeft: "10px", color: "red", cursor: "pointer" }}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;