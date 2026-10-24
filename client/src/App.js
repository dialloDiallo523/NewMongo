 import React, { useState, useEffect } from "react";

const API_URL = "https://newmongo.onrender.com/api";

function App() {
  const [liste, setListe] = useState([]);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(false); // <--- Ajout d'un état de chargement

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/utilisateurs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur de récupération");
      const data = await response.json();
      setListe(data);
    } catch (err) {
      console.log("Error", err);
    }
  };

  const addListe = async (e) => {
    e.preventDefault();
    if (!nom || !prenom) {
      alert("Veuillez remplir les champs");
      return;
    }

    const newUser = { nom, prenom };
    setLoading(true); // <--- Active le chargement

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(newUser)
      });

      if (!response.ok) throw new Error("Erreur de connexion");
      
      const data = await response.json();
      localStorage.setItem("token", data.token);
      await fetchUsers();
      
      setNom("");
      setPrenom("");
    } catch (err) {
      console.log("Error", err);
      alert("Erreur de connexion au serveur (patientez si le serveur redémarre).");
    } finally {
      setLoading(false); // <--- Désactive le chargement dans tous les cas
    }
  };

  const deleteListe = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/utilisateurs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");
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
        <input 
          type="submit" 
          value={loading ? "Chargement..." : "Ajouter / Se connecter"} 
          disabled={loading}
          style={{ padding: "5px 10px", cursor: loading ? "not-allowed" : "pointer" }} 
        />
      </form>

      {loading && <p style={{ color: "blue" }}>Connexion au serveur en cours (veuillez patienter si le serveur sort de veille)...</p>}

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