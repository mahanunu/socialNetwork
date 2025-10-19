import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import './UserStats.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const UserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users/stats`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-loading">Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="stats-error">Erreur: {error}</div>;
  }

  if (!stats) {
    return null;
  }

  // Préparer les données pour les graphiques
  const genderData = stats.genderDistribution.map(item => ({
    name: item._id === 'male' ? 'Homme' : 
          item._id === 'female' ? 'Femme' : 
          item._id || 'Non renseigné',
    value: item.count
  }));

  const monthData = stats.usersByMonth.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    utilisateurs: item.count
  }));

  const topUsersData = stats.topUsers.map(user => ({
    name: `${user.firstName} ${user.lastName}`,
    posts: user.postCount
  }));

  return (
    <div className="user-stats-container">
      <h1>Statistiques des Utilisateurs</h1>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <h3>Total Utilisateurs</h3>
            <p className="kpi-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📍</div>
          <div className="kpi-content">
            <h3>Adresses Renseignées</h3>
            <p className="kpi-value">{stats.usersWithAddress}</p>
            <p className="kpi-subtitle">{stats.addressPercentage}% des utilisateurs</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📝</div>
          <div className="kpi-content">
            <h3>Total Posts</h3>
            <p className="kpi-value">{stats.postStats.totalPosts}</p>
            <p className="kpi-subtitle">
              Moy: {stats.postStats.avgPostsPerUser.toFixed(1)} par utilisateur
            </p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">✍️</div>
          <div className="kpi-content">
            <h3>Utilisateurs Actifs</h3>
            <p className="kpi-value">{stats.postStats.usersWithPosts}</p>
            <p className="kpi-subtitle">Ont publié au moins 1 post</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Répartition par genre */}
        <div className="chart-card">
          <h2>Répartition par Genre</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Évolution des inscriptions */}
        <div className="chart-card">
          <h2>Inscriptions (6 derniers mois)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="utilisateurs" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top utilisateurs */}
        <div className="chart-card full-width">
          <h2>Top 5 Utilisateurs les Plus Actifs</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topUsersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="posts" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
